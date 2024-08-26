import React from "react";
import Avatar from "react-avatar";

function Client({ username, role }) {
  // Determine if the role is "teacher"
  const isTeacher = role === "teacher";

  return (
    <div className="d-flex align-items-center mb-3">
      <Avatar name={username} size={30} round="10px" className="mr-3" />
      <span
        className={isTeacher ? "text-success font-weight-bold" : "text-light"}
      >
        {username} {isTeacher && "(Teacher)"}
      </span>
    </div>
  );
}

export default Client;
