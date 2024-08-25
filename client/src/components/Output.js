import React from "react";

const Output = ({ output }) => {
  return (
    <div style={{ height: "200px" }} className="m-auto w-screen">
      <textarea
        id="realTimeOutput"
        className="bg-black h-full w-full m-auto"
        readOnly
        value={output}
        style={{ overflow: "hidden" }}
      ></textarea>
    </div>
  );
};

export default Output;
