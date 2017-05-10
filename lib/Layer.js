'use strict';

var _     = require('lodash'),
    Jimp  = require('jimp'),
    path  = require('path'),
    q     = require('q');

//// Methods
Layer.prototype.render    = renderLayer;
Layer.prototype.opacity   = setOpacity;
Layer.prototype.position  = setPosition;
Layer.prototype.size      = setSize;

module.exports = Layer;

////////

/**
 * Single layer
 */
function Layer(parent, source) {
  this.parent = parent;
  this.config = {
    source: source
  };
}

/**
 * Render the layer
 */
function renderLayer(img) {
  var self = this,
      deferred = q.defer();
  Jimp.read(path.resolve(this.config.source), function(err, layer) {
    if (err) {
      deferred.reject(err);
    } else {
      var width   = self.parent.canvas.width,
          height  = self.parent.canvas.height,
          x = 0, 
          y = 0;
      // Layer size
      if (!_.isUndefined(self.config.size)) {
        var ratio = layer.bitmap.width / layer.bitmap.height;
        switch (self.config.size) {
          case 'contain':
          case 'cover':
            if (ratio > self.parent.canvas.ratio) {
              // This means layer width is proportionally greater
              if (self.config.size === 'contain') {
                height = width / ratio;
              } else {
                width = height * ratio;
              }
            } else if (ratio < self.parent.canvas.ratio) {
              // This means layer height is proportionally greater
              if (self.config.size === 'cover') {
                width = height * ratio;
              } else {
                height = width / ratio;
              }
            }
            break;
          default:
            var size = (self.config.size || '').split(' ');
            // Reset default to auto
            width   = size[0] || 'auto';
            height  = size[1] || 'auto';
            if (width === 'auto' && height === 'auto') {
              width   = layer.bitmap.width;
              height  = layer.bitmap.height;
            }
            if (width !== 'auto') {
              var pwidth = (width.charAt(width.length - 1) === '%');
              width = parseInt(width) || 0;
              if (pwidth) {
                width = Math.round(self.parent.canvas.width * (width / 100));
              }
            }
            if (height !== 'auto') {
              var pheight = (height.charAt(height.length - 1) === '%');
              height = parseInt(height) || 0;
              if (pheight) {
                height = Math.round(self.parent.canvas.height * (height / 100));
              }
            }
            if (width === 'auto') {
              width = height * ratio;
            }
            if (height === 'auto') {
              height = width / ratio;
            }
            break;
        }
        layer.resize(width, height);
      }
      // Layer position
      if (!_.isUndefined(self.config.position)) {
        var arrpos = (self.config.position || '').split(' ');
        var hors = ['left', 'center', 'right'],
            vers = ['top', 'center', 'bottom'];
        var horizontal = {
          relative: 'left',
          distance: 0,
          percentage: false
        };
        var vertical = {
          relative: 'top',
          distance: 0,
          percentage: true
        };
        if (arrpos.length === 1) {
          if (hors.indexOf(arrpos[0]) < 0) {
            horizontal.distance   = parseInt(arrpos[0]) || 0;
            horizontal.percentage = (arrpos[0].charAt(arrpos[0].length - 1) === '%');
            vertical.distance   = horizontal.distance;
            vertical.percentage = horizontal.percentage;
          }
        }
        if (arrpos.length === 2) {
          if (hors.indexOf(arrpos[0]) >= 0 && vers.indexOf(arrpos[1]) >= 0) {
            horizontal.relative = arrpos[0];
            vertical.relative   = arrpos[1];
          } else {
            horizontal.distance   = parseInt(arrpos[0]) || 0;
            horizontal.percentage = (arrpos[0].charAt(arrpos[0].length - 1) === '%');
            vertical.distance   = parseInt(arrpos[1]) || 0;
            vertical.percentage = (arrpos[1].charAt(arrpos[1].length - 1) === '%');
          }
        }
        if (arrpos.length >= 3) {
          if (hors.indexOf(arrpos[0]) < 0) {
            throw new Error('Invalid horizontal relative value: ' + arrpos[0]);
          }
          if (vers.indexOf(arrpos[2]) < 0) {
            throw new Error('Invalid vertical relative value: ' + arrpos[2]);
          }
          horizontal.relative   = arrpos[0];
          horizontal.distance   = parseInt(arrpos[1]) || 0;
          horizontal.percentage = (arrpos[1].charAt(arrpos[1].length - 1) === '%');
          vertical.relative   = arrpos[2];
          if (arrpos.length < 4) {
            vertical.distance   = horizontal.distance;
            vertical.percentage = horizontal.percentage;
          } else {
            vertical.distance   = parseInt(arrpos[3]) || 0;
            vertical.percentage = (arrpos[3].charAt(arrpos[3].length - 1) === '%');
          }
        }
        if (horizontal.percentage) {
          horizontal.distance = Math.round(self.parent.canvas.width * (horizontal.distance / 100));
        }
        if (vertical.percentage) {
          vertical.distance = Math.round(self.parent.canvas.height * (vertical.distance / 100));
        }
        switch (horizontal.relative) {
          case 'left':
            x = horizontal.distance;
            break;
          case 'center':
            x = Math.round((self.parent.canvas.width / 2) - (width / 2));
            break;
          case 'right':
            x = self.parent.canvas.width - horizontal.distance - width;
            break;
        }
        switch (vertical.relative) {
          case 'left':
            y = vertical.distance;
            break;
          case 'center':
            y = Math.round((self.parent.canvas.height / 2) - (height / 2));
            break;
          case 'bottom':
            y = self.parent.canvas.height - vertical.distance - height;
            break;
        }
      }
      // Layer opacity
      if (!_.isUndefined(self.config.opacity)) {
        layer.opacity(self.config.opacity || 0);
      }
      // Resolve the image
      deferred.resolve(img.composite(layer, x, y));
    }
  });
  return deferred.promise;
}

/**
 * Set opacity
 */
function setOpacity(opacity) {
  this.config.opacity = opacity;
  return this;
}

/**
 * Set position
 */
function setPosition(position) {
  this.config.position = position;
  return this;
}

/**
 * Set size
 */
function setSize(size) {
  this.config.size = size;
  return this;
}