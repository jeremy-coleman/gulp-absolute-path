# gulp-absolute-path

import及びrequireのパスをルートディレクトリを基準とした絶対パスで指定できるようにします。

## Install

    $ npm install --save-dev gulp-absolute-path

## Usage

```js
const gulp =    require('gulp');
const abspath = require('gulp-absolute-path');
const ts =      require('gulp-typescript');

gulp.task('build', function ()
{
  const tsOptions = {
    target:  'es6',
    module:  'commonjs',
    jsx:     'react',
    baseUrl: './app'
  };

  return gulp
    .src(['./app/**/*.ts', './app/**/*.tsx'])
    .pipe(abspath({rootDir:'./app'}))
    .pipe(ts(tsOptions))
    .pipe(gulp.dest('./app/'));
});
```

## Example

```
+ app
|  + controllers
|  |  + api
|  |     + login
|  |        + login.ts
|  |        + valid.ts
|  + utils
|     + utils.ts
|     + slog.js
+ node_modules
```

## Before

login.ts
```
import express = require('express');
import valid from './valid';
import Utils from '../../../utils/utils';
const slog = require('../../../utils/slog');
const crypto = require('crypto');
```

## After

login.ts
```
import express = require('express');
import valid from './valid';
import Utils from 'utils/utils';
const slog = require('utils/slog');
const crypto = require('crypto');
```

## Excluded

Node.js standard modules, node_modules packages, relative path.

## Changelog

* 1.0.4
  * update packages

* 1.0.3
  * ignorePathes add domain, http2, inspector, perf_hooks

* 1.0.2
  * node_modulesパスの判定ミスを修正

* 1.0.0
  * Initial release
