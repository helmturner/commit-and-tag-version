const stringifyPackage = require('../../stringify-package')
const detectIndent = require('detect-indent')
const detectNewline = require('detect-newline')

/**
 * @param {string} contents
 * @returns {string}
 */
module.exports.readVersion = function (contents) {
  return JSON.parse(contents).version
}

/**
 * @param {string} contents
 * @param {string} version
 * @returns {string}
 */
module.exports.writeVersion = function (contents, version) {
  const json = JSON.parse(contents)
  const indent = detectIndent(contents).indent
  const newline = detectNewline(contents)
  json.version = version

  if (json.packages && json.packages['']) {
    // package-lock v2 stores version there too
    json.packages[''].version = version
  }

  return stringifyPackage(json, indent, newline)
}

/**
 * @param {string} contents
 * @returns {boolean}
 */
module.exports.isPrivate = function (contents) {
  return JSON.parse(contents).private
}
