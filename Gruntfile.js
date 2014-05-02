module.exports = function(grunt) {
    grunt.initConfig({
        ts: {
            compile: {
                src: ["lib/**/*.ts"],
                options: {
                    module: "commonjs",
                    sourceMap: false,
                    target: "es5"
                }
            }
        },
        bump: {
            files: ["package.json"],
            options: {
                createTag: false,
                commit: false,
                push: false
            }
        },
        clean: {
            js: {
                src: ["lib/**/*.js"]
            }
        }
    });
    [
        "grunt-contrib-clean",
        "grunt-bump",
        "grunt-ts"
    ].forEach(function(task) {
        grunt.loadNpmTasks(task);
    });
    grunt.registerTask("default", [
        "clean:js",
        "ts:compile",
        "bump:build"
    ]);
};