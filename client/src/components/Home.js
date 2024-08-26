import React, { useState } from "react";
import { v4 as uuid } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Home() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [teacherId, setTeacherId] = useState("");

  const navigate = useNavigate();

  const generateRoomId = (e) => {
    e.preventDefault();
    const Id = uuid();
    setRoomId(Id);
    toast.success("Room Id is generated");
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("Both the field is requried");
      return;
    }

    // redirect
    navigate(`/editor/${roomId}`, {
      state: {
        username,
        teacherId,
      },
    });
    toast.success("room is created");
  };

  // when enter then also join
  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };

  return (
    <div className="container-fluid">
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-12 col-md-6">
          <div className="card shadow-sm p-2 mb-5 bg-secondary rounded">
            <div className="card-body text-center bg-dark">
              <img
                src="/images/codecast.png"
                alt="Logo"
                className="img-fluid mx-auto d-block"
                style={{ maxWidth: "150px" }}
              />
              <h4 className="card-title text-light mb-4">JOIN AS STUDENT</h4>

              <div className="form-group flex gap-1">
                <img src="images/id.gif" alt="" className="h-[30px] w-[30px]" />
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="form-control mb-2"
                  placeholder="ROOM ID"
                  onKeyUp={handleInputEnter}
                />
              </div>
              <div className="form-group flex gap-1">
                <img
                  src="images/user.gif"
                  alt=""
                  className="h-[30px] w-[30px]"
                />

                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-control mb-2"
                  placeholder="NAME"
                  onKeyUp={handleInputEnter}
                />
              </div>
              <h4 className="card-title text-light mb-4 ">JOIN AS TEACHER</h4>

              <div className="form-group flex gap-1">
                <img
                  src="images/teacher.gif"
                  alt=""
                  className="h-[30px] w-[30px]"
                />

                <input
                  type="text"
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="form-control mb-2"
                  placeholder="TEACHER ID"
                  onKeyUp={handleInputEnter}
                />
              </div>
              <button
                onClick={joinRoom}
                className=" flex gap-2 flex-row justify-center  mx-auto rounded-md"
              >
                <img src="/images/enter.gif" className="h-[80px] width-[150px]" />
                
              </button>
              <p className="mt-3 text-light flex gap-1 justify-center items-center">
                <img
                  src="images/wrong.gif"
                  alt=""
                  className="h-[30px] w-[30px]"
                />
                Don't have a room ID? create{" "}
                <span
                  onClick={generateRoomId}
                  className=" text-success p-2"
                  style={{ cursor: "pointer" }}
                >
                  {" "}
                  New Room
                </span>
              </p>
            </div>
          </div>
          <p
            className=""
            style={{
              textAlign: "center",
              color: "white",
              fontSize: "2px",
            }}
          >
            &copy; by EX-CODER Inc. All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;
