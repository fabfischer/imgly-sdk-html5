"use strict";
/*!
 * Copyright (c) 2013-2015 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

let fs = require("fs");
import UI from "../base/ui";
import Canvas from "./lib/canvas";
import TopControls from "./lib/top-controls";

class NightUI extends UI {
  constructor (...args) {
    this._operationsMap = {};
    this._template = fs.readFileSync(__dirname + "/../../templates/night/template.jst", "utf-8");
    this._registeredControls = {};
    this._history = [];

    // The `Night` UI has a fixed operation order
    this._preferredOperationOrder = [
      // First, all operations that affect the image dimensions
      "rotation",
      "crop",
      "flip",

      // Then color operations (first filters, then fine-tuning)
      "filters",
      "contrast",
      "brightness",
      "saturation",

      // Then post-processing
      "radial-blur",
      "tilt-shift",
      "frames",
      "stickers",
      "text"
    ];

    this._paused = false;

    super(...args);
  }

  /**
   * A unique string that represents this UI
   * @type {String}
   */
  get identifier () {
    return "night";
  }

  /**
   * Prepares the UI for use
   */
  run () {
    this._registerControls();

    super.run();

    let { container } = this._options;

    this._controlsContainer = container.querySelector(".imglykit-controls");
    this._canvasControlsContainer = container.querySelector(".imglykit-canvas-controls");
    this._overviewControlsContainer = container.querySelector(".imglykit-controls-overview");

    this._handleOverview();

    this._initCanvas();
    this._initTopControls();
    this._initControls();
  }

  /**
   * Initializes the top controls
   * @private
   */
  _initTopControls () {
    this._topControls = new TopControls(this._kit, this);
    this._topControls.run();

    this._topControls.on("undo", () => {
      this.undo();
    });

    // Pass zoom in event
    this._topControls.on("zoom-in", () => {
      this._canvas.zoomIn()
        .then(() => {
          if (this._currentControl) {
            this._currentControl.onZoom();
          }
        });
    });

    // Pass zoom out event
    this._topControls.on("zoom-out", () => {
      this._canvas.zoomOut()
        .then(() => {
          if (this._currentControl) {
            this._currentControl.onZoom();
          }
        });
    });
  }

  /**
   * Inititializes the canvas
   * @private
   */
  _initCanvas () {
    this._canvas = new Canvas(this._kit, this, this._options);
    this._canvas.run();
    this._canvas.on("zoom", () => {
      this._topControls.updateZoomLevel();
    });
  }

  /**
   * Selects the enabled operations
   * @param {ImglyKit.Selector}
   */
  selectOperations (selector) {
    super.selectOperations(selector);
  }

  /**
   * Returns or creates an instance of the operation with the given identifier
   * @param {String} identifier
   */
  getOrCreateOperation (identifier) {
    let { operationsStack, registeredOperations } = this._kit;
    let Operation = registeredOperations[identifier];

    if (typeof this._operationsMap[identifier] === "undefined") {
      // Create operation
      let operationInstance = new Operation(this._kit);
      this._operationsMap[identifier] = operationInstance;

      // Find index in preferred operatino order
      let index = this._preferredOperationOrder.indexOf(identifier);
      operationsStack[index] = operationInstance;

      return operationInstance;
    } else {
      return this._operationsMap[identifier];
    }
  }

  /**
   * Removes the operation with the given identifier from the stack
   * @param {String} identifier
   */
  removeOperation (identifier) {
    if (!this._operationsMap[identifier]) return;

    let operation = this._operationsMap[identifier];
    delete this._operationsMap[identifier];

    let index = this._kit.operationsStack.indexOf(operation);
    this._kit.operationsStack.splice(index, 1);
  }

  /**
   * Registers all default operation controls
   * @private
   */
  _registerControls () {
    this.registerControl("filters", "filters", require("./controls/filters"));
    this.registerControl("rotation", "rotation", require("./controls/rotation"));
    this.registerControl("flip", "flip", require("./controls/flip"));
    this.registerControl("brightness", "brightness", require("./controls/brightness"));
    this.registerControl("contrast", "contrast", require("./controls/contrast"));
    this.registerControl("saturation", "saturation", require("./controls/saturation"));
    this.registerControl("crop", "crop", require("./controls/crop"));
    this.registerControl("radial-blur", "radial-blur", require("./controls/radial-blur"));
    this.registerControl("tilt-shift", "tilt-shift", require("./controls/tilt-shift"));
    this.registerControl("frames", "frames", require("./controls/frames"));
    this.registerControl("stickers", "stickers", require("./controls/stickers"));
    this.registerControl("text", "text", require("./controls/text"));
  }

  /**
   * Handles the overview button click events
   * @private
   */
  _handleOverview () {
    let listItems = this._overviewControlsContainer.querySelectorAll(":scope > ul > li");

    // Turn NodeList into an Array
    listItems = Array.prototype.slice.call(listItems);

    // Add click events to all items
    for (let listItem of listItems) {
      let { identifier } = listItem.dataset;
      listItem.addEventListener("click", () => {
        this._onOverviewButtonClick(identifier);
      });
    }
  }

  /**
   * Gets called when an overview button has been clicked
   * @private
   */
  _onOverviewButtonClick (identifier) {
    this._overviewControlsContainer.style.display = "none";

    if (this._currentControl) {
      this._currentControl.leave();
    }

    this._currentControl = this._registeredControls[identifier];
    this._currentControl.enter();
    this._currentControl.once("back", this._switchToOverview.bind(this));
  }

  /**
   * Switches back to the overview controls
   * @private
   */
  _switchToOverview () {
    if (this._currentControl) {
      this._currentControl.leave();
    }

    this._currentControl = null;
    this._overviewControlsContainer.style.display = "";
  }

  /**
   * Registers the controls for an operation
   * @param {String} identifier
   * @param {String} operationIdentifier
   * @param {Control} ControlClass
   */
  registerControl (identifier, operationIdentifier, ControlClass) {
    if (!this.isOperationSelected(operationIdentifier)) return;

    let instance = new ControlClass(this._kit, this);
    this._registeredControls[identifier] = instance;
  }

  /**
   * Initializes the registered controls
   * @private
   */
  _initControls () {
    for (let identifier in this._registeredControls) {
      let control = this._registeredControls[identifier];
      control.setContainers(this._controlsContainer, this._canvasControlsContainer);
      control.init();
    }
  }

  /**
   * Re-renders the canvas
   */
  render () {
    this._canvas.render();
  }

  /**
   * An object containing all active operations
   * @type {Object.<String,Operation>}
   */
  get operations () {
    return this._operationsMap;
  }

  /**
   * An object containing all registered controls
   * @type {Object.<String,Control>}
   */
  get controls () {
    return this._registeredControls;
  }

  /**
   * The data that is passed to the template renderer
   * @type {Object}
   */
  get context () {
    let context = super.context;
    context.controls = this._registeredControls;
    return context;
  }

  /**
   * Pauses the UI. Operation updates will not cause a re-rendering
   * of the canvas.
   */
  pause () {
    this._paused = true;
  }

  /**
   * Resumes the UI and re-renders the canvas
   * @param {Boolean} rerender = true
   */
  resume (rerender=true) {
    this._paused = false;
    if (rerender) {
      this.render();
    }
  }

  /**
   * Adds the given operation and options to the history stack
   * @param {Operation} operation
   * @param {Object.<String, *>} options
   * @param {Boolean} existent
   */
  addHistory (operation, options, existent) {
    this._history.push({ operation, options, existent });
    this._topControls.updateUndoButton();
  }

  /**
   * Hides the zoom control
   */
  hideZoom () {
    this._topControls.hideZoom();
  }

  /**
   * Hides the zoom control
   */
  showZoom () {
    this._topControls.showZoom();
  }

  /**
   * Takes the last history item and applies its options
   */
  undo () {
    let lastItem = this._history.pop();
    if (lastItem) {
      let { operation, existent, options } = lastItem;
      if (!existent) {
        this.removeOperation(operation.identifier);
      }
      this.canvas.zoomToFit(true);
    }
    this._topControls.updateUndoButton();
  }

  /**
   * The undo history
   * @type {Array.<Object>}
   */
  get history () {
    return this._history;
  }
}

export default NightUI;
