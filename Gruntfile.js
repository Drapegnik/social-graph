'use strict';

/**
 * Created by Drapegnik on 28.12.16.
 */

module.exports = function(grunt) {

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Automatically load required Grunt tasks
    // require('jit-grunt')(grunt);
    require('load-grunt-tasks')(grunt);

    // Project configuration.
    grunt.initConfig({
        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: ['app/styles/*.css']
                }]
            },
            server: 'app'
        },

        // Add vendor prefixed styles
        postcss: {
            options: {
                map: true,
                processors: [require('autoprefixer')]
            },
            server: {
                options: {map: true},
                files: [{
                    expand: true,
                    cwd: 'app/styles/',
                    src: '{,*/}*.css',
                    dest: 'app/styles/'
                }]
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'app/styles/',
                    src: '{,*/}*.css',
                    dest: 'app/styles/'
                }]
            }
        },

        // Compiles Sass to CSS and generates necessary files if requested
        compass: {
            options: {
                sassDir: 'app/styles',
                cssDir: 'app/styles',
                importPath: './node_modules',
                relativeAssets: false,
                assetCacheBuster: false,
                raw: 'Sass::Script::Number.precision = 10\n'
            },
            dist: {options: {}},
            server: {options: {sourcemap: true}}
        },

        // minimize .css
        cssmin: {
            target: {
                files: [{
                    expand: true,
                    cwd: 'app/styles',
                    src: ['*.css', '!*.min.css'],
                    dest: 'app/styles',
                    ext: '.min.css'
                }]
            }
        },

        // Run some tasks in parallel to speed up the build process
        concurrent: {
            server: ['compass:server'],
            test: ['compass'],
            dist: ['compass:dist']
        },

        // Make sure there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                '{,*/}*.js',
                '!node_modules/'
            ]
        }
    });

    grunt.registerTask('hint', [
        'jshint'
    ]);

    // Default task(s).
    grunt.registerTask('default', [
        'clean:dist',
        'concurrent:dist',
        'postcss',
        'cssmin'
    ]);
};