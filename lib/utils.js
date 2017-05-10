'use strict';

/**
 * Layers utilities
 */
var _     = require('lodash'),
    utils = {};

utils.inherit = inherit;

module.exports = utils;

/**
 * Inherit an object's prototype
 */
function inherit(parent, constructor) {
  constructor.prototype             = Object.create(parent.prototype);
  constructor.prototype.constructor = constructor;
  _.extend(constructor, parent);
  return constructor;
}