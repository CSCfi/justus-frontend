'use strict';

module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  var distDir = 'dist';

  grunt.initConfig({
    clean: {
      files: distDir,
      options: {
        force: true
      }
    },
    useminPrepare: {
      html: ['src/index.html'],
      options: {
        dest: distDir,
        flow: {
          steps: {
            'css': ['concat'],
            'js': ['concat']
          },
          post: {}
        }
      }
    },
    usemin: {
      html: [distDir+'/index.html']
    },
    copy: {
      src: {
        expand: true,
        cwd: 'src',
        src: [
          'index.html',
          'html/**',
          //usemin+concat: 'js/*',
          'config.js', // TODO this should be made environment specific
          'css/justus.css',
          'img/*'
        ],
        dest: distDir,
        options : {
          noProcess: '**/*.{png,gif,jpg,ico,svg}',
          process: function (content) {
            return content.replace(/<!--dev-->.*<!--enddev-->/g, '')
              .replace(/<!-- mustache/g, '')
              .replace(/end mustache -->/g, '');
          }
        }
      },
      fonts: {
        expand: true,
        flatten: true,
        cwd: 'src/bower_components',
        src: ['**/*.{ttf,woff,woff2,eot,svg,otf}'],
        dest: distDir + '/fonts'
      }
    },
    sass: {
      options: {
        sourceMap: false,
        sourceComments: false
      },
      dist: {
        files: {
          'src/css/main.css': 'src/scss/main.scss'
        }
      }
    },
    concat: {
      dist: {
        src: [
          'src/bower_components/fontawesome/css/font-awesome.css',
          'src/bower_components/angular-ui-select/dist/select.css',
          'src/css/*.css',
        ],
        dest: 'src/css/justus.css',
      }
    },
    watch: {
      files: ['**/*'],
      tasks: ['sass', 'concat'],
    },
  });

  grunt.registerTask('default', [
    'build'
  ]);

  grunt.registerTask('build', [
    'clean',
    'sass',
    'useminPrepare',
    'concat',
    'copy',
    'usemin'
  ]);

  grunt.registerTask('dev', [
    'sass',
    'concat',
    'watch'
  ]);
};
