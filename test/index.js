const gutil =   require('gulp-util');
const assert =  require('assert');
const abspath = require('../');

function testPath(from, to, args, callback) {
  const inpath =  args.inpath;
  const outpath = args.outpath || inpath;
  const input =  from + inpath  + to;
  const output = from + outpath + to;
  const stream = abspath(args.options);

  stream.on('data', function (file) {
    assert.equal(file.contents.toString(), output);
  });

  stream.on('end', callback);

  stream.write(new gutil.File({
    history: __dirname + '/../' + args.file,
    contents: new Buffer(input)
  }));

  stream.end();
}

function testImportPath(args, callback) {
  testPath("import foo from '", "';", args, callback);
}

function testRequirePath(args, callback) {
  testPath("const foo = require('", "');", args, callback);
}

/**
 * node_modules path
 */
describe('node_modules path', function() {
  it('import gulp-util', function(callback) {
    const args = {
      file:   'sub1/sub2/dummy.js',
      inpath: 'gulp-util'
    };
    testImportPath(args, callback);
  });

  it('import through2', function(callback) {
    const args = {
      file:   'sub1/sub2/dummy.js',
      inpath: 'through2'
    };
    testImportPath(args, callback);
  });
});

/**
 * Node.js standard path
 */
describe('Node.js standard path', function() {
  it('import path', function(callback) {
    const args = {
      file:   'sub1/sub2/dummy.js',
      inpath: 'path'
    };
    testImportPath(args, callback);
  });

  it('import crypto', function(callback) {
    const args = {
      file:   'sub1/sub2/dummy.js',
      inpath: 'crypto'
    };
    testImportPath(args, callback);
  });
});

/**
 * relative path
 */
describe('relative path', function() {
  it('import ../foo', function(callback) {
    const args = {
      file:   'sub1/sub2/dummy.js',
      inpath: '../foo'
    };
    testImportPath(args, callback);
  });
});

/**
 * absolute path
 */
describe('absolute path', function() {
  const args = {
    file:    'sub1/sub2/dummy.js',
    inpath:  'foo',
    outpath: '../../foo'
  };

  it('import foo', function(callback) {
    testImportPath(args, callback);
  });

  it('require foo', function(callback) {
    testRequirePath(args, callback);
  });
});

/**
 * absolute path
 */
describe('rootDir', function() {
  it('../', function(callback) {
    const args = {
      file:    'sub1/sub2/dummy.js',
      inpath:  'foo',
      outpath: '../../../foo',
      options: {rootDir:'..'}
    };
    testRequirePath(args, callback);
  });

  it('sub1/', function(callback) {
    const args = {
      file:    'sub1/sub2/dummy.js',
      inpath:  'foo',
      outpath: '../foo',
      options: {rootDir:'sub1'}
    };
    testRequirePath(args, callback);
  });

  it('sub2/', function(callback) {
    const args = {
      file:    'sub1/sub2/dummy.js',
      inpath:  'foo',
      outpath: './foo',
      options: {rootDir:'sub1/sub2'}
    };
    testRequirePath(args, callback);
  });

  it('utils/', function(callback) {
    const args = {
      file:    'sub1/sub2/dummy.js',
      inpath:  'foo',
      outpath: '../../utils/foo',
      options: {rootDir:'utils'}
    };
    testRequirePath(args, callback);
  });
});
