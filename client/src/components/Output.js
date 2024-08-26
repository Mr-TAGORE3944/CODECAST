import React, { useState } from "react";

const Output = ({ output }) => {
  const [code , setCode] = useState("");
  console.log(code);

  return (
    <div style={{ height: "200px" }} className="m-auto w-screen">
      <textarea
        id="realTimeOutput"
        className="bg-black h-full w-full m-auto text-white"
        readOnly
        value={code}
        onChange={(e)=> setCode(e.target.value)}
        style={{ overflow: "hidden" }}
      ></textarea>
    </div>
  );
};

export default Output;
