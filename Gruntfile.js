module.exports = function(grunt) {
    grunt.initConfig({
        ts: {
            compile: {
                src: ["./src/**/*.ts"],
                outDir: "./dist/",
                options: {
                    removeComments: true,
                    module: "commonjs",
                    declaration: true,
                    sourceMap: false,
                    target: "es5"
                }
            }
        },
        bump: {
            files: ["./package.json"],
            options: {
                createTag: false,
                commit: false,
                push: false
            }
        },
        clean: {
            baseDir: {
                src: ["./**/.baseDir*"]
            }
        }
    });
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-bump");
    grunt.loadNpmTasks("grunt-ts");
    grunt.registerTask("default", [
        "ts:compile",
        "bump:patch",
        "clean:baseDir"
    ]);
};