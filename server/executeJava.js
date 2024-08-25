const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputPath = path.join(__dirname, "outputs");

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const executeJava = (filepath) => {
  const jobId = path.basename(filepath, ".java");
  const classPath = path.join(outputPath, jobId);

  return new Promise((resolve, reject) => {
    exec(
      `javac ${filepath} -d ${outputPath} && java -cp ${outputPath} ${jobId}`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          reject({ error: error.message, stderr });
          return;
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          reject(stderr);
          return;
        }
        resolve(stdout);
      }
    );
  });
};

module.exports = {
  executeJava,
};
