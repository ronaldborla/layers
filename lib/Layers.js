'use strict';

var _       = require('lodash'),
    Canvas  = require('./Canvas'),
    Layer   = require('./Layer'),
    path    = require('path'),
    q       = require('q'),
    utils   = require('./utils');

utils.inherit(Array, Layers);

//// Methods
Layers.prototype.add    = addLayer;
Layers.prototype.fill   = fillCanvas;
Layers.prototype.merge  = mergeLayers;
Layers.prototype.save   = saveLayers;

module.exports = Layers;

////////

/**
 * Layers collection
 */
function Layers(width, height, ratio) {
  this.canvas = new Canvas(width, height, ratio);
}

/**
 * Add a layer
 */
function addLayer(source) {
  var layer = new Layer(this, source);
  this.push(layer);
  return layer;
}

/**
 * Fill canvas
 */
function fillCanvas(color) {
  this.canvas.fill = color;
  return this;
}

/**
 * Merge layers
 */
function mergeLayers(img, index) {
  index = index || 0;
  var self      = this,
      layer     = this[index];
  if (_.isUndefined(layer)) {
    return q.resolve(img);
  } else {
    return layer.render(img).then(function() {
      return self.merge(img, index + 1);
    });
  }
}

/**
 * Save
 */
function saveLayers(destination) {
  if (!this.length) {
    throw new Error('Must have at least one layer');
  }
  var self = this,
      deferred  = q.defer();
  // Render canvas first
  this.canvas.render().then(function(img) {
    self.merge(img).then(function(img) {
      img.write(path.resolve(destination), function(err) {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(img);
        }
      });
    }).catch(deferred.reject);
  }).catch(deferred.reject);
  return deferred.promise;
}