/* global ImglyKit */
"use strict";
window.onload = function() {

  var image = new Image();
  image.src = "test.jpg";

  image.onload = function () {
    /*
     * Initialize ImglyKit
     */
    var kit = new ImglyKit({
      image: image, // Has to be an instance of Image!
      renderer: "canvas", // Defaults to "webgl", uses "canvas" as fallback
      assetsUrl: "../../build/assets", // The URL / path where all assets are
      container: document.querySelector("#container"),
      ui: true, // Disable the UI, we use the low level API here
      renderOnWindowResize: true // Our editor's size is relative to the window size
    });

    // kit.ui.selectOperations({ only: "filters,crop" });

    kit.run();

    // kit.operationsStack.push(new ImglyKit.Operations.FiltersOperation(kit, {
    //   filter: ImglyKit.Filters.Breeze
    // }));

    // kit.operationsStack.push(new ImglyKit.Operations.CropRotationOperation(kit, {
    //   start: new ImglyKit.Vector2(0.1, 0.1),
    //   end: new ImglyKit.Vector2(0.9, 0.9)
    // }));

    // kit.render("image", null, "800x800")
    //   .then(function (image) {
    //     document.body.appendChild(image);
    //   });

    window.kit = kit;
  };
};
