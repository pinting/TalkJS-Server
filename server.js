new require("./dist/main")({
    ip: process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1",
    port: process.env.OPENSHIFT_NODEJS_PORT || 8000,
    log: 2
});