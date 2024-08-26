import React, { useEffect, useRef, useState } from "react";
import Client from "./Client";
import axios from "axios";
import Editor from "./Editor";
import { initSocket } from "../Socket";
import { ACTIONS } from "../Actions";
import "../App.css";
import {
  useNavigate,
  useLocation,
  Navigate,
  useParams,
} from "react-router-dom";
import { toast } from "react-hot-toast";
import Output from "./Output";

function EditorPage() {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [clients, setClients] = useState([]);
  const codeRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();
  const socketRef = useRef(null);
  const videoRef = useRef(null);
  const peersRef = useRef({});

  const teacherId = location.state?.teacherId;
  const currentUsername = location.state?.username;
  const currentRole = location.state?.teacherId ? "teacher" : "student"; // Determine role based on teacherId

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      const handleErrors = (err) => {
        console.log("Error", err);
        toast.error("Socket connection failed, Try again later");
        navigate("/");
      };

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: currentUsername,
        role: currentRole, // Send the role when joining
      });

      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== currentUsername) {
            toast.success(`${username} joined the room.`);
          }
          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      );

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room`);
        setClients((prev) =>
          prev.filter((client) => client.socketId !== socketId)
        );
      });

      // Video Conference Setup
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      videoRef.current.srcObject = localStream;

      socketRef.current.on(ACTIONS.OFFER, async ({ offer, from }) => {
        const peerConnection = createPeerConnection(from);
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer)
        );
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socketRef.current.emit(ACTIONS.ANSWER, { answer, to: from });
      });

      socketRef.current.on(ACTIONS.ANSWER, async ({ answer, from }) => {
        const peerConnection = peersRef.current[from];
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      });

      socketRef.current.on(ACTIONS.ICE_CANDIDATE, ({ candidate, from }) => {
        const peerConnection = peersRef.current[from];
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      });

      clients.forEach(({ socketId }) => {
        if (socketId !== socketRef.current.id) {
          const peerConnection = createPeerConnection(socketId);
          localStream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, localStream);
          });
          peerConnection.createOffer().then((offer) => {
            peerConnection.setLocalDescription(offer);
            socketRef.current.emit(ACTIONS.OFFER, { offer, to: socketId });
          });
        }
      });
    };

    const createPeerConnection = (socketId) => {
      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit(ACTIONS.ICE_CANDIDATE, {
            candidate: event.candidate,
            to: socketId,
          });
        }
      };

      peerConnection.ontrack = (event) => {
        const remoteVideo = document.createElement("video");
        remoteVideo.srcObject = event.streams[0];
        remoteVideo.autoplay = true;
        remoteVideo.playsInline = true;
        remoteVideo.classList.add("remote-video");
        document.getElementById("video-container").appendChild(remoteVideo);
      };

      peersRef.current[socketId] = peerConnection;
      return peerConnection;
    };

    init();

    return () => {
      socketRef.current && socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
    };
  }, [currentUsername, currentRole, navigate, roomId, teacherId]);

  if (!location.state) {
    return <Navigate to="/" />;
  }

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID is copied");
    } catch (error) {
      console.log(error);
      toast.error("Unable to copy the Room ID");
    }
  };

  const leaveRoom = () => {
    navigate("/");
  };

  return (
    <div className="container-fluid vh-100 scrollBar">
      <div className="row h-100">
        <div
          className="col-md-2 bg-dark text-light d-flex flex-column h-100"
          style={{ boxShadow: "2px 0px 4px rgba(0, 0, 0, 0.1)" }}
        >
          <div className="flex justify-center items-center">
            <img src="/images/user.gif" alt="" className="h-[20px] w-[20px]" />
            <p className="text-red-500 text-[3px] ml-2 my-auto">
              {currentUsername}
            </p>
          </div>
          <div className="flex flex-row justify-center items-center gap-2">
            <img src="/images/live.gif" alt="" className="h-[20px] w-[20px]" />
            <img
              src="/images/codecastIn.png"
              alt="Logo"
              height={50}
              width={70}
              className="img-fluid my-1 h-[50px]"
            />
          </div>
          <hr style={{ marginTop: "-3rem" }} className="mt-1" />
          <div className="d-flex flex-column flex-grow-1 overflow-auto">
            <span className="mb-2">Members</span>
            {clients.map((client) => (
              <Client
                key={client.socketId}
                username={client.username}
                role={client.role}
              />
            ))}
          </div>
          <hr />
          <div className="mt-auto flex flex-col">
            <button className="btn btn-success" onClick={copyRoomId}>
              Copy Room ID
            </button>
            <button
              className="btn btn-danger mt-2 mb-2 px-3 btn-block"
              onClick={leaveRoom}
            >
              Leave Room
            </button>
          </div>
        </div>
        <div className="col-md-10 text-light d-flex flex-column h-100">
          <div className="editor-container">
            <div className="editor-panel">
              <Editor
                socketRef={socketRef}
                roomId={roomId}
                setCode={setCode}
                onCodeChange={(code) => {
                  codeRef.current = code;
                }}
                isEditable={currentRole === "teacher"}
              />
            </div>
            <div className="output-panel">
              <Output output={output} />
            </div>
          </div>
          <div id="video-container" className="video-container">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="local-video"
            ></video>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditorPage;
