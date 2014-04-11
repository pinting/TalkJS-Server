var child = new (require("forever-monitor").Monitor)("server.js", {
    errFile: "logs/error.txt",
    logFile: "logs/log.txt",
    outFile: "logs/out.txt",
    spinSleepTime: 5000,
    minUptime: 10000,
    command: "node",
    silent: true,
    options: []
});
child.on("start", function() {
    console.log("Server has started");
});
child.on("restart", function() {
    console.log("Server has restarted");
});
child.on("exit", function() {
    console.log("Server has stopped");
});
child.start();