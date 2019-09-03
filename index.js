'use strict';

const through = require('through2');
const FS =      require('fs');
const Path =    require('path');

const {builtinModules} = require('module')

module.exports = function (options) {
  options = options || {};
  const ignorePathes = builtinModules

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

          const modulesPath = Path.resolve('./node_modules/' + path);
          if (FS.existsSync(modulesPath)) {
            break;
          }

          const rootDir = options.rootDir || '.';
          path = rootDir + '/' + line.substring(fromPos + from.length, toPos);
          path = Path.resolve('./' + path);
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

      file.contents = Buffer.from(newLines.join('\n'));
    }

    this.push(file);
    callback();
  }

  return through.obj(transform);
};
