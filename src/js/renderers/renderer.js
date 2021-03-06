/*jshint unused:false */
"use strict";
/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

import Vector2 from "../lib/math/vector2";
import EventEmitter from "../lib/event-emitter";

/**
 * @class
 * @alias ImglyKit.Renderer
 * @param {Vector2} dimensions
 * @private
 */
class Renderer extends EventEmitter {
  constructor (dimensions, canvas) {
    super();

    /**
     * @type {Canvas}
     * @private
     */
    this._canvas = canvas || this.createCanvas();

    if (!canvas) {
      this.setSize(dimensions);
    }

    /**
     * @type {RenderingContext}
     * @private
     */
    this._context = this._getContext();

    /**
     * The texture / image data cache
     * @type {Object.<String, *>}
     */
    this._cache = {};
  }

  /**
   * A unique string that identifies this renderer
   * @type {String}
   */
  get identifier () {
    return null;
  }

  /**
   * Checks whether this type of renderer is supported in the current environment
   * @abstract
   * @returns {boolean}
   */
  static isSupported () {
    /* istanbul ignore next */
    throw new Error("Renderer#isSupported is abstract and not implemented in inherited class.");
  }

  /**
   * Caches the current canvas content for the given identifier
   * @param {String} identifier
   */
  cache (identifier) {}

  /**
   * Draws the stored texture / image data for the given identifier
   * @param {String} identifier
   */
  drawCached (identifier) {}

  /**
   * Creates a new canvas
   * @param {Number} [width]
   * @param {Number} [height]
   * @return {Canvas}
   * @private
   */
  createCanvas (width, height) {
    var isBrowser = typeof window !== "undefined";
    var canvas;
    if (isBrowser) {
      /* istanbul ignore next */
      canvas = document.createElement("canvas");
    } else {
      var Canvas = require("canvas");
      canvas = new Canvas();
    }

    // Apply width
    if (typeof width !== "undefined") {
      canvas.width = width;
    }

    // Apply height
    if (typeof height !== "undefined") {
      canvas.height = height;
    }

    return canvas;
  }

  /**
   * Returns the current size of the canvas
   * @return {Vector2}
   */
  getSize () {
    return new Vector2(this._canvas.width, this._canvas.height);
  }

  /**
   * Sets the canvas dimensions
   * @param {Vector2} dimensions
   */
  setSize (dimensions) {
    this._canvas.width = dimensions.x;
    this._canvas.height = dimensions.y;
  }

  /**
   * Gets the rendering context from the Canva
   * @return {RenderingContext}
   * @abstract
   */
  _getContext () {
    /* istanbul ignore next */
    throw new Error("Renderer#_getContext is abstract and not implemented in inherited class.");
  }

  /**
   * Resizes the current canvas picture to the given dimensions
   * @param  {Vector2} dimensions
   * @return {Promise}
   * @abstract
   */
  resizeTo (dimensions) {
    /* istanbul ignore next */
    throw new Error("Renderer#resizeTo is abstract and not implemented in inherited class.");
  }

  /**
   * Draws the given image on the canvas
   * @param  {Image} image
   * @abstract
   */
  drawImage (image) {
    /* istanbul ignore next */
    throw new Error("Renderer#drawImage is abstract and not implemented in inherited class.");
  }

  /**
   * Gets called after the stack has been rendered
   * @param  {Image} image
   */
  renderFinal () {}

  /**
   * Returns the canvas
   * @return {Canvas}
   */
  getCanvas () {
    return this._canvas;
  }

  /**
   * Returns the context
   * @return {RenderingContext}
   */
  getContext () {
    return this._context;
  }

  /**
   * Sets the current canvas to the given one
   * @param {Canvas} canvas
   */
  setCanvas (canvas) {
    this._canvas = canvas;
    this._context = this._getContext();

    this.emit("new-canvas", this._canvas);
  }

  /**
   * Sets the current context to the given one
   * @param {RenderingContext2D} context
   */
  setContext (context) {
    this._context = context;
  }

  /**
   * Resets the renderer
   */
  reset () {

  }
}

export default Renderer;
