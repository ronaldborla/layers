'use strict';

var Jimp  = require('jimp'),
    q     = require('q');

//// Methods
Canvas.prototype.render = renderCanvas;

module.exports = Canvas;

////////

/**
 * The base canvas
 * This is the empty rectangular frame of the layers
 */
function Canvas(width, height, ratio) {
  this.width  = width   || 0;
  this.height = height  || 0;
  this.ratio  = ratio   || (4 / 3);
  this.fill   = 0x00000000;
  // Requirements
  if (this.width < 0 || this.height < 0) {
    throw new Error('Width and height must be a non-negative integer');
  }
  if (!this.width && !this.height) {
    throw new Error('Either width or height must have a value');
  }
  if ((!this.width || !this.height) && !this.ratio) {
    throw new Error('You must provide a ratio');
  }
  // If there's dimensions
  if (this.width || this.height) {
    this.ratio = this.width / this.height;
  } else if (this.width && !this.height) {
    this.height = this.width / this.ratio;
  } else if (!this.width && this.height) {
    this.width = this.height * this.ratio;
  }
}

/**
 * Render canvas
 */
function renderCanvas() {
  var deferred  = q.defer();
  var img = new Jimp(this.width, this.height, this.fill, function(err, img) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(img);
    }
  });
  return deferred.promise;
}