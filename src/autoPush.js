const { exec } = require("child_process");

setInterval(() => {
  exec("git add . && git commit -m \"auto update\" && git push", (err) => {
    if (err) return;
    console.log("Auto pushed");
  });
}, 10000); // every 10 seconds