'use strict';

const through = require('through2');
const FS =      require('fs');
const Path =    require('path');

module.exports = function (options) {
  options = options || {};
  const ignorePathes = [
    'assert',
    'buffer',
    'child_process',
    'cluster',
    'console',
    'crypto',
    'dgram',
    'dns',
    'events',
    'fs',
    'http',
    'https',
    'net',
    'os',
    'path',
    'querystring',
    'readline',
    'repl',
    'stream',
    'string_decoder',
    'tls',
    'tty',
    'url',
    'util',
    'v8',
    'vm',
    'zlib'
  ];

  function transform(file, encoding, callback) {
    if (file.isStream()) {
      throw new Error('gulp-absolute-path: streaming not supported.');
    }

    if (file.isBuffer()) {
      const text = file.contents.toString('utf8');
      const lines = text.split('\n');

      const newLines = lines.map(function(line) {
        var from = " from '";
        var to = "';";
        var fromPos = line.indexOf(from);

        do {
          if (fromPos < 0) {
            from = " require('";
            to = "');";
            fromPos = line.indexOf(from);
          }

          if (fromPos < 0) {
            break;
          }

          const toPos = line.indexOf(to, fromPos);

          if (toPos < 0) {
            break;
          }

          const subPos = line.indexOf('/', fromPos);
          var path = line.substring(fromPos + from.length, (subPos > 0 ? subPos : toPos));

          if (path.charAt(0) === '.') {
            break;
          }

          if (ignorePathes.indexOf(path) >= 0) {
            break;
          }

          var modulesParentPath;
          var modulesPath;

          if (__dirname.indexOf('/node_modules/') > 0) {
            modulesParentPath = '../..';
            modulesPath = '..';
          } else {
            modulesParentPath = '.';
            modulesPath = './node_modules';
          }

          modulesPath = Path.resolve(modulesPath + '/' + path);
//        console.log(modulesPath);

          if (FS.existsSync(modulesPath)) {
            break;
          }

          const rootDir = options.rootDir || '.';
          path = rootDir + '/' + line.substring(fromPos + from.length, toPos);
          path = Path.resolve(modulesParentPath + '/' + path);
          path = Path.relative(
            Path.dirname(file.history.toString()),
            path);

          if (path.charAt(0) !== '.') {
            path = './' + path;
          }

          line = line.substring(0, fromPos) + from + path + to;
          line = line.replace(/\\/g, '/');
        }
        while (false);

        return line;
      });

      file.contents = new Buffer(newLines.join('\n'));
    }

    this.push(file);
    callback();
  }

  return through.obj(transform);
};
