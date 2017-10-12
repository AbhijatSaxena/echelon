module.exports = function(grunt) {
    grunt.initConfig({
        jshint: {
            all: ['server.js']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('test', ['jshint']);
};