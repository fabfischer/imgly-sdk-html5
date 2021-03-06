/* global describe, it, beforeEach */
/*jshint -W083 */
"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var path = require("path");
var fs = require("fs");
var canvas = require("canvas");
var ImglyKit = require("../..");
var FiltersOperation = ImglyKit.Operations.Filters;
var dummyFiltersOperation = new FiltersOperation(new ImglyKit({ image: null, ui: false }));
var kit, image, filtersOperation;

beforeEach(function () {
  image = new canvas.Image();
  var imagePath = path.resolve(__dirname, "../assets/test.png");
  var buffer = fs.readFileSync(imagePath);
  image.src = buffer;

  kit = new ImglyKit({ image: image, ui: false });
  filtersOperation = dummyFiltersOperation;
  filtersOperation.kit = kit;
  kit.operationsStack.push(filtersOperation);
});

describe("FiltersOperation", function () {

  describe("with no selected filter", function () {

    it("rendering should pass (default filter is identity)", function (done) {

      kit.render()
        .then(function () {
          done();
        });

    });

  });

  describe("#setFilter", function () {

    describe("with an unknown identifier", function () {

      it("should throw an error", function () {
        var throwable = function () {
          filtersOperation.setFilter("foobarbaz");
        };
        throwable.should.throw();
      });

    });

  });

  describe("#render", function () {

    for (var id in dummyFiltersOperation._filters) {
      (function (identifier) {
        it("should work with " + identifier + " filter", function(done) {
          filtersOperation.setFilter(identifier);

          kit.render()
            .then(function () {
              done();
            })
            .catch(function (err) {
              throw err;
            });
        });
      })(id);
    }

  });

});
