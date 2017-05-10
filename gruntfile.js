'use strict';

// Grunt
module.exports = function(grunt) {
  // Project Configuration
  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: true,
      },
      server: [
        'index.js',
        'lib/**/*.js'
      ]
    },
    watch: {
      options: {
        debounceDelay: 100,
        interrupt: true
      },
      main: {
        files: [
          'index.js',
          'lib/**/*.js'
        ],
        tasks: ['jshint']
      }
    }
  });

  // Load NPM tasks
  require('load-grunt-tasks')(grunt);

  // Run the project in development mode
  grunt.registerTask('default', [
    'jshint',
    'watch'
  ]);
};