"use strict";

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var async = require('async');
var chalk = require('chalk');
var filesize = require('filesize');
var Optimizer = require('./lib/optimizer');

module.exports = function (grunt) {
  grunt.registerMultiTask('image', 'Optimize PNG, JPEG, GIF images.', function() {

    var done = this.async();
    var options = this.options({
      pngquant: true,
      optipng: true,
      advpng: true,
      zopflipng: true,
      pngcrush: true,
      pngout: true,
      jpegtran: true,
      jpegRecompress: true,
      jpegoptim: true,
      gifsicle: true,
      svgo: true
    });

    async.eachLimit(this.files, 10, function (file, next) {

      // make directory if does not exist
      mkdirp.sync(path.dirname(file.dest));
      
      // copy src file to dest
      fs.createReadStream(file.src[0]).pipe(fs.createWriteStream(file.dest));

      var optimizer = new Optimizer({
        src: file.src[0],
        dest: file.dest,
        options: options
      });

      optimizer.optimize(function (error, data) {
        if (error) {
          grunt.warn(error);
          return next(error);
        }
        grunt.log.writeln(
          chalk.green('✔ ') + file.src[0] + chalk.gray(' ->') +
          chalk.gray(' before=') + chalk.yellow(filesize(data.original)) +
          chalk.gray(' after=') + chalk.cyan(filesize(data.optimized)) +
          chalk.gray(' reduced=') + chalk.green.underline(filesize(data.diff) + '(' + data.diffPercent + '%)')
        );
        next();
      });
    }, function (error) {
      if (error) {
        grunt.warn(error);
        return done(error);
      }
      done();
    });
  });
};
