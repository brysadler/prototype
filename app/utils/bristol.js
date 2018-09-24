const bristol = require('bristol')
const { logging } = require('config')

bristol
  .addTarget(logging.target, logging.options || {})
  .withFormatter(logging.formatter)

bristol.setGlobal('app', 'prototype')
bristol.setGlobal('env', process.env.NODE_ENV)

module.exports = bristol
