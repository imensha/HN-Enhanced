module.exports = (grunt) ->

  grunt.initConfig
    concat:
      coffee:
        src: [
          'src/Globals.coffee'
          'src/$.coffee'
          'src/Ajax.coffee'
          'src/Post.coffee'
          'src/User.coffee'
          'src/Main.coffee'
        ]
        dest: 'tmp-userscript/script.coffee'
      userscript:
        src: [
          'src/Meta/metadata.js'
          'tmp-userscript/script.js'
        ]
        dest: 'dist/HN_Enhanced.user.js'
    coffee:
      userscript:
        src: 'tmp-userscript/script.coffee'
        dest: 'tmp-userscript/script.js'
    clean:
      userscript: 'tmp-userscript'
    watch:
      source:
        files: ['src/**/*.coffee']
        tasks: ['build']
        options:
          interrupt: true

  require('load-grunt-tasks') grunt

  grunt.registerTask 'default', ['build']
  # TODO add Chrome extension build task to build tasks
  grunt.registerTask 'build', ['userscript']
  grunt.registerTask 'userscript', ['concat:coffee', 'coffee:userscript', 'concat:userscript', 'clean:userscript']
  # TODO create Chrome extension build task
