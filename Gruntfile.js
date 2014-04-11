module.exports = function(grunt) {
    grunt.initConfig({
        jshint: {
            all: [
                "Gruntfile.js",
                "server.js",
                "index.js"
            ],
            options: {
                force: true
            }
        }
    });
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.registerTask("debug", ["jshint"]);
};