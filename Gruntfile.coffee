module.exports = (grunt) ->

  grunt.initConfig
    concat:
      coffee:
        src: [
          'src/Globals.coffee'
          'src/$.coffee'
          'src/Ajax.coffee'
          'src/Post.coffee'
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

  require('load-grunt-tasks') grunt

  grunt.registerTask 'default', ['userscript']
  grunt.registerTask 'userscript', ['concat:coffee', 'coffee:userscript', 'concat:userscript', 'clean:userscript']
