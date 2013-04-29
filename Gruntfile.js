module.exports = function(grunt){
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask("default", "watch");

  grunt.initConfig({
    mocha: {
      all: {
        src: ['test/client/run.html'],
        run: true
      }
    },

    watch: {
      mocha: {
        files: ['*.js', 'test/*.js'],
        tasks: ['mocha']
      }
    }
  });
}
