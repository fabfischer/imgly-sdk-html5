"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var Primitive = require("./primitive");
var Utils = require("../../../lib/utils");

/**
 * Desaturation primitive
 * @class
 * @alias ImglyKit.Filter.Primitives.Desaturation
 * @extends {ImglyKit.Filter.Primitive}
 */
var Desaturation = Primitive.extend({
  constructor: function () {
    Primitive.apply(this, arguments);

    if (typeof this._options.desaturation === "undefined") {
      this._options.desaturation = 0;
    }
  }
});

/**
 * The fragment shader for this primitive
 * @return {String}
 * @private
 */
Desaturation.prototype._fragmentShader = Utils.shaderString(function() {/*webgl

  precision mediump float;
  varying vec2 v_texCoord;
  uniform sampler2D u_image;
  uniform float u_desaturation;

  const vec3 luminanceWeighting = vec3(0.2125, 0.7154, 0.0721);

  void main() {
    vec3 texColor = texture2D(u_image, v_texCoord).xyz;
    vec3 grayXfer = vec3(0.3, 0.59, 0.11);
    vec3 gray = vec3(dot(grayXfer, texColor));
    gl_FragColor = vec4(mix(texColor, gray, u_desaturation), 1.0);
  }

*/});

/**
 * Renders the primitive (WebGL)
 * @param  {WebGLRenderer} renderer
 * @return {Promise}
 */
/* istanbul ignore next */
Desaturation.prototype.renderWebGL = function(renderer) {
  renderer.runShader(null, this._fragmentShader, {
    uniforms: {
      u_desaturation: { type: "f", value: this._options.desaturation }
    }
  });
};

/**
 * Renders the primitive (Canvas)
 * @param  {CanvasRenderer} renderer
 */
Desaturation.prototype.renderCanvas = function(renderer) {
  var canvas = renderer.getCanvas();
  var imageData = renderer.getContext().getImageData(0, 0, canvas.width, canvas.height);
  var desaturation = this._options.desaturation;

  for (var x = 0; x < canvas.width; x++) {
    for (var y = 0; y < canvas.height; y++) {
      var index = (canvas.width * y + x) * 4;

      var luminance = imageData.data[index] * 0.3 + imageData.data[index + 1] * 0.59 + imageData.data[index + 2] * 0.11;
      imageData.data[index] = luminance * (1 - desaturation) + (imageData.data[index] * desaturation);
      imageData.data[index + 1] = luminance * (1 - desaturation) + (imageData.data[index + 1] * desaturation);
      imageData.data[index + 2] = luminance * (1 - desaturation) + (imageData.data[index + 2] * desaturation);
    }
  }

  renderer.getContext().putImageData(imageData, 0, 0);
};

module.exports = Desaturation;
