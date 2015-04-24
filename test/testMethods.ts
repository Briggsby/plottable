///<reference path="testReference.ts" />

module TestMethods {

  export function generateSVG(width = 400, height = 400): D3.Selection {
    var parent: D3.Selection = TestMethods.getSVGParent();
    return parent.append("svg").attr("width", width).attr("height", height).attr("class", "svg");
  }

  export function getSVGParent(): D3.Selection {
    var mocha = d3.select("#mocha-report");
    if (mocha.node() != null) {
      var suites = mocha.selectAll(".suite");
      var lastSuite = d3.select(suites[0][suites[0].length - 1]);
      return lastSuite.selectAll("ul");
    } else {
      return d3.select("body");
    }
  }

  export function verifySpaceRequest(sr: Plottable._SpaceRequest, w: number, h: number, ww: boolean, wh: boolean, message: string) {
    assert.equal(sr.width, w, message + " (space request: width)");
    assert.equal(sr.height, h, message + " (space request: height)");
    assert.equal(sr.wantsWidth, ww, message + " (space request: wantsWidth)");
    assert.equal(sr.wantsHeight, wh, message + " (space request: wantsHeight)");
  }

  export function fixComponentSize(c: Plottable.Component.AbstractComponent, fixedWidth?: number, fixedHeight?: number) {
    c._requestedSpace = function(w, h) {
      return {
        width: fixedWidth == null ? 0 : fixedWidth,
        height: fixedHeight == null ? 0 : fixedHeight,
        wantsWidth: fixedWidth == null ? false : w < fixedWidth,
        wantsHeight: fixedHeight == null ? false : h < fixedHeight
      };
    };
    (<any> c)._fixedWidthFlag = fixedWidth == null ? false : true;
    (<any> c)._fixedHeightFlag = fixedHeight == null ? false : true;
    return c;
  }

  export function makeFixedSizeComponent(fixedWidth?: number, fixedHeight?: number) {
    return fixComponentSize(new Plottable.Component.AbstractComponent(), fixedWidth, fixedHeight);
  }

  export function getTranslate(element: D3.Selection) {
    return d3.transform(element.attr("transform")).translate;
  }

  export function assertBBoxEquivalence(bbox: SVGRect, widthAndHeightPair: number[], message: string) {
    var width = widthAndHeightPair[0];
    var height = widthAndHeightPair[1];
    assert.equal(bbox.width, width, "width: " + message);
    assert.equal(bbox.height, height, "height: " + message);
  }

  export function assertBBoxInclusion(outerEl: D3.Selection, innerEl: D3.Selection) {
    var outerBox = outerEl.node().getBoundingClientRect();
    var innerBox = innerEl.node().getBoundingClientRect();
    assert.operator(Math.floor(outerBox.left), "<=", Math.ceil(innerBox.left) + window.Pixel_CloseTo_Requirement,
      "bounding rect left included");
    assert.operator(Math.floor(outerBox.top), "<=", Math.ceil(innerBox.top) + window.Pixel_CloseTo_Requirement,
      "bounding rect top included");
    assert.operator(Math.ceil(outerBox.right) + window.Pixel_CloseTo_Requirement, ">=", Math.floor(innerBox.right),
      "bounding rect right included");
    assert.operator(Math.ceil(outerBox.bottom) + window.Pixel_CloseTo_Requirement, ">=", Math.floor(innerBox.bottom),
      "bounding rect bottom included");
  }

  export function assertBBoxNonIntersection(firstEl: D3.Selection, secondEl: D3.Selection) {
    var firstBox = firstEl.node().getBoundingClientRect();
    var secondBox = secondEl.node().getBoundingClientRect();

    var intersectionBox = {
      left: Math.max(firstBox.left, secondBox.left),
      right: Math.min(firstBox.right, secondBox.right),
      bottom: Math.min(firstBox.bottom, secondBox.bottom),
      top: Math.max(firstBox.top, secondBox.top)
    };

    // +1 for inaccuracy in IE
    assert.isTrue(intersectionBox.left + 1 >= intersectionBox.right || intersectionBox.bottom + 1 >= intersectionBox.top,
      "bounding rects are not intersecting");
  }

  export function assertPointsClose(actual: Plottable.Point, expected: Plottable.Point, epsilon: number, message: String) {
    assert.closeTo(actual.x, expected.x, epsilon, message + " (x)");
    assert.closeTo(actual.y, expected.y, epsilon, message + " (y)");
  };

  export function assertWidthHeight(el: D3.Selection, widthExpected: number, heightExpected: number, message: string) {
    var width = el.attr("width");
    var height = el.attr("height");
    assert.equal(width, widthExpected, "width: " + message);
    assert.equal(height, heightExpected, "height: " + message);
  }

  export function makeLinearSeries(n: number): { x: number; y: number }[] {
    function makePoint(x: number) {
      return { x: x, y: x };
    }
    return d3.range(n).map(makePoint);
  }

  export function makeQuadraticSeries(n: number): { x: number; y: number }[] {
    function makeQuadraticPoint(x: number) {
      return { x: x, y: x * x };
    }
    return d3.range(n).map(makeQuadraticPoint);
  }

  // for IE, whose paths look like "M 0 500 L" instead of "M0,500L"
  export function normalizePath(pathString: string) {
    return pathString.replace(/ *([A-Z]) */g, "$1").replace(/ /g, ",");
  }

  export function numAttr(s: D3.Selection, a: string) {
    return parseFloat(s.attr(a));
  }

  export function triggerFakeUIEvent(type: string, target: D3.Selection) {
    var e = <UIEvent> document.createEvent("UIEvents");
    e.initUIEvent(type, true, true, window, 1);
    target.node().dispatchEvent(e);
  }

  export function triggerFakeMouseEvent(type: string, target: D3.Selection, relativeX: number, relativeY: number, button = 0) {
    var clientRect = target.node().getBoundingClientRect();
    var xPos = clientRect.left + relativeX;
    var yPos = clientRect.top + relativeY;
    var e = <MouseEvent> document.createEvent("MouseEvents");
    e.initMouseEvent(type, true, true, window, 1,
      xPos, yPos,
      xPos, yPos,
      false, false, false, false,
      button, null);
    target.node().dispatchEvent(e);
  }

  export function triggerFakeDragSequence(target: D3.Selection, start: Plottable.Point, end: Plottable.Point) {
    triggerFakeMouseEvent("mousedown", target, start.x, start.y);
    triggerFakeMouseEvent("mousemove", target, end.x, end.y);
    triggerFakeMouseEvent("mouseup", target, end.x, end.y);
  }

  export function triggerFakeWheelEvent(type: string, target: D3.Selection, relativeX: number, relativeY: number, deltaY: number) {
    var clientRect = target.node().getBoundingClientRect();
    var xPos = clientRect.left + relativeX;
    var yPos = clientRect.top + relativeY;
    var event: WheelEvent;
    if (Plottable._Util.Methods.isIE()) {
      event = document.createEvent("WheelEvent");
      event.initWheelEvent("wheel", true, true, window, 1, xPos, yPos, xPos, yPos, 0, null, null, 0, deltaY, 0, 0);
    } else {
      // HACKHACK anycasting constructor to allow for the dictionary argument
      // https://github.com/Microsoft/TypeScript/issues/2416
      event = new (<any> WheelEvent)("wheel", { bubbles: true, clientX: xPos, clientY: yPos, deltaY: deltaY });
    }

    target.node().dispatchEvent(event);
  }

  export function triggerFakeTouchEvent(type: string, target: D3.Selection, relativeX: number, relativeY: number) {
    var targetNode = target.node();
    var clientRect = targetNode.getBoundingClientRect();
    var xPos = clientRect.left + relativeX;
    var yPos = clientRect.top + relativeY;
    var e = <TouchEvent> document.createEvent("UIEvent");
    e.initUIEvent(type, true, true, window, 1);
    var fakeTouch: Touch = {
      identifier: 0,
      target: targetNode,
      screenX: xPos,
      screenY: yPos,
      clientX: xPos,
      clientY: yPos,
      pageX: xPos,
      pageY: yPos
    };

    var fakeTouchList: any = [fakeTouch];
    fakeTouchList.item = (index: number) => fakeTouchList[index];
    e.touches = <TouchList> fakeTouchList;
    e.targetTouches = <TouchList> fakeTouchList;
    e.changedTouches = <TouchList> fakeTouchList;

    e.altKey = false;
    e.metaKey = false;
    e.ctrlKey = false;
    e.shiftKey = false;
    target.node().dispatchEvent(e);
  }

  export function assertAreaPathCloseTo(actualPath: string, expectedPath: string, precision: number, msg: string) {
    var actualAreaPathStrings = actualPath.split("Z");
    var expectedAreaPathStrings = expectedPath.split("Z");

    actualAreaPathStrings.pop();
    expectedAreaPathStrings.pop();

    var actualAreaPathPoints = actualAreaPathStrings.map((path) => path.split(/[A-Z]/).map((point) => point.split(",")));
    actualAreaPathPoints.forEach((areaPathPoint) => areaPathPoint.shift());
    var expectedAreaPathPoints = expectedAreaPathStrings.map((path) => path.split(/[A-Z]/).map((point) => point.split(",")));
    expectedAreaPathPoints.forEach((areaPathPoint) => areaPathPoint.shift());

    assert.lengthOf(actualAreaPathPoints, expectedAreaPathPoints.length, "number of broken area paths should be equal");
    actualAreaPathPoints.forEach((actualAreaPoints, i) => {
      var expectedAreaPoints = expectedAreaPathPoints[i];
      assert.lengthOf(actualAreaPoints, expectedAreaPoints.length, "number of points in path should be equal");
      actualAreaPoints.forEach((actualAreaPoint, j) => {
        var expectedAreaPoint = expectedAreaPoints[j];
        assert.closeTo(+actualAreaPoint[0], +expectedAreaPoint[0], 0.1, msg);
        assert.closeTo(+actualAreaPoint[1], +expectedAreaPoint[1], 0.1, msg);
      });
    });
  }
}
