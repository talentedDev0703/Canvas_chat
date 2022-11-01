// import * as _ from 'lodash';
const $ = window.$;

/**
 * @function detectLine
 * @description to detect whether current Point is over any line
 * @param {point: current Point, points: array of start and end of line}
 */
export function detectLine(point, points) {
  var res = {
    flag: false,
    pointIndex: -1
  };
  if (!res.flag && points.length > 1) {
    var offsetX = 0;
    var offsetY = 0;
    var k = 0;
    var expectedY = 0;
    for (var i = 1; i < points.length; i++) {
      offsetX = points[i].x - points[i - 1].x;
      offsetY = points[i].y - points[i - 1].y;
      var minX = Math.min(points[i].x, points[i - 1].x);
      var maxX = Math.max(points[i].x, points[i - 1].x);
      if (offsetX === 0) {
        res.flag = point.y <= Math.max(points[i].y, points[i - 1].y) && point.y >= Math.min(points[i].y, points[i - 1].y);
        res.flag = res.flag && Math.abs(points[i].x - point.x) < 5;
      } else {
        k = offsetY / offsetX;
        expectedY = (point.x - points[i - 1].x) * k;
        res.flag = point.x <= maxX + 2.5 && point.x >= minX - 2.5 && Math.abs(points[i - 1].y + expectedY - point.y) < 5;
      }
      if (res.flag) break;
    }
  }
  return res;
};

/**
 * Basic Drawing functions
 * @param {canvas context} ctx 
 * @param {start point} startP 
 * @param {end point} endP 
 * @param {drawing option} option 
 */

function drawLine(ctx, startP, endP, option) {
  ctx.beginPath();
  ctx.globalAlpha = 1;
  ctx.setLineDash(option.dashType);
  ctx.strokeStyle = option.color;
  ctx.lineWidth = option.thickness;
  ctx.moveTo(startP.x, startP.y);
  ctx.lineTo(endP.x, endP.y);
  ctx.stroke();
}

function drawText(ctx, text, labelX, labelY, option) {
  ctx.beginPath();
  ctx.globalAlpha = 1;
  ctx.lineWidth = 1;
  ctx.setLineDash([]);
  ctx.fillStyle = option.color;
  ctx.font = option.font;
  ctx.fillText(text, labelX, labelY);
}

function getRotatedPos(point, alpa, originalP) {
  return {
    x: originalP.x + point.x * Math.cos(alpa) - point.y * Math.sin(alpa),
    y: originalP.y - (point.x * Math.sin(alpa) + point.y * Math.cos(alpa))
  };
}

function getArrow(startP, endP) {
  var axisOffsetX = startP.x - endP.x;
  var axisOffsetY = startP.y - endP.y;

  var r = Math.sqrt(Math.pow(axisOffsetX, 2) + Math.pow(axisOffsetY, 2));
  var offsetX = Math.cos(Math.PI / 6) * 10;
  var offsetY = Math.sin(Math.PI / 6) * 10;
  var alpa = Math.atan(axisOffsetY / axisOffsetX);

  if (axisOffsetX > 0) {
    alpa = Math.PI - alpa;
  } else {
    alpa = -1 * alpa;
  }

  var oPoint1 = {
    x: r - offsetX,
    y: -offsetY
  };
  var oPoint2 = {
    x: r - offsetX,
    y: offsetY
  };
  var point1 = getRotatedPos(oPoint1, alpa, startP);
  var point2 = getRotatedPos(oPoint2, alpa, startP);

  var dataPoints = [{
      x: point1.x,
      y: point1.y
    },
    {
      x: endP.x,
      y: endP.y
    },
    {
      x: point2.x,
      y: point2.y
    }
  ];
  return dataPoints;
}

function drawRange(ctx, startP, endP, option) {
  ctx.beginPath();
  ctx.globalAlpha = option.opacity;
  ctx.fillStyle = option.color;
  ctx.fillRect(startP.x, startP.y, endP.x, endP.y);
}

function drawTextWithBackground(ctx, text, points, option, flag) {
  var point = JSON.parse(JSON.stringify(points[0]));
  if (points.length > 1) {
    point = {
      x: (points[0].x + points[1].x) / 2,
      y: (points[0].y + points[1].y) / 2
    };
  }
  var textOffset = getTextStyle(text, option);
  var offset = 5;
  if (option.fontSize > 20) {
    offset = 10;
  }
  var rectHeight = option.fontSize;
  var rectWidth = textOffset.x + offset;
  if (flag > 0)
    point.y = point.y - rectHeight / 2 - 3;
  else if (flag < 0)
    point.y = point.y + rectHeight / 2 + 3;

  ctx.beginPath();
  ctx.globalAlpha = 1;
  ctx.fillStyle = option.lineColor;
  ctx.moveTo(point.x - rectWidth / 2 + 2.5, point.y - rectHeight / 2);
  ctx.lineTo(point.x + rectWidth / 2 - 2.5, point.y - rectHeight / 2);
  ctx.quadraticCurveTo(point.x + rectWidth / 2, point.y - rectHeight / 2, point.x + rectWidth / 2, point.y - rectHeight / 2 + 2.5);
  ctx.lineTo(point.x + rectWidth / 2, point.y + rectHeight / 2 - 2.5);
  ctx.quadraticCurveTo(point.x + rectWidth / 2, point.y + rectHeight / 2, point.x + rectWidth / 2 - 2.5, point.y + rectHeight / 2);
  ctx.lineTo(point.x - rectWidth / 2 + 2.5, point.y + rectHeight / 2);
  ctx.quadraticCurveTo(point.x - rectWidth / 2, point.y + rectHeight / 2, point.x - rectWidth / 2, point.y + rectHeight / 2 - 2.5);
  ctx.lineTo(point.x - rectWidth / 2, point.y - rectHeight / 2 + 2.5);
  ctx.quadraticCurveTo(point.x - rectWidth / 2, point.y - rectHeight / 2, point.x - rectWidth / 2 + 2.5, point.y - rectHeight / 2);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.globalAlpha = 1;
  ctx.lineWidth = 1;
  ctx.setLineDash([]);
  ctx.fillStyle = option.color;
  ctx.font = `${option.fontStyle} ${option.fontWeight} ${option.fontSize}px ${option.fontFamily}`;
  ctx.fillText(text, point.x - textOffset.x / 2, point.y + rectHeight / 3);
}

function drawMultiRange(ctx, points, option, hasBorder = false) {
  if (points.length <= 1) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (var i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  if (option.background.visible) {
    // ctx.globalAlpha = option.background.opacity;
    ctx.fillStyle = option.background.color;
    ctx.fill();
  }

  if (hasBorder) {
    ctx.globalAlpha = 1;
    ctx.setLineDash([]);
    ctx.lineWidth = option.hoverover ? 4 : parseInt(option.mainLine.lineThickness);
    ctx.strokeStyle = option.hoverover ? option.hoverColor : option.mainLine.lineColor;
    ctx.stroke();
  }
}

/**
 * @function getMiddle
 * @description get Highest or Lowest value of offset array
 * @param: data: array of point, index: number, offset: number
 */

export function getMiddle(data, index, offset, flag = true) {
  var highest = [];
  var lowest = [];
  var start = index - offset;
  if (start < 0) start = 0;
  for (var i = start; i < index + 1; i++) {
    highest.push(data[i].y[1]);
    lowest.push(data[i].y[2]);
  }
  var result = (Math.max(...highest) + Math.min(...lowest)) / 2;
  if (!flag)
    result = {
      high: Math.max(...highest),
      low: Math.min(...lowest)
    };
  return result;
}

/**
 * @function drawSplineRange
 * @description drawing area range of spline
 */
function drawSplineRange(ctx, dataPoints, color, chart) {
  if (dataPoints.length <= 1) return;
  ctx.beginPath();
  ctx.moveTo(chart.axisX[0].convertValueToPixel(dataPoints[0].x), chart.axisY2[0].convertValueToPixel(dataPoints[0].y[0]));

  let i = 0;
  for (i = 1; i < dataPoints.length - 2; i++) {
    const xc = (chart.axisX[0].convertValueToPixel(dataPoints[i].x) + chart.axisX[0].convertValueToPixel(dataPoints[i + 1].x)) / 2;
    const yc = (dataPoints[i].y[0] + dataPoints[i + 1].y[0]) / 2;
    ctx.quadraticCurveTo(chart.axisX[0].convertValueToPixel(dataPoints[i].x), chart.axisY2[0].convertValueToPixel(dataPoints[i].y[0]),
      xc, chart.axisY2[0].convertValueToPixel(yc));
  }
  // curve through the last two points
  ctx.quadraticCurveTo(chart.axisX[0].convertValueToPixel(dataPoints[i].x), chart.axisY2[0].convertValueToPixel(dataPoints[i].y[0]),
    chart.axisX[0].convertValueToPixel(dataPoints[i + 1].x), chart.axisY2[0].convertValueToPixel(dataPoints[i + 1].y[0]));

  dataPoints.reverse();
  ctx.lineTo(chart.axisX[0].convertValueToPixel(dataPoints[0].x), chart.axisY2[0].convertValueToPixel(dataPoints[0].y[1]));

  for (i = 1; i < dataPoints.length - 2; i++) {
    const xb = (chart.axisX[0].convertValueToPixel(dataPoints[i].x) + chart.axisX[0].convertValueToPixel(dataPoints[i + 1].x)) / 2;
    const yb = (dataPoints[i].y[1] + dataPoints[i + 1].y[1]) / 2;
    ctx.quadraticCurveTo(chart.axisX[0].convertValueToPixel(dataPoints[i].x), chart.axisY2[0].convertValueToPixel(dataPoints[i].y[1]),
      xb, chart.axisY2[0].convertValueToPixel(yb));
  }
  // curve through the last two points
  ctx.quadraticCurveTo(chart.axisX[0].convertValueToPixel(dataPoints[i].x), chart.axisY2[0].convertValueToPixel(dataPoints[i].y[1]),
    chart.axisX[0].convertValueToPixel(dataPoints[i + 1].x), chart.axisY2[0].convertValueToPixel(dataPoints[i + 1].y[1]));

  ctx.closePath();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = color;
  ctx.fill();
}

/**
 * @function drawSpline
 * @description drawing spline
 */
function drawSpline(ctx, dataPoints, option, chart) {
  ctx.beginPath();
  ctx.strokeStyle = option.lineColor;
  ctx.lineCap = 'round';
  ctx.lineWidth = option.lineThickness;
  ctx.globalAlpha = 1;
  ctx.setLineDash([]);
  let i = 0;
  const convertedPoints = dataPoints.map(point => ({
    x: chart.axisX[0].convertValueToPixel(point.x),
    y: chart.axisY2[0].convertValueToPixel(point.y)
  }));
  if (convertedPoints.length <= 0) return null;
  ctx.moveTo(convertedPoints[0].x, convertedPoints[0].y);
  for (i = 1; i < dataPoints.length - 2; i++) {
    var xc = (chart.axisX[0].convertValueToPixel(dataPoints[i].x) + chart.axisX[0].convertValueToPixel(dataPoints[i + 1].x)) / 2;
    var yc = (convertedPoints[i].y + convertedPoints[i + 1].y) / 2;
    ctx.quadraticCurveTo(convertedPoints[i].x, convertedPoints[i].y,
      xc, yc);
  }
  // curve through the last two points
  ctx.quadraticCurveTo(convertedPoints[i].x, convertedPoints[i].y,
    convertedPoints[i + 1].x, convertedPoints[i + 1].y);
  ctx.stroke();
  return convertedPoints;
}

export function getTextStyle(text, option) {
  var tempdiv = document.getElementById("get_font_width");
  tempdiv.style.fontSize = option.fontSize ? parseInt(option.fontSize) : 12;
  tempdiv.style.fontFamily = option.fontFamily ? option.fontFamily : '';
  tempdiv.style.fontStyle = option.fontStyle ? option.fontStyle : 'normal';
  tempdiv.style.fontWeight = option.fontWeight ? option.fontWeight : 'normal';
  tempdiv.style.lineHeight = option.fontSize * 1.4 + 'px';
  tempdiv.innerHTML = text;
  // $(tempdiv).css("font-size", option.fontSize ? parseInt(option.fontSize) : 12);
  // $(tempdiv).css("font-family", option.fontFamily ? option.fontFamily : '');
  // $(tempdiv).css("font-style", option.fontStyle ? option.fontStyle : 'normal');
  // $(tempdiv).css("font-weight", option.fontWeight ? option.fontWeight : 'normal');
  // $(tempdiv).css("line-height", option.fontSize * 1.4 + 'px');
  // $(tempdiv).html(text);
  return {
    x: tempdiv.clientWidth + 4,
    y: tempdiv.clientHeight
  };
};

export function drawSelecter(ctx, points, radius = 5, flag = true) {
  points.forEach(point => {
    if (point) {
      ctx.beginPath();
      ctx.fillStyle = flag ? 'rgb(100, 100, 100)' : 'transparent';
      ctx.globalAlpha = 1;
      ctx.setLineDash([]);
      ctx.lineWidth = 2;
      ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI, false);
      ctx.fill();
      ctx.strokeStyle = "rgb(200, 200, 200)";
      ctx.stroke();
    }
  });
};

/** Main Shape Drawing functions */
/**
 * 
 * @param {context of canvas: Context2D Object} ctx 
 * @param {drawing option: Object} option 
 * @param {drawiing points: Array} points 
 * @param {maximium of xaxis of chart} lastX
 */
export function drawHRay(ctx, option, points, lastX, chart, precision) {
  if (points.length > option.pointsNum - 1) {
    var dashType = [];
    if (option.mainLine.lineDashType === "dot")
      dashType = [3, 3];
    else if (option.mainLine.lineDashType === "dash")
      dashType = [10, 5];

    var endP = {
      x: lastX,
      y: points[0].y
    };

    drawLine(ctx, points[0], endP, {
      color: option.hoverover ? option.hoverColor : option.mainLine.lineColor,
      thickness: option.hoverover ? 4 : parseInt(option.mainLine.lineThickness),
      dashType: dashType
    });

    if (option.label.visible && option.label.text.length > 0) {
      var startP = points[0];
      var labelX = startP.x,
        labelY = startP.y;
      var textOffset = getTextStyle(option.label.text, option.label);
      var offset = Math.abs(startP.x - endP.x);
      var startX = startP.x;
      if (option.label.align === "left") {
        labelX = startX;
      } else if (option.label.align === "center") {
        labelX = startX + offset / 2 - textOffset.x / 2;
      } else {
        labelX = lastX - textOffset.x;
      }

      if (option.label.vAlign === "top") {
        labelY = startP.y - 5;
      } else if (option.label.vAlign === "middle") {
        labelY = startP.y + textOffset.y * 0.2;
      } else {
        labelY = startP.y + textOffset.y * 0.6;
      }

      drawText(ctx, option.label.text, labelX, labelY, {
        color: option.label.color,
        font: `${option.label.fontStyle} ${option.label.fontWeight} ${option.label.fontSize}px ${option.label.fontFamily}`,
      });
    }

    var priceOption = null;

    if (option.label.indexVisible) {
      priceOption = {
        color: '#ff0000',
        showOnTop: true,
        labelFontColor: "white",
        labelAlign: 'near',
        labelPlacement: "inside",
        labelBackgroundColor: option.mainLine.lineColor,
        labelFontSize: 12,
        lineDashType: 'dot',
        thickness: 0,
        label: Number(option.chartPoints[0].y).toFixed(precision),
        value: option.chartPoints[0].y,
        objectType: 'h-ray',
        optionId: option.id
      };

      // const priceIndex = chart.options.axisY2.stripLines.findIndex(o => (o.optionId === option.id));
      // if (priceIndex < 0) {
      //   chart.options.axisY2.stripLines.push(priceOption);
      // } else {
      //   chart.options.axisY2.stripLines[priceIndex] = priceOption;
      // }
      // chart.render();
    }
    return priceOption;
  }
}

/**
 * 
 * @param {context of canvas: Context2D Object} ctx 
 * @param {drawing option: Object} option 
 * @param {drawiing points: Array} points      
 */

export function drawArrow(ctx, option, points, chart, selected, lastViewX, minViewX) {
  if (points.length > option.pointsNum - 1) {
    var dashType = [];
    if (option.mainLine.lineDashType === "dot")
      dashType = [3, 3];
    else if (option.mainLine.lineDashType === "dash")
      dashType = [10, 5];
    var lineOption = {
      color: option.hoverover ? option.hoverColor : option.mainLine.lineColor,
      thickness: option.hoverover ? 4 : parseInt(option.mainLine.lineThickness),
      dashType: dashType
    };

    // drawLine(ctx, points[0], points[1], lineOption);
    const p0 = points[0];
    const p1 = points[1];
    const y0 = (p0.x * p1.y - p1.x * p0.y) / (p0.x - p1.x);
    const y1 = ((lastViewX - p0.x) * (p1.y - p0.y) + (p1.x - p0.x) * p0.y) / (p1.x - p0.x);

    const minP = p0.x < p1.x ? p0 : p1;
    const maxP = p0.x < p1.x ? p1 : p0;
    const sP = option.start.extend ? {
      x: minViewX,
      y: y0
    } : minP;
    const eP = option.end.extend ? {
      x: lastViewX,
      y: y1
    } : maxP;
    drawLine(ctx, sP, eP, lineOption);


    if (option.start.arrow) {
      var preArrowPoints = getArrow(points[1], points[0]);
      for (var i = 1; i < preArrowPoints.length; i++) {
        drawLine(ctx, preArrowPoints[i - 1], preArrowPoints[i], lineOption);
      }
    }

    if (option.end.arrow) {
      var arrowPoints = getArrow(points[0], points[1]);
      for (var j = 1; j < arrowPoints.length; j++) {
        drawLine(ctx, arrowPoints[j - 1], arrowPoints[j], lineOption);
      }
    }

    if (option.label.extra && selected) {
      var startP = points[0];
      var endP = points[1];
      var labels = [];
      var labelLength = [];
      var subLabels = [];
      var label = '';

      if (option.label.extra.price) {
        var offsetY = option.chartPoints[1].y - option.chartPoints[0].y;
        var percentage = Math.round(10000 * offsetY / (chart.axisY2[0].get('viewportMaximum') - chart.axisY2[0].get('viewportMinimum'))) / 100;
        label = 'Price: ' + Math.round(Math.abs(offsetY) * 100000) / 100000 + "(" + Math.abs(percentage) + "%)";
        labels.push(label);
        labelLength.push(label.length);
      }

      var labelText = '';
      if (option.label.extra.bars) {
        var temp_data = chart.options.data[0].dataPoints.filter(point => {
          if (point.x >= option.chartPoints[0].x && point.x <= option.chartPoints[1].x) return true;
          else if (point.x <= option.chartPoints[1].x && point.x >= option.chartPoints[1].x) return true;
          else return false;
        });
        labelText = temp_data.length + ' bars ';
      }

      if (option.label.extra.date) {
        var minutes = Math.abs(option.chartPoints[0].x - option.chartPoints[1].x) / (1000 * 60);
        if (option.label.extra.bars) labelText += '(' + Math.round(minutes) + 'min)';
        else labelText += Math.round(minutes) + 'min      ';
      }

      if (labelText.length > 0)
        subLabels.push(labelText);

      if (option.label.extra.distance) {
        var distance = Math.sqrt(Math.pow(startP.x - endP.x, 2) + Math.pow(startP.y - endP.y, 2));
        distance = (Math.round(100 * distance) / 100);
        subLabels.push('distance: ' + distance);
      }
      if (subLabels.length > 0) {
        label = subLabels.join(", ");
        labels.push(label);
        labelLength.push(label.length);
      }

      if (option.label.extra.angle) {
        var alpa = Math.atan(Math.abs((startP.y - endP.y) / (startP.x - endP.x)));
        if (endP.x > startP.x) {
          alpa = Math.round((Math.PI - alpa) * 180 / Math.PI);
          if (endP.y < startP.y) alpa = -1 * alpa;
        } else {
          alpa = Math.round(alpa * 180 / Math.PI);
          if (endP.y < startP.y) alpa = -1 * alpa;
        }
        label = 'angle: ' + alpa + "°";
        labels.push(label);
        labelLength.push(label.length);
      }

      var maxLength = Math.max(...labelLength);
      var maxLabel = labels[labelLength.indexOf(maxLength)];

      var labelX = startP.x,
        labelY = startP.y;
      var textOffset = getTextStyle(maxLabel, option.label);
      var offset = Math.abs(startP.x - endP.x);
      var startX = startP.x;
      if (option.label.align === "left") {
        labelX = startP.x;
        labelY = startP.y;
      } else if (option.label.align === "center") {
        labelX = startX + offset / 2;
        labelY = (endP.y + startP.y) / 2;
      } else {
        labelX = endP.x;
        labelY = endP.y;
      }
      if (startP.y < endP.y) labelY -= textOffset.y * labels.length;
      else labelY = labelY + textOffset.y + 5;

      // drawing rectangle of text pane
      if (labels.length > 0) {
        drawRect(ctx, {
          visible: true,
          background: {
            color: 'rgba(255, 255, 255, 0.3)',
            visible: true
          },
          mainLine: {
            lineColor: 'gray',
            lineThickness: 1
          }
        }, [{
          x: labelX,
          y: labelY - textOffset.y
        }, {
          x: 0,
          y: 0
        }, {
          x: labelX + textOffset.x + 10,
          y: labelY + textOffset.y * (labels.length - 1) + 5
        }], false);
      }

      labels.forEach((ll, index) => {
        drawText(ctx, ll, labelX + 5, labelY + index * textOffset.y, {
          color: option.label.color,
          font: `${option.label.fontStyle} ${option.label.fontWeight} ${option.label.fontSize}px ${option.label.fontFamily}`,
        });
      });
    }
  }
};

/**
 * 
 * @param {context} ctx 
 * @param {option} option 
 * @param {points} points 
 */

export function drawRect(ctx, option, points) {
  // if (!option.visible) return;
  ctx.beginPath();
  ctx.setLineDash([]);
  var startX = Math.min(points[0].x, points[2].x);
  var startY = Math.min(points[0].y, points[2].y);
  ctx.rect(startX, startY, Math.abs(points[0].x - points[2].x), Math.abs(points[0].y - points[2].y));
  if (option.background.visible) {
    // ctx.globalAlpha = option.background.opacity;
    ctx.fillStyle = option.background.color;
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  ctx.lineWidth = option.hoverover ? 4 : parseInt(option.mainLine.lineThickness);
  ctx.strokeStyle = option.hoverover ? option.hoverColor : option.mainLine.lineColor;
  ctx.stroke();
};

/**
 * @function drawFib
 * @description to draw Fibonacci drawing object
 */
export function drawFib(ctx, option, tpoints, chart, precision, lastViewX) {
  // if (points.length < 2) return;
  let points = [...tpoints];
  if (option.revert && option.key === "fibonacci")
    points.reverse();

  var prevPoint = {};
  // ctx.globalAlpha = 0.3;
  if (points.length > option.pointsNum - 1) {
    var offsetY = points[0].y - points[1].y;
    var dashType = [];
    if (option.levelLine.lineDashType === "dot")
      dashType = [3, 3];
    else if (option.levelLine.lineDashType === "dash")
      dashType = [10, 5];

    var seedNum = Math.pow(10, precision);
    let sortedLevels = option.levels.filter(level => (level.visible));
    sortedLevels.sort((a, b) => (a.value - b.value));

    for (var i = 0; i < sortedLevels.length; i++) {
      var level = sortedLevels[i];
      if (!level.visible) continue;
      var yValue = 0;
      var xValue = [0, 0];

      if (option.key === 'fibonacci') {
        xValue = [points[0].x, points[1].x];
        yValue = points[1].y + Math.round(seedNum * level.value * offsetY) / seedNum;
      } else {
        offsetY = points[1].y - points[0].y;
        if (option.revert)
          offsetY = -1 * offsetY;
        xValue = [points[1].x, points[2].x];
        yValue = points[2].y + Math.round(seedNum * level.value * offsetY) / seedNum;
      }

      var startP = {
        x: xValue[0],
        y: yValue
      };
      var endP = {
        x: option.extend ? lastViewX : xValue[1],
        y: yValue
      };
      const hover = option.sub_hovers && option.sub_hovers.indexOf(level.value.toString()) >= 0;
      drawLine(ctx, startP, endP, {
        color: hover ? option.hoverColor : level.color,
        thickness: hover ? 2 : parseInt(option.levelLine.lineThickness),
        dashType: dashType
      });

      var labelText = level.value.toString();
      if (option.label.extra.percents) {
        labelText = (Math.round(level.value * 10000) / 100).toString();
        labelText += "%";
      }
      if (option.label.extra.price) {
        var yText = chart.axisY2[0].convertPixelToValue(yValue);
        yText = Math.round(yText * seedNum) / seedNum;
        labelText += '(' + yText + ')';
      }
      var labelX = startP.x,
        labelY = startP.y;
      var textStyle = getTextStyle(labelText, option.label);
      var offsetX = textStyle.x;
      var offset = Math.abs(startP.x - endP.x);
      var startX = Math.min(startP.x, endP.x);
      var endX = Math.max(startP.x, endP.x);
      if (option.label.align === "left") {
        labelX = startX - offsetX - 5;
      } else if (option.label.align === "center") {
        if (option.extend) {
          offset = Math.abs(startP.x - xValue[1]);
        }
        labelX = startX + offset / 2 - offsetX / 2;
      } else {
        labelX = option.extend ? endX - offsetX - 5 : endX + 5;
      }

      if (option.label.vAlign === "top") {
        labelY = startP.y - option.label.fontSize / 3;
      } else if (option.label.vAlign === "middle") {
        labelY = startP.y + option.label.fontSize / 3;
      } else {
        labelY = startP.y + option.label.fontSize;
      }

      drawText(ctx, labelText, labelX, labelY, {
        color: level.color,
        font: `normal normal ${option.label.fontSize}px Arial`
      });

      if (i > 0 && option.background.visible) {
        drawRange(ctx, startP, {
          x: endP.x - startP.x,
          y: prevPoint.y - startP.y
        }, {
          color: level.color,
          opacity: option.background.opacity
        });
      }
      prevPoint = endP;
    }
  }

  var mainDashType = [];
  if (option.mainLine.lineDashType === "dot")
    mainDashType = [3, 3];
  else if (option.mainLine.lineDashType === "dash")
    mainDashType = [10, 5];

  if (option.mainLine.visible) {
    for (var j = 1; j < points.length; j++) {
      drawLine(ctx, points[j - 1], points[j], {
        color: option.hoverover ? option.hoverColor : option.mainLine.lineColor,
        thickness: option.hoverover ? 4 : parseInt(option.mainLine.lineThickness),
        dashType: mainDashType
      });
    }
  }
};

/**
 * @function drawCallout
 * @param {*} ctx 
 * @param {*} option 
 * @param {*} points 
 */

export function drawCallout(ctx, option, points) {
  var labels = option.label.text.split("\n");
  var labelLength = labels.map(item => (item.length));
  var maxLength = Math.max(...labelLength);
  var maxLabel = labels[labelLength.indexOf(maxLength)];
  var textOffset = getTextStyle(maxLabel, option.label);
  var rectHeight = textOffset.y * labels.length + 20;
  var rectWidth = textOffset.x + 20;
  if (rectWidth < 40) rectWidth = 40;
  if (rectHeight < 30) rectHeight = 30;

  var newPoints = [{
      x: points[1].x,
      y: points[1].y - rectHeight / 2
    },
    {
      x: points[1].x,
      y: points[1].y + rectHeight / 2
    },
    {
      x: points[1].x - rectWidth,
      y: points[1].y + rectHeight / 2
    },
    {
      x: points[1].x - rectWidth,
      y: points[1].y - rectHeight / 2
    },
  ];
  var insideFlag = points[0].x <= newPoints[0].x && points[0].x >= newPoints[3].x;
  insideFlag = insideFlag & points[0].y <= newPoints[1].y && points[0].y >= newPoints[0].y;
  if (insideFlag) {
    ctx.beginPath();
    ctx.moveTo(newPoints[0].x, newPoints[0].y + 10);
    ctx.lineTo(newPoints[1].x, newPoints[1].y - 10);
    ctx.quadraticCurveTo(newPoints[1].x, newPoints[1].y, newPoints[1].x - 10, newPoints[1].y);
    ctx.lineTo(newPoints[2].x + 10, newPoints[2].y);
    ctx.quadraticCurveTo(newPoints[2].x, newPoints[2].y, newPoints[2].x, newPoints[2].y - 10);
    ctx.lineTo(newPoints[3].x, newPoints[3].y + 10);
    ctx.quadraticCurveTo(newPoints[3].x, newPoints[3].y, newPoints[3].x + 10, newPoints[3].y);
    ctx.lineTo(newPoints[0].x - 5, newPoints[0].y);
    ctx.quadraticCurveTo(newPoints[0].x, newPoints[0].y, newPoints[0].x, newPoints[0].y + 10);
    ctx.closePath();
  } else {
    // get points of arc
    var alpaOffsetX = points[1].x - rectWidth / 2 - points[0].x;
    var alpaOffsetY = points[1].y - points[0].y;
    var alpa = Math.atan(Math.abs(alpaOffsetY / alpaOffsetX));
    var index = 0;
    if (alpaOffsetX < 0) {
      if (alpaOffsetY < 0)
        alpa = Math.PI - alpa;
      else
        alpa = Math.PI + alpa;
    } else {
      if (alpaOffsetY > 0)
        alpa = 2 * Math.PI - alpa;
    }
    index = Math.round(alpa * 4 / Math.PI);
    if (index > 7) index = 0;
    ctx.beginPath();

    ctx.moveTo(newPoints[0].x, newPoints[0].y + 10);
    if (index === 4) {
      ctx.lineTo(newPoints[0].x, points[1].y - 7);
      ctx.lineTo(points[0].x, points[0].y);
      ctx.lineTo(newPoints[0].x, points[1].y + 7);
    }
    ctx.lineTo(newPoints[1].x, newPoints[1].y - 10);

    if (index === 3) {
      ctx.lineTo(points[0].x, points[0].y);
      ctx.lineTo(newPoints[1].x - 10, newPoints[1].y);
    } else {
      ctx.quadraticCurveTo(newPoints[1].x, newPoints[1].y, newPoints[1].x - 10, newPoints[1].y);
    }

    if (index === 2) {
      ctx.lineTo((newPoints[1].x + newPoints[2].x) / 2 + 7, newPoints[1].y);
      ctx.lineTo(points[0].x, points[0].y);
      ctx.lineTo((newPoints[1].x + newPoints[2].x) / 2 - 7, newPoints[1].y);
    }
    ctx.lineTo(newPoints[2].x + 10, newPoints[2].y);

    if (index === 1) {
      ctx.lineTo(points[0].x, points[0].y);
      ctx.lineTo(newPoints[2].x, newPoints[2].y - 10);
    } else {
      ctx.quadraticCurveTo(newPoints[2].x, newPoints[2].y, newPoints[2].x, newPoints[2].y - 10);
    }

    if (index === 0) {
      ctx.lineTo(newPoints[2].x, (newPoints[2].y + newPoints[3].y) / 2 + 7);
      ctx.lineTo(points[0].x, points[0].y);
      ctx.lineTo(newPoints[2].x, (newPoints[2].y + newPoints[3].y) / 2 - 7);
    }
    ctx.lineTo(newPoints[3].x, newPoints[3].y + 10);

    if (index === 7) {
      ctx.lineTo(points[0].x, points[0].y);
      ctx.lineTo(newPoints[3].x + 10, newPoints[3].y);
    } else {
      ctx.quadraticCurveTo(newPoints[3].x, newPoints[3].y, newPoints[3].x + 10, newPoints[3].y);
    }

    if (index === 6) {
      ctx.lineTo((newPoints[3].x + newPoints[0].x) / 2 - 7, newPoints[3].y);
      ctx.lineTo(points[0].x, points[0].y);
      ctx.lineTo((newPoints[3].x + newPoints[0].x) / 2 + 7, newPoints[3].y);
    }
    ctx.lineTo(newPoints[0].x - 10, newPoints[0].y);
    if (index === 5) {
      ctx.lineTo(points[0].x, points[0].y);
      ctx.lineTo(newPoints[0].x, newPoints[0].y + 10);
    } else {
      ctx.quadraticCurveTo(newPoints[0].x, newPoints[0].y, newPoints[0].x, newPoints[0].y + 10);
    }
    ctx.closePath();
  }

  ctx.setLineDash([]);
  // ctx.globalAlpha = option.background.opacity;
  ctx.fillStyle = option.background.color;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.lineWidth = option.hoverover ? 4 : parseInt(option.mainLine.lineThickness);
  ctx.strokeStyle = option.hoverover ? option.hoverColor : option.mainLine.lineColor;
  ctx.stroke();

  var labelX = points[1].x - (rectWidth + textOffset.x) / 2;
  var labelY = points[1].y - textOffset.y * labels.length / 2 + textOffset.y * 2 / 3;
  labels.forEach((ll, index) => {
    drawText(ctx, ll, labelX, labelY + index * textOffset.y, {
      color: option.label.color,
      font: `${option.label.fontStyle} ${option.label.fontWeight} ${option.label.fontSize}px ${option.label.fontFamily}`,
    });
  });
};

/**
 * @function drawXABCD
 * @param {*} ctx 
 * @param {*} option 
 * @param {*} points 
 */
export function drawXABCD(ctx, option, points) {
  if (points.length < 2) return;

  ctx.setLineDash([]);
  ctx.strokeStyle = option.mainLine.lineColor;
  ctx.lineCap = 'round';
  var lineOption = {
    thickness: option.hoverover ? 4 : parseInt(option.mainLine.lineThickness),
    dashType: [],
    color: option.hoverover ? option.hoverColor : option.mainLine.color
  };
  var labelOption = Object.assign(option.label, {
    lineColor: option.mainLine.lineColor
  });
  drawLine(ctx, points[0], points[1], lineOption);
  drawTextWithBackground(ctx, 'X', [points[0]], labelOption, points[1].y - points[0].y);
  drawTextWithBackground(ctx, 'A', [points[1]], labelOption, points[0].y - points[1].y);
  if (points.length > 2) {
    drawMultiRange(ctx, [points[0], points[1], points[2]], option, false);
    drawLine(ctx, points[1], points[2], lineOption);
    drawLine(ctx, points[2], points[0], lineOption);
    drawTextWithBackground(ctx, 'B', [points[2]], labelOption, points[1].y - points[2].y);
    var xbLabelText = (Math.round(Math.abs(points[2].y - points[1].y) * 1000 / Math.abs(points[0].y - points[1].y)) / 1000).toString();
    drawTextWithBackground(ctx, xbLabelText, [points[0], points[2]], labelOption, 0)
    if (points.length > 3) {
      drawLine(ctx, points[2], points[3], lineOption);
      drawLine(ctx, points[3], points[1], lineOption);
      drawTextWithBackground(ctx, 'C', [points[3]], labelOption, points[2].y - points[3].y);
      var acLabelText = (Math.round(Math.abs(points[2].y - points[3].y) * 1000 / Math.abs(points[1].y - points[2].y)) / 1000).toString();
      drawTextWithBackground(ctx, acLabelText, [points[1], points[3]], labelOption, 0)
      if (points.length > 4) {
        drawMultiRange(ctx, [points[2], points[3], points[4]], option, false);
        drawLine(ctx, points[2], points[4], lineOption);
        drawLine(ctx, points[3], points[4], lineOption);
        drawLine(ctx, points[4], points[0], lineOption);
        drawTextWithBackground(ctx, 'D', [points[4]], labelOption, points[3].y - points[4].y);
        var bdLabelText = (Math.round(Math.abs(points[3].y - points[4].y) * 1000 / Math.abs(points[2].y - points[3].y)) / 1000).toString();
        drawTextWithBackground(ctx, bdLabelText, [points[2], points[4]], labelOption, 0);
        var xdLabelText = (Math.round(Math.abs(points[1].y - points[4].y) * 1000 / Math.abs(points[1].y - points[0].y)) / 1000).toString();
        drawTextWithBackground(ctx, xdLabelText, [points[0], points[4]], labelOption, 0)
      }
    }
  }
};

/**
 * @function drawABCD
 * @param {*} ctx 
 * @param {*} option 
 * @param {*} points
 */
export function drawABCD(ctx, option, points) {
  if (points.length < 2) return;

  ctx.setLineDash([]);
  ctx.strokeStyle = option.mainLine.lineColor;
  ctx.lineCap = 'round';
  var lineOption = {
    thickness: option.hoverover ? 4 : parseInt(option.mainLine.lineThickness),
    dashType: [],
    color: option.hoverover ? option.hoverColor : option.mainLine.color
  };
  var labelOption = Object.assign(option.label, {
    lineColor: option.mainLine.lineColor
  });
  drawLine(ctx, points[0], points[1], lineOption);
  drawTextWithBackground(ctx, 'A', [points[0]], labelOption, points[1].y - points[0].y);
  drawTextWithBackground(ctx, 'B', [points[1]], labelOption, points[0].y - points[1].y);
  if (points.length > 2) {
    drawLine(ctx, points[1], points[2], lineOption);
    drawLine(ctx, points[0], points[2], lineOption);
    drawTextWithBackground(ctx, 'C', [points[2]], labelOption, points[0].y - points[2].y);
    var acLabelText = (Math.round(Math.abs(points[2].y - points[1].y) * 1000 / Math.abs(points[1].y - points[0].y)) / 1000).toString();
    drawTextWithBackground(ctx, acLabelText, [points[0], points[2]], labelOption, 0);
    if (points.length > 3) {
      drawLine(ctx, points[1], points[3], lineOption);
      drawLine(ctx, points[2], points[3], lineOption);
      drawTextWithBackground(ctx, 'D', [points[3]], labelOption, points[2].y - points[3].y);
      var bdLabelText = (Math.round(Math.abs(points[2].y - points[3].y) * 1000 / Math.abs(points[1].y - points[2].y)) / 1000).toString();
      drawTextWithBackground(ctx, bdLabelText, [points[1], points[3]], labelOption, 0);
    }
  }
};

/**
 * @function drawTriPattern
 * @param {*} ctx 
 * @param {*} option 
 * @param {*} points
 */
export function drawTriPattern(ctx, option, points) {
  if (points.length < 2) return;

  ctx.setLineDash([]);
  ctx.strokeStyle = option.mainLine.lineColor;
  ctx.lineCap = 'round';
  var lineOption = {
    thickness: option.hoverover ? 4 : parseInt(option.mainLine.lineThickness),
    dashType: [],
    color: option.hoverover ? option.hoverColor : option.mainLine.color
  };
  var xPoints = points.map(point => (point.x));
  var labelOption = Object.assign(option.label, {
    lineColor: option.mainLine.lineColor
  });
  drawLine(ctx, points[0], points[1], lineOption);
  drawTextWithBackground(ctx, 'A', [points[0]], labelOption, points[1].y - points[0].y);
  drawTextWithBackground(ctx, 'B', [points[1]], labelOption, points[0].y - points[1].y);

  if (points.length > 2) {
    drawLine(ctx, points[1], points[2], lineOption);
    drawTextWithBackground(ctx, 'C', [points[2]], labelOption, points[1].y - points[2].y);
  }
  if (points.length > 3) {
    drawLine(ctx, points[2], points[3], lineOption);
    drawTextWithBackground(ctx, 'D', [points[3]], labelOption, points[2].y - points[3].y);
    var m0 = (points[2].y - points[0].y) / (points[2].x - points[0].x);
    var m1 = (points[3].y - points[1].y) / (points[3].x - points[1].x);
    var xVal = (points[1].y - points[0].y + m0 * points[0].x - m1 * points[1].x) / (m0 - m1);
    var minXVal = Math.min(...xPoints);
    var maxXVal = Math.max(...xPoints);
    var yVal = points[0].y + m0 * (xVal - points[0].x);
    var y0MinVal = points[0].y + m0 * (minXVal - points[0].x);
    var y1MinVal = points[1].y + m1 * (minXVal - points[1].x);
    var y0MaxVal = points[0].y + m0 * (maxXVal - points[0].x);
    var y1MaxVal = points[1].y + m1 * (maxXVal - points[1].x);

    var realMinXVal = minXVal;
    var realMaxXVal = maxXVal;
    var lastPoint = {};
    if (xVal < minXVal) {
      lastPoint = [{
          x: realMaxXVal,
          y: [y0MaxVal, y1MaxVal]
        },
        {
          x: realMaxXVal,
          y: [y1MaxVal, y1MaxVal]
        },
      ];
    } else {
      lastPoint = [{
          x: realMinXVal,
          y: [y0MinVal, y1MinVal]
        },
        {
          x: realMinXVal,
          y: [y1MinVal, y1MinVal]
        },
      ];
    }

    if (m0 !== m1) {
      var trianglePoints = [{
          x: xVal,
          y: [yVal, yVal]
        },
        ...lastPoint
      ];
      var newPoints = [{
        x: trianglePoints[0].x,
        y: trianglePoints[0].y[0]
      }];
      newPoints.push({
        x: trianglePoints[0].x,
        y: trianglePoints[0].y[1]
      })
      newPoints.push({
        x: trianglePoints[1].x,
        y: trianglePoints[1].y[1]
      });
      newPoints.push({
        x: trianglePoints[2].x,
        y: trianglePoints[2].y[1]
      });
      newPoints.push({
        x: trianglePoints[1].x,
        y: trianglePoints[1].y[0]
      });
      newPoints.push({
        x: trianglePoints[0].x,
        y: trianglePoints[0].y[0]
      });
      drawMultiRange(ctx, newPoints, option, true);
    }
  }
};

/**
 * @function drawThreePattern
 * @param {*} ctx 
 * @param {*} option 
 * @param {*} points 
 */

export function drawThreePattern(ctx, option, points) {
  if (points.length < 2) return;
  ctx.setLineDash([]);
  ctx.strokeStyle = option.mainLine.lineColor;
  ctx.lineCap = 'round';
  var lineOption = {
    thickness: option.hoverover ? 4 : parseInt(option.mainLine.lineThickness),
    dashType: [],
    color: option.hoverover ? option.hoverColor : option.mainLine.color
  };
  var labelOption = Object.assign(option.label, {
    lineColor: option.mainLine.lineColor
  });
  for (var i = 1; i < points.length; i++) {
    drawLine(ctx, points[i - 1], points[i], lineOption);
  }

  if (points.length > 3) {
    var bc = Math.abs(points[1].y - points[2].y);
    var cd = Math.abs(points[2].y - points[3].y);
    var label = (Math.round(cd * 1000 / bc) / 1000).toString();
    lineOption.thickness = 1;
    drawLine(ctx, points[1], points[3], lineOption);
    drawTextWithBackground(ctx, label, [points[1], points[3]], labelOption, 0);
    if (points.length > 5) {
      var de = Math.abs(points[3].y - points[4].y);
      var ef = Math.abs(points[4].y - points[5].y);
      label = (Math.round(ef * 1000 / de) / 1000).toString();
      drawLine(ctx, points[3], points[5], lineOption);
      drawTextWithBackground(ctx, label, [points[3], points[5]], labelOption, 0);
    }
  }
};

/**
 * @function drawHeaderShoulder
 * @param {*} ctx 
 * @param {*} option 
 * @param {*} points 
 * @param {*} lastX 
 * @param {*} firstX 
 */

export function drawHeadShoulder(ctx, option, points, lastX, firstX) {
  var titles = ["Left Shoulder", "Head", "Right Shoulder"];
  if (points.length < 2) return;
  ctx.setLineDash([]);
  ctx.strokeStyle = option.mainLine.lineColor;
  ctx.lineCap = 'round';
  var lineOption = {
    thickness: option.hoverover ? 4 : parseInt(option.mainLine.lineThickness),
    dashType: [],
    color: option.hoverover ? option.hoverColor : option.mainLine.color
  };
  var labelOption = Object.assign(option.label, {
    lineColor: option.mainLine.lineColor
  });

  for (var i = 1; i < points.length; i++) {
    drawLine(ctx, points[i - 1], points[i], lineOption);
    if (i % 2)
      drawTextWithBackground(ctx, titles[Math.round(i / 2) - 1], [points[i]], labelOption, points[i - 1].y - points[i].y);
  }

  var xPoints = points.map(point => point.x);
  var minX = Math.min(...xPoints);
  var maxX = Math.max(...xPoints);

  if (points.length > 4) {
    var minY = Math.min(points[0].y, points[1].y);
    var maxY = Math.max(points[0].y, points[1].y);

    var m0 = (points[1].y - points[0].y) / (points[1].x - points[0].x);
    var m1 = (points[4].y - points[2].y) / (points[4].x - points[2].x);
    var xVal = (points[2].y - points[0].y + m0 * points[0].x - m1 * points[2].x) / (m0 - m1);
    let yVal = points[0].y + m0 * (xVal - points[0].x);
    var triPoints = [];
    if (xVal >= minX && xVal <= maxX && yVal <= maxY && yVal >= minY) {
      triPoints = [{
          x: xVal,
          y: yVal
        },
        points[1],
        points[2]
      ];
    } else {
      var yMin = points[2].y + m1 * (firstX - points[2].x);
      triPoints = [{
        x: firstX,
        y: yMin
      }];
    }
    drawMultiRange(ctx, triPoints, option);
    drawLine(ctx, triPoints[0], points[2], lineOption);
    drawMultiRange(ctx, [points[2], points[3], points[4]], option);
    drawLine(ctx, points[2], points[4], lineOption);
    var yMax = points[4].y + m1 * (lastX - points[4].x);
    if (points.length > 6) {
      var m2 = (points[6].y - points[5].y) / (points[6].x - points[5].x);
      var x2 = (points[6].y - points[2].y + m1 * points[2].x - m2 * points[6].x) / (m1 - m2);
      let y2 = points[6].y + m2 * (x2 - points[6].x);
      var minY1 = Math.min(points[5].y, points[6].y);
      var maxY1 = Math.max(points[5].y, points[6].y);
      if (x2 >= minX && x2 <= maxX && y2 <= maxY1 && y2 >= minY1) {
        drawMultiRange(ctx, [{
          x: x2,
          y: y2
        }, points[4], points[5]], option);
        drawLine(ctx, points[4], {
          x: x2,
          y: y2
        }, lineOption);
      } else {
        drawLine(ctx, points[4], {
          x: lastX,
          y: yMax
        }, lineOption);
      }
    } else {
      drawLine(ctx, points[4], {
        x: lastX,
        y: yMax
      }, lineOption);
    }
  }
};

/**
 * @function drawElliottWave
 * @param {CanvasContext} ctx 
 * @param {Object} option 
 * @param {Array} points 
 */
export function drawElliottWave(ctx, option, points) {
  if (points.length < 2) return;
  ctx.setLineDash([]);
  ctx.strokeStyle = option.mainLine.lineColor;
  ctx.lineCap = 'round';
  var lineOption = {
    thickness: option.hoverover ? 4 : parseInt(option.mainLine.lineThickness),
    dashType: [],
    color: option.hoverover ? option.hoverColor : option.mainLine.color
  };
  var labelOption = Object.assign(option.label, {
    lineColor: 'transparent'
  });
  var labels = ['(0)', '(1)', '(2)', '(3)', '(4)', '(5)'];
  if (option.key === "triangle_wave" || option.key === "correction_wave") {
    labels = ['', '(A)', '(B)', '(C)', '(D)', '(E)']
  } else if (option.key === "triple_wave" || option.key === "double_wave") {
    labels = ['', '(W)', '(X)', '(Y)', '(X)', '(Z)']
  }

  for (var i = 1; i < points.length; i++) {
    drawLine(ctx, points[i - 1], points[i], lineOption);
    if (i === 1) {
      drawTextWithBackground(ctx, labels[0], [points[0]], labelOption, points[1].y - points[0].y);
    }
    drawTextWithBackground(ctx, labels[i], [points[i]], labelOption, points[i - 1].y - points[i].y);
  }
};

const source = ['open', 'high', 'low', 'close'];
export function drawMAIndicator(ctx, dataPoints, option, chart) {
  var key = option.key;
  var tempPoints = [];
  for (var i = option.len - 1; i < dataPoints.length; i++) {
    var xIndex = i + option.offset;
    if (xIndex < 0) xIndex = 0;
    if (xIndex > dataPoints.length - 1) xIndex = dataPoints.length - 1;
    let subsum = 0;
    let totalWeight = 0;
    let result = 0;
    for (var j = i + 1 - option.len; j <= i; j++) {
      if (key === 'ma')
        subsum += dataPoints[j].y[source.indexOf(option.source)];
      else if (key === 'wma') {
        subsum += (option.len - (i - j)) * dataPoints[j].y[source.indexOf(option.source)];
        totalWeight += option.len - (i - j);
      } else if (key === 'ema' && j > 0) {
        subsum += dataPoints[j - 1].y[source.indexOf(option.source)];
      }
    }

    if (key === 'ma') result = subsum / option.len;
    else if (key === 'wma') result = subsum / totalWeight;
    else if (key === 'ema') {
      var pema = subsum / option.len;
      if (i < option.len)
        pema = dataPoints[i - 1].y[source.indexOf(option.source)];
      result = (dataPoints[i].y[source.indexOf(option.source)] - pema) * (2 / (option.len + 1));
      result += pema;
    }
    var curPoint = {
      x: dataPoints[xIndex].x,
      y: result,
    };

    tempPoints.push(curPoint);
  }

  option.points = drawSpline(ctx, tempPoints, {
    lineColor: option.hoverover ? option.hoverColor : option.mainLine.lineColor,
    lineThickness: option.hoverover ? 4 : parseInt(option.mainLine.lineThickness)
  }, chart);
  return option;
}

export function drawIchimokuIndicator(ctx, tempPoints, setting, chart) {
  var tenkan = [];
  var kijun = [];
  var senkouA = [];
  var senkouB = [];
  var lagging = [];
  var chikou = [];

  var offset = 0;
  var tenkanValue = 0;
  var kijunValue = 0;
  var chikouIndex = 0;
  var kijunAValue = 0;
  var tenkanAValue = 0;
  var key = setting.key;

  var offsetSenkouA = setting.basePeriod;
  if (key === 'ichimoku') offsetSenkouA = setting.displacement;
  for (var i = 0; i < tempPoints.length; i++) {
    tenkanValue = getMiddle(tempPoints, i, setting.conversionPeriod);
    kijunValue = getMiddle(tempPoints, i, setting.basePeriod);

    tenkan.push({
      x: tempPoints[i].x,
      y: tenkanValue
    });

    kijun.push({
      x: tempPoints[i].x,
      y: kijunValue
    });

    if (tenkan.length <= offsetSenkouA) {
      tenkanAValue = getMiddle(tempPoints, i - offsetSenkouA, setting.conversionPeriod);
      kijunAValue = getMiddle(tempPoints, i - offsetSenkouA, setting.basePeriod);
    } else {
      tenkanAValue = tenkan[tenkan.length - offsetSenkouA].y;
      kijunAValue = kijun[kijun.length - offsetSenkouA].y;
    }

    chikouIndex = i + setting.displacement;
    if (chikouIndex < tempPoints.length) {
      chikou.push({
        x: tempPoints[i].x,
        y: tempPoints[chikouIndex].y[3]
      });
    }

    if (offset < setting.conversionPeriod)
      offset++;
    else offset = 0;

    if (key !== "ichimoku" && tempPoints[i].y.length <= 0) continue;
    if (tenkanAValue && kijunAValue) {
      senkouA.push({
        x: tempPoints[i].x,
        y: (tenkanAValue + kijunAValue) / 2
      });

      senkouB.push({
        x: tempPoints[i].x,
        y: getMiddle(tempPoints, i - setting.displacement, setting.laggingSpanPeriod)
      });

      lagging.push({
        x: tempPoints[i].x,
        y: [senkouA[senkouA.length - 1].y, senkouB[senkouB.length - 1].y],
      });
    }
  }

  setting.points = {};

  if (setting.tenkan.visible) {
    setting.points.tenkan = drawSpline(ctx, tenkan, {
      lineColor: setting.hoverover ? setting.hoverColor : setting.tenkan.lineColor,
      lineThickness: setting.hoverover ? 2 : setting.tenkan.lineThickness
    }, chart);
  }

  if (setting.kijun.visible) {
    setting.points.kijun = drawSpline(ctx, kijun, {
      lineColor: setting.hoverover ? setting.hoverColor : setting.kijun.lineColor,
      lineThickness: setting.hoverover ? 2 : setting.kijun.lineThickness
    }, chart);
  }

  if (setting.senkouA.visible) {
    setting.points.senkouA = drawSpline(ctx, senkouA, {
      lineColor: setting.hoverover ? setting.hoverColor : setting.senkouA.lineColor,
      lineThickness: setting.hoverover ? 2 : setting.senkouA.lineThickness
    }, chart);
  }

  if (setting.senkouB.visible) {
    setting.points.senkouB = drawSpline(ctx, senkouB, {
      lineColor: setting.hoverover ? setting.hoverColor : setting.senkouB.lineColor,
      lineThickness: setting.hoverover ? 2 : setting.senkouB.lineThickness
    }, chart);
  }

  if (setting.mainLine.visible) {
    setting.points.chikou = drawSpline(ctx, chikou, {
      lineColor: setting.hoverover ? setting.hoverColor : setting.mainLine.lineColor,
      lineThickness: setting.hoverover ? 2 : setting.mainLine.lineThickness
    }, chart);
  }

  if (setting.lagging.visible) {
    drawSplineRange(ctx, lagging, setting.lagging.color, chart);
  }
  return setting;
}

export function drawAnalysis(ctx, option, points, lastViewX, minViewX, chart, precision, newDraw = false, dataPoints, margin, tooltipFlag) {
  // $('.analyze').css('display', 'none');
  var point = points[0];
  var valY = 0;
  var currentVal = {};
  for (var i = dataPoints.length - 1; i > 0; i--) {
    if (dataPoints[i].y.length > 0) {
      currentVal.y = dataPoints[i].y[3];
      currentVal.x = dataPoints[i].x;
      break;
    }
  }

  // check value validation
  let validFlag = false;
  let msg = '';
  let direction = 'down';
  if (points.length > 0 && point) {
    valY = Math.round(chart.axisY2[0].convertPixelToValue(point.y) * Math.pow(10, precision)) / Math.pow(10, precision);
    if (parseInt(option.selected) >= 0) {
      if (option.selected == 0) {
        if (validFlag = option.signals[8].value.y <= 0) {
          option.signals[8].value.y = currentVal.y;
        }
        if (validFlag = valY > option.signals[8].value.y) {
          valY = option.signals[8].value.y;
          msg = `<font color="${option.signals[0].color}">Support</font> value  cannot be <b>above</b> the<br/><font color="${option.signals[8].color}">Pivot</font> value (Move cursor down)`;
          direction = 'down';
        } else if (validFlag = (option.signals[1].value.y > 0 && valY < option.signals[1].value.y)) {
          valY = option.signals[1].value.y;
          msg = `<font color="${option.signals[0].color}">First Support</font> value  cannot be <b>below</b> the<br/><font color="${option.signals[1].color}">Second Support</font> value (Move cursor up)`;
          direction = 'up';
        } else if (validFlag = (option.signals[3].value.y > 0 && valY > option.signals[3].value.y)) {
          valY = option.signals[3].value.y;
          // msg = `<font color="${option.signals[0].color}">First Support</font> value  cannot be <b>below</b> the <font color="${option.signals[1].color}">Second Support</font> value(Move cursor up)`;
        }
      } else if (option.selected == 1) {
        if (validFlag = option.signals[8].value.y <= 0) option.signals[8].value.y = currentVal.y;
        if (validFlag = valY > option.signals[0].value.y) {
          valY = option.signals[0].value.y;
          msg = `<font color="${option.signals[1].color}">Second Support</font> value  cannot be <b>above</b> the<br/><font color="${option.signals[0].color}">First Support</font> value (Move cursor down)`;
          direction = 'down';
        }
      } else if (option.selected == 2) {
        if (validFlag = option.signals[8].value.y <= 0) option.signals[8].value.y = currentVal.y;
        if (validFlag = option.signals[0].value.y <= 0) option.signals[0].value.y = option.signals[8].value.y;
        if (validFlag = valY > option.signals[8].value.y) {
          valY = option.signals[8].value.y;
          msg = `<font color="${option.signals[2].color}">${option.signals[2].title}</font> value  cannot be <b>above</b> the<br/><font color="${option.signals[8].color}">Pivot</font> value (Move cursor down)`;
          direction = 'down';
        } else if (validFlag = valY < option.signals[0].value.y) {
          valY = option.signals[0].value.y;
          msg = `<font color="${option.signals[2].color}">${option.signals[2].title}</font> value  cannot be <b>below</b> the<br/><font color="${option.signals[0].color}">First Support</font> value (Move cursor up)`;
          direction = 'up';
        }
      } else if (option.selected == 3) {
        if (option.signals[0].value.y == 0) {
          const between = chart.axisY2[0].convertPixelToValue(0) - chart.axisY2[0].convertPixelToValue(30);
          option.signals[0].value.y = parseFloat(Number(valY - between).toFixed(precision));
        }
        if (validFlag = valY < option.signals[0].value.y) valY = option.signals[0].value.y;
        else if (validFlag = valY > currentVal.y) valY = currentVal.y;

      } else if (option.selected == 7) {
        if (validFlag = option.signals[8].value.y <= 0) option.signals[8].value.y = currentVal.y;
        if (validFlag = valY < option.signals[8].value.y) {
          valY = option.signals[8].value.y;
          msg = `<font color="${option.signals[7].color}">Resistance</font> value  cannot be <b>below</b> the<br/><font color="${option.signals[8].color}">Pivot</font> value (Move cursor up)`;
          direction = 'up';
        } else if (validFlag = option.signals[6].value.y > 0 && valY > option.signals[6].value.y) {
          valY = option.signals[6].value.y;
          msg = `<font color="${option.signals[7].color}">First Resistance</font> value  cannot be <b>above</b> the<br/><font color="${option.signals[6].color}">Second Resistance</font> value (Move cursor down)`;
          direction = 'down';
        } else if (validFlag = option.signals[4].value.y > 0 && valY < option.signals[4].value.y) valY = option.signals[4].value.y;
      } else if (option.selected == 6) {
        if (validFlag = option.signals[7].value.y <= currentVal.y) option.signals[7].value.y = currentVal.y;
        if (validFlag = valY < option.signals[7].value.y) {
          valY = option.signals[7].value.y;
          msg = `<font color="${option.signals[6].color}">Second Resistance</font> value  cannot be <b>below</b> the<br/><font color="${option.signals[7].color}">First Resistance</font> value (Move cursor up)`;
          direction = 'up';
        }
      } else if (option.selected == 5) {
        if (validFlag = option.signals[8].value.y <= 0) option.signals[8].value.y = currentVal.y;
        if (validFlag = option.signals[7].value.y <= 0) option.signals[7].value.y = option.signals[8].value.y;
        if (validFlag = valY < option.signals[8].value.y) {
          valY = option.signals[8].value.y;
          msg = `<font color="${option.signals[5].color}">${option.signals[5].title}</font> value  cannot be <b>below</b> the<br/><font color="${option.signals[8].color}">Pivot</font> value (Move cursor up)`;
          direction = 'up';
        } else if (validFlag = valY > option.signals[7].value.y) {
          valY = option.signals[7].value.y;
          msg = `<font color="${option.signals[5].color}">${option.signals[5].title}</font> value  cannot be <b>above</b> the<br/><font color="${option.signals[7].color}">First Resistance</font> value (Move cursor down)`;
          direction = 'down';
        }
      } else if (option.selected == 4) {
        if (option.signals[7].value.y == 0) {
          const between = chart.axisY2[0].convertPixelToValue(0) - chart.axisY2[0].convertPixelToValue(30);
          option.signals[7].value.y = parseFloat(Number(valY + between).toFixed(precision));
        }
        if (validFlag = valY > option.signals[7].value.y) valY = option.signals[7].value.y;
        else if (validFlag = valY < currentVal.y) valY = currentVal.y;
        if (option.signals[7].value.y == 0)
          option.signals[7].value.y = currentVal.y;
      } else if (option.selected == 8 && newDraw) {
        if (validFlag = (option.signals[0].value.y > 0 && valY < option.signals[0].value.y)) {
          valY = option.signals[0].value.y
        }

        if (validFlag = (option.signals[7].value.y > 0 && valY > option.signals[7].value.y)) {
          valY = option.signals[7].value.y
        }

        if (option._atype === 'bullish_bounce') {
          if (validFlag = valY > currentVal.y) valY = currentVal.y;
        } else if (option._atype === 'bullish_rise') {
          if (validFlag = valY !== currentVal.y) valY = currentVal.y;
        } else if (option._atype === 'bullish_breakout') {
          if (validFlag = valY < currentVal.y) valY = currentVal.y;
        } else if (option._atype === 'bearish_bounce') {
          if (validFlag = valY < currentVal.y) valY = currentVal.y;
        } else if (option._atype === 'bearish_drop') {
          if (validFlag = valY !== currentVal.y) valY = currentVal.y;
        } else if (option._atype === 'bearish_breakout') {
          if (validFlag = valY > currentVal.y) valY = currentVal.y;
        }
      }
    }
  }

  ctx.setLineDash([]);
  ctx.lineCap = 'round';
  var signalFlag = false;
  var stripLine = null;
  var tempStripLines = [];
  // draw lines
  var lastPoint = point;
  for (var i = 0; i < 9; i++) {
    var realY = 0;
    var realX = 0;
    var val = valY;
    var realX = 0;
    var offset = 0;
    if (i != parseInt(option.selected) && option.signals[i].value.y != 0) {
      if (option.signals[i].visible) {
        val = option.signals[i].value.y;
        realX = parseInt(chart.axisX[0].convertValueToPixel(option.signals[i].value.x > 0 ? option.signals[i].value.x : currentVal.x));
        realY = parseInt(chart.axisY2[0].convertValueToPixel(option.signals[i].value.y));

        let hover = option.hoverover;
        if (option.sub_hovers && option.sub_hovers.length > 0) {
          hover = hover && option.sub_hovers.indexOf(i.toString()) >= 0;
        }
        drawLine(ctx, {
          x: realX < 0 ? 0 : realX,
          y: realY
        }, {
          x: lastViewX,
          y: realY
        }, {
          thickness: hover ? 4 : 2,
          dashType: [],
          color: hover ? option.hoverColor : option.signals[i].color
        });
      }
    } else if (i == parseInt(option.selected) && valY > 0) {
      if (!newDraw) {
        valY = option.signals[i].value.y;
      }
      var valX;
      if (points.length <= 0)
        valX = option.signals[option.selected].value.x;
      if (point)
        valX = chart.axisX[0].convertPixelToValue(point.x);
      realY = parseInt(chart.axisY2[0].convertValueToPixel(valY));
      realX = parseInt(points[0].x)
      if (option.active) {
        drawLine(ctx, {
          x: minViewX,
          y: realY
        }, {
          x: realX,
          y: realY
        }, {
          thickness: 2,
          dashType: [3, 5],
          color: option.signals[i].color
        });
      }

      drawLine(ctx, {
        x: lastViewX,
        y: realY
      }, {
        x: realX,
        y: realY
      }, {
        thickness: 2,
        dashType: [],
        color: option.signals[i].color
      });
      var ppow = Math.pow(10, precision);
      option.signals[i].value = {
        x: valX,
        y: Math.round(valY * ppow) / ppow
      };
      lastPoint = {
        x: realX,
        y: realY
      };

      var labelVal = Math.round(Math.pow(10, precision) * val) / Math.pow(10, precision);
      stripLine = {
        value: val,
        label: labelVal.toString(),
        labelPlacement: 'inside',
        color: 'transparent',
        labelFontColor: "white",
        labelAlign: 'near',
        labelBackgroundColor: option.signals[i].color,
        labelFontSize: 12,
        orgColor: option.signals[i].color,
        orgFontColor: "white",
        objectType: 'trade',
        optionId: option.id,
        pIndex: i
      };
    }

    if (option.signals[i].visible) {
      if (realX > lastViewX) continue;
      if (option.signals[i].value.y != 0 && realY < chart.height - 45 && realY > 0) {
        var textOffset = getTextStyle(option.signals[i].title, {
          fontSize: 12
        });
        // var labelX = chart.axisX[0].convertValueToPixel(option.signals[i].labelX);
        drawText(ctx, option.signals[i].title, lastViewX - textOffset.x - 10, realY - 7, {
          color: option.signals[i].color,
          font: 'normal normal 12px Arial',
        });
        var obj = $(`.analysis_${option.id}_` + i);
        if (obj.length > 0) {
          obj.css("top", parseInt(realY) + 10).css("display", option.signals[i].value.y != 0 && option.signals[i].visible ? "inline-flex" : "none");
          $(`.analysis_${option.id}_` + i).rating('set rating', option.signals[i].rate);
        } else {
          var rateObj = document.createElement("div");
          $(rateObj).addClass(`analysis_${option.id}_` + i).addClass("ui rating star analyze");
          $(rateObj).css("position", "absolute").css("top", parseInt(realY) + 10).css("right", margin + 10).css("transform", "rotateY(180deg)");
          $(chart.container).find('.canvasjs-chart-container').append(rateObj);
          $(rateObj).rating({
            initialRating: option.signals[i].rate,
            maxRating: 3
          }).rating('disable');
        }
      }
    } else {
      $(`.analysis_${option.id}_` + i).css("display", "none");
      continue;
    }
  }

  // if (stripLine) {
  //   const ttStripLines = chart.options.axisY2.stripLines;
  //   const tIndex = ttStripLines.findIndex(o => (o.optionId === option.id && o.pIndex == parseInt(option.selected)));
  //   if (tIndex > -1) {
  //     ttStripLines[tIndex] = stripLine;
  //   } else {
  //     ttStripLines.push(stripLine);
  //   }
  //   chart.options.axisY2.stripLines = ttStripLines;
  //   chart.render();
  // }
  if (validFlag && msg.length > 0 && !tooltipFlag) {
    var tooltipElm = $(`#${option.containerId} .analysis-tooltip`);
    if (tooltipElm.length > 0) {
      $(tooltipElm).removeClass('up down').addClass(direction).addClass('active')
      $(tooltipElm).find('.description').html(msg);
    } else {
      tooltipElm = document.createElement('div')
      $(tooltipElm).addClass(`analysis-tooltip ${direction} active`);
      $(tooltipElm).html(`
        <div class="b-arr"></div>
        <div class="ui icon">
          <svg class="down" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0)">
              <path d="M5.35844 12.8972L5.35501 12.8938V12.8933H5.35458L5.29922 12.8427C5.29722 12.8407 5.29478 12.8397 5.29192 12.8397C5.28906 12.8397 5.28663 12.8407 5.28463 12.8427L5.28205 12.8461C5.28034 12.8481 5.27962 12.8504 5.27991 12.853C5.28019 12.8556 5.28134 12.8578 5.28334 12.8598L5.31639 12.8899H5.15674V12.7294L5.18678 12.7624C5.18878 12.7644 5.19107 12.7656 5.19365 12.7659C5.19622 12.7662 5.19851 12.7654 5.20051 12.7637L5.20395 12.7611C5.20595 12.7591 5.20695 12.7567 5.20695 12.7538C5.20695 12.751 5.20595 12.7486 5.20395 12.7466L5.15545 12.6933C5.15431 12.691 5.15259 12.6892 5.1503 12.6878L5.14944 12.6873C5.14773 12.6853 5.14551 12.6843 5.14279 12.6843C5.14007 12.6843 5.13771 12.6853 5.13571 12.6873L5.13228 12.6908L5.13185 12.6912L5.0825 12.7457C5.08049 12.7477 5.07949 12.7501 5.07949 12.753C5.07949 12.7559 5.08049 12.7583 5.0825 12.7603L5.08593 12.7629C5.0865 12.7634 5.08707 12.7639 5.08765 12.7641C5.08822 12.7644 5.08886 12.7646 5.08958 12.7648C5.09029 12.7649 5.09101 12.765 5.09172 12.765C5.09244 12.765 5.09315 12.7649 5.09387 12.7648C5.09458 12.7646 5.0953 12.7644 5.09602 12.7641C5.09673 12.7639 5.09737 12.7635 5.09795 12.7631C5.09852 12.7626 5.09909 12.7621 5.09966 12.7616L5.12927 12.7285V12.8895H4.96791L5.00096 12.8598C5.00296 12.8578 5.0041 12.8556 5.00439 12.853C5.00468 12.8504 5.00396 12.8481 5.00224 12.8461L4.99967 12.8427C4.99853 12.8413 4.99702 12.8403 4.99516 12.8399C4.9933 12.8395 4.99152 12.8395 4.9898 12.8399C4.98808 12.8403 4.98651 12.8413 4.98508 12.8427L4.93186 12.8912C4.92957 12.8923 4.92772 12.894 4.92628 12.8963L4.92586 12.8972C4.92385 12.8989 4.92285 12.9011 4.92285 12.9038C4.92285 12.9066 4.92385 12.9089 4.92586 12.9109L4.92929 12.9144L4.92972 12.9148L4.98422 12.9641C4.98565 12.9653 4.98722 12.9661 4.98894 12.9667C4.99066 12.9673 4.99245 12.9673 4.99431 12.9667C4.99617 12.9661 4.99767 12.9653 4.99881 12.9641L5.00139 12.9607C5.00253 12.9596 5.00325 12.9581 5.00353 12.9564C5.00382 12.9547 5.0036 12.953 5.00289 12.9513C5.00217 12.9495 5.00124 12.9481 5.0001 12.947L4.96663 12.9174H5.12927V13.0787L5.09966 13.0457C5.09766 13.0437 5.09537 13.0425 5.0928 13.0422C5.09022 13.042 5.08793 13.0427 5.08593 13.0444L5.0825 13.047C5.08135 13.0481 5.08049 13.0496 5.07992 13.0515C5.07935 13.0533 5.07935 13.0551 5.07992 13.0568C5.08049 13.0585 5.08135 13.0601 5.0825 13.0616L5.13185 13.1161L5.13228 13.1165L5.13571 13.1199C5.13771 13.1219 5.14007 13.1229 5.14279 13.1229C5.14551 13.1229 5.14773 13.1219 5.14944 13.1199L5.15288 13.1165C5.15316 13.1165 5.15331 13.1164 5.15331 13.1163V13.1161L5.20395 13.0607C5.20595 13.0587 5.20695 13.0563 5.20695 13.0534C5.20695 13.0505 5.20595 13.0481 5.20395 13.0461L5.20051 13.0435C5.19851 13.0418 5.19622 13.0411 5.19365 13.0414C5.19107 13.0417 5.18878 13.0428 5.18678 13.0448L5.15717 13.0779V12.9174H5.31724L5.2842 12.947C5.2822 12.949 5.28105 12.9513 5.28077 12.9538C5.28048 12.9564 5.28119 12.9587 5.28291 12.9607L5.28549 12.9641C5.28663 12.9653 5.28813 12.9661 5.28999 12.9667C5.29185 12.9673 5.29364 12.9673 5.29536 12.9667C5.29707 12.9661 5.29865 12.9653 5.30008 12.9641L5.35458 12.9148C5.35458 12.9145 5.35472 12.9144 5.35501 12.9144L5.35844 12.9109C5.36045 12.9089 5.36145 12.9066 5.36145 12.9038C5.36145 12.9011 5.36045 12.8989 5.35844 12.8972Z" fill="#FCFCFC"/>
            </g>
            <path d="M17.4375 14.125H11.8125C11.6602 14.125 11.5283 14.0693 11.417 13.958C11.3057 13.8467 11.25 13.7148 11.25 13.5625V12.4375C11.25 12.2852 11.3057 12.1533 11.417 12.042C11.5283 11.9307 11.6602 11.875 11.8125 11.875H17.4375C17.5898 11.875 17.7217 11.9307 17.833 12.042C17.9443 12.1533 18 12.2852 18 12.4375V13.5625C18 13.7148 17.9443 13.8467 17.833 13.958C17.7217 14.0693 17.5898 14.125 17.4375 14.125ZM9.5625 22H8.4375C8.28516 22 8.15332 21.9443 8.04199 21.833C7.93066 21.7217 7.875 21.5898 7.875 21.4375V15.8125C7.875 15.6602 7.93066 15.5283 8.04199 15.417C8.15332 15.3057 8.28516 15.25 8.4375 15.25H9.5625C9.71484 15.25 9.84668 15.3057 9.95801 15.417C10.0693 15.5283 10.125 15.6602 10.125 15.8125V21.4375C10.125 21.5898 10.0693 21.7217 9.95801 21.833C9.84668 21.9443 9.71484 22 9.5625 22ZM9 14.125C8.68359 14.125 8.41699 14.0166 8.2002 13.7998C7.9834 13.583 7.875 13.3164 7.875 13C7.875 12.6836 7.9834 12.417 8.2002 12.2002C8.41699 11.9834 8.68359 11.875 9 11.875C9.31641 11.875 9.58301 11.9834 9.7998 12.2002C10.0166 12.417 10.125 12.6836 10.125 13C10.125 13.3164 10.0166 13.583 9.7998 13.7998C9.58301 14.0166 9.31641 14.125 9 14.125ZM9.5625 10.75H8.4375C8.28516 10.75 8.15332 10.6943 8.04199 10.583C7.93066 10.4717 7.875 10.3398 7.875 10.1875V4.5625C7.875 4.41016 7.93066 4.27832 8.04199 4.16699C8.15332 4.05566 8.28516 4 8.4375 4H9.5625C9.71484 4 9.84668 4.05566 9.95801 4.16699C10.0693 4.27832 10.125 4.41016 10.125 4.5625V10.1875C10.125 10.3398 10.0693 10.4717 9.95801 10.583C9.84668 10.6943 9.71484 10.75 9.5625 10.75ZM6.1875 14.125H0.5625C0.410156 14.125 0.27832 14.0693 0.166992 13.958C0.0556641 13.8467 0 13.7148 0 13.5625V12.4375C0 12.2852 0.0556641 12.1533 0.166992 12.042C0.27832 11.9307 0.410156 11.875 0.5625 11.875H6.1875C6.33984 11.875 6.47168 11.9307 6.58301 12.042C6.69434 12.1533 6.75 12.2852 6.75 12.4375V13.5625C6.75 13.7148 6.69434 13.8467 6.58301 13.958C6.47168 14.0693 6.33984 14.125 6.1875 14.125Z" fill="#FCFCFC"/>
            <path d="M14.5 4.3L14.85 3.95L17.85 6.95L20.85 3.95L21.2 4.3L18.05 7.5H17.7L14.5 4.3ZM14.5 1.3L14.85 0.95L17.85 3.95L20.85 0.95L21.2 1.3L18.05 4.5H17.7L14.5 1.3Z" fill="#FCFCFC"/>
            <defs>
              <clipPath id="clip0">
                <rect width="0.439453" height="0.439453" fill="white" transform="translate(4.92188 12.6836)"/>
              </clipPath>
            </defs>
          </svg>
          <svg class="up" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0)">
              <path d="M5.35844 12.8972L5.35501 12.8938V12.8933H5.35458L5.29922 12.8427C5.29722 12.8407 5.29478 12.8397 5.29192 12.8397C5.28906 12.8397 5.28663 12.8407 5.28463 12.8427L5.28205 12.8461C5.28034 12.8481 5.27962 12.8504 5.27991 12.853C5.28019 12.8556 5.28134 12.8578 5.28334 12.8598L5.31639 12.8899H5.15674V12.7294L5.18678 12.7624C5.18878 12.7644 5.19107 12.7656 5.19365 12.7659C5.19622 12.7662 5.19851 12.7654 5.20051 12.7637L5.20395 12.7611C5.20595 12.7591 5.20695 12.7567 5.20695 12.7538C5.20695 12.751 5.20595 12.7486 5.20395 12.7466L5.15545 12.6933C5.15431 12.691 5.15259 12.6892 5.1503 12.6878L5.14944 12.6873C5.14773 12.6853 5.14551 12.6843 5.14279 12.6843C5.14007 12.6843 5.13771 12.6853 5.13571 12.6873L5.13228 12.6908L5.13185 12.6912L5.0825 12.7457C5.08049 12.7477 5.07949 12.7501 5.07949 12.753C5.07949 12.7559 5.08049 12.7583 5.0825 12.7603L5.08593 12.7629C5.0865 12.7634 5.08707 12.7639 5.08765 12.7641C5.08822 12.7644 5.08886 12.7646 5.08958 12.7648C5.09029 12.7649 5.09101 12.765 5.09172 12.765C5.09244 12.765 5.09315 12.7649 5.09387 12.7648C5.09458 12.7646 5.0953 12.7644 5.09602 12.7641C5.09673 12.7639 5.09737 12.7635 5.09795 12.7631C5.09852 12.7626 5.09909 12.7621 5.09966 12.7616L5.12927 12.7285V12.8895H4.96791L5.00096 12.8598C5.00296 12.8578 5.0041 12.8556 5.00439 12.853C5.00468 12.8504 5.00396 12.8481 5.00224 12.8461L4.99967 12.8427C4.99853 12.8413 4.99702 12.8403 4.99516 12.8399C4.9933 12.8395 4.99152 12.8395 4.9898 12.8399C4.98808 12.8403 4.98651 12.8413 4.98508 12.8427L4.93186 12.8912C4.92957 12.8923 4.92772 12.894 4.92628 12.8963L4.92586 12.8972C4.92385 12.8989 4.92285 12.9011 4.92285 12.9038C4.92285 12.9066 4.92385 12.9089 4.92586 12.9109L4.92929 12.9144L4.92972 12.9148L4.98422 12.9641C4.98565 12.9653 4.98722 12.9661 4.98894 12.9667C4.99066 12.9673 4.99245 12.9673 4.99431 12.9667C4.99617 12.9661 4.99767 12.9653 4.99881 12.9641L5.00139 12.9607C5.00253 12.9596 5.00325 12.9581 5.00353 12.9564C5.00382 12.9547 5.0036 12.953 5.00289 12.9513C5.00217 12.9495 5.00124 12.9481 5.0001 12.947L4.96663 12.9174H5.12927V13.0787L5.09966 13.0457C5.09766 13.0437 5.09537 13.0425 5.0928 13.0422C5.09022 13.042 5.08793 13.0427 5.08593 13.0444L5.0825 13.047C5.08135 13.0481 5.08049 13.0496 5.07992 13.0515C5.07935 13.0533 5.07935 13.0551 5.07992 13.0568C5.08049 13.0585 5.08135 13.0601 5.0825 13.0616L5.13185 13.1161L5.13228 13.1165L5.13571 13.1199C5.13771 13.1219 5.14007 13.1229 5.14279 13.1229C5.14551 13.1229 5.14773 13.1219 5.14944 13.1199L5.15288 13.1165C5.15316 13.1165 5.15331 13.1164 5.15331 13.1163V13.1161L5.20395 13.0607C5.20595 13.0587 5.20695 13.0563 5.20695 13.0534C5.20695 13.0505 5.20595 13.0481 5.20395 13.0461L5.20051 13.0435C5.19851 13.0418 5.19622 13.0411 5.19365 13.0414C5.19107 13.0417 5.18878 13.0428 5.18678 13.0448L5.15717 13.0779V12.9174H5.31724L5.2842 12.947C5.2822 12.949 5.28105 12.9513 5.28077 12.9538C5.28048 12.9564 5.28119 12.9587 5.28291 12.9607L5.28549 12.9641C5.28663 12.9653 5.28813 12.9661 5.28999 12.9667C5.29185 12.9673 5.29364 12.9673 5.29536 12.9667C5.29707 12.9661 5.29865 12.9653 5.30008 12.9641L5.35458 12.9148C5.35458 12.9145 5.35472 12.9144 5.35501 12.9144L5.35844 12.9109C5.36045 12.9089 5.36145 12.9066 5.36145 12.9038C5.36145 12.9011 5.36045 12.8989 5.35844 12.8972Z" fill="#FCFCFC"/>
            </g>
            <path d="M17.4375 14.125H11.8125C11.6602 14.125 11.5283 14.0693 11.417 13.958C11.3057 13.8467 11.25 13.7148 11.25 13.5625V12.4375C11.25 12.2852 11.3057 12.1533 11.417 12.042C11.5283 11.9307 11.6602 11.875 11.8125 11.875H17.4375C17.5898 11.875 17.7217 11.9307 17.833 12.042C17.9443 12.1533 18 12.2852 18 12.4375V13.5625C18 13.7148 17.9443 13.8467 17.833 13.958C17.7217 14.0693 17.5898 14.125 17.4375 14.125ZM9.5625 22H8.4375C8.28516 22 8.15332 21.9443 8.04199 21.833C7.93066 21.7217 7.875 21.5898 7.875 21.4375V15.8125C7.875 15.6602 7.93066 15.5283 8.04199 15.417C8.15332 15.3057 8.28516 15.25 8.4375 15.25H9.5625C9.71484 15.25 9.84668 15.3057 9.95801 15.417C10.0693 15.5283 10.125 15.6602 10.125 15.8125V21.4375C10.125 21.5898 10.0693 21.7217 9.95801 21.833C9.84668 21.9443 9.71484 22 9.5625 22ZM9 14.125C8.68359 14.125 8.41699 14.0166 8.2002 13.7998C7.9834 13.583 7.875 13.3164 7.875 13C7.875 12.6836 7.9834 12.417 8.2002 12.2002C8.41699 11.9834 8.68359 11.875 9 11.875C9.31641 11.875 9.58301 11.9834 9.7998 12.2002C10.0166 12.417 10.125 12.6836 10.125 13C10.125 13.3164 10.0166 13.583 9.7998 13.7998C9.58301 14.0166 9.31641 14.125 9 14.125ZM9.5625 10.75H8.4375C8.28516 10.75 8.15332 10.6943 8.04199 10.583C7.93066 10.4717 7.875 10.3398 7.875 10.1875V4.5625C7.875 4.41016 7.93066 4.27832 8.04199 4.16699C8.15332 4.05566 8.28516 4 8.4375 4H9.5625C9.71484 4 9.84668 4.05566 9.95801 4.16699C10.0693 4.27832 10.125 4.41016 10.125 4.5625V10.1875C10.125 10.3398 10.0693 10.4717 9.95801 10.583C9.84668 10.6943 9.71484 10.75 9.5625 10.75ZM6.1875 14.125H0.5625C0.410156 14.125 0.27832 14.0693 0.166992 13.958C0.0556641 13.8467 0 13.7148 0 13.5625V12.4375C0 12.2852 0.0556641 12.1533 0.166992 12.042C0.27832 11.9307 0.410156 11.875 0.5625 11.875H6.1875C6.33984 11.875 6.47168 11.9307 6.58301 12.042C6.69434 12.1533 6.75 12.2852 6.75 12.4375V13.5625C6.75 13.7148 6.69434 13.8467 6.58301 13.958C6.47168 14.0693 6.33984 14.125 6.1875 14.125Z" fill="#FCFCFC"/>
            <path d="M14.5 3.7L14.85 4.05L17.85 1.05L20.85 4.05L21.2 3.7L18.05 0.5H17.7L14.5 3.7ZM14.5 6.7L14.85 7.05L17.85 4.05L20.85 7.05L21.2 6.7L18.05 3.5H17.7L14.5 6.7Z" fill="#FCFCFC"/>
            <defs>
              <clipPath id="clip0">
                <rect width="0.439453" height="0.439453" fill="white" transform="translate(4.92188 12.6836)"/>
              </clipPath>
            </defs>
          </svg>
        </div>
        <div class="description">
          ${msg}
        </div>
      `);
      $(`#${option.containerId} .canvasjs-chart-container`).append(tooltipElm);
    }
    // var height = $(tooltipElm).height();
    var xPos = point.x - 20;
    var yPos = point.y - 58;

    if (yPos < 0) {
      yPos = 0
    }
    var minWidth = 280;
    var selectedIndex = parseInt(option.selected);
    if (selectedIndex == 2 || selectedIndex == 5) {
      minWidth = 370;
    } else if (selectedIndex > 4) {
      if (selectedIndex < 7)
        minWidth = 330;
      else
        minWidth = 300;
    } else if (selectedIndex == 1) {
      minWidth = 330;
    }
    var xLimit = chart.get('width') - minWidth;
    if (xPos > xLimit) {
      xPos = xLimit;
      let offset = point.x - xLimit;
      if (offset > minWidth - 30) {
        offset = minWidth - 30;
      }
      $(tooltipElm).find('.b-arr').css('left', offset - 5);
    } else {
      $(tooltipElm).find('.b-arr').css('left', '1em');
    }
    $(tooltipElm).css('top', yPos).css('left', xPos).css('minWidth', minWidth);
  } else {
    $(`#${option.containerId} .analysis-tooltip`).removeClass('active');
  }
  return {
    flag: validFlag,
    option,
    point: lastPoint,
    priceOption: stripLine
  };
};

export function drawTradeLines(ctx, option, points, lastViewX, minViewX, chart, precision, dataPoints, lastX, finalPrice, margin) {
  $('.analyze').css('display', 'none');
  var point = points[0];
  var valY = 0;
  // setting current value of d 
  if (option.signals[0].value.y == 0 && option.selected > 0) {
    for (var i = dataPoints.length - 1; i > 0; i--) {
      if (dataPoints[i].y.length > 0) {
        option.signals[0].value.y = finalPrice;
        option.signals[0].value.x = dataPoints[i].x;
        option.status = 'Open';
        break;
      }
    }
  }
  if (points.length > 0) {
    valY = Math.round(chart.axisY2[0].convertPixelToValue(point.y) * Math.pow(10, precision)) / Math.pow(10, precision);

    if (option.selected >= 0) {
      if (option.selFlag) {
        if (option.selected == 1 && valY < option.signals[0].value.y) valY = option.signals[0].value.y;
        else if (option.selected == 2 && valY > option.signals[0].value.y) valY = option.signals[0].value.y;
        else if (option.selected == 3 || option.selected == 5 || option.selected == 6) {
          if (valY < option.signals[0].value.y + option.signals[2].value.y) valY = option.signals[0].value.y + option.signals[2].value.y;
          else if (valY > option.signals[0].value.y) valY = option.signals[0].value.y;
        } else if (option.selected == 4) {
          if (valY < option.signals[0].value.y) valY = option.signals[0].value.y;
          else if (valY > option.signals[0].value.y + option.signals[1].value.y) valY = option.signals[0].value.y + option.signals[1].value.y;
        }
      } else {
        if (option.selected == 1 && valY > option.signals[0].value.y) valY = option.signals[0].value.y;
        else if (option.selected == 2 && valY < option.signals[0].value.y) valY = option.signals[0].value.y;
        else if (option.selected == 3 || option.selected == 5 || option.selected == 6) {
          if (valY > option.signals[0].value.y + option.signals[2].value.y) valY = option.signals[0].value.y + option.signals[2].value.y;
          else if (valY < option.signals[0].value.y) valY = option.signals[0].value.y;
        } else if (option.selected == 4) {
          if (valY > option.signals[0].value.y) valY = option.signals[0].value.y;
          else if (valY < option.signals[0].value.y + option.signals[1].value.y) valY = option.signals[0].value.y + option.signals[1].value.y;
        }
      }
    }
  }

  ctx.setLineDash([]);
  ctx.lineCap = 'round';
  var signalFlag = false;
  var stripLines = [];
  for (var i = 0; i < 7; i++) {
    var key = i;
    var val = 0;
    var realX = 0;

    if (key != option.selected && option.signals[i].value.y != 0) {
      if (i > 3 && !option.advanced) continue;
      if (!option.signals[i].visible) continue;

      if (key > 0) {
        val = parseFloat(option.signals[0].value.y) + parseFloat(option.signals[i].value.y)
      } else {
        val = option.signals[i].value.y;
      }

      if (option.signals[i].value.x > 0) {
        realX = parseInt(chart.axisX[0].convertValueToPixel(option.signals[i].value.x));
      } else {
        realX = parseInt(chart.axisX[0].convertValueToPixel(lastX));
      }

      var realY = parseInt(chart.axisY2[0].convertValueToPixel(val));

      let hover = option.hoverover;
      if (option.sub_hovers && option.sub_hovers.length > 0) {
        hover = hover && option.sub_hovers.indexOf(i.toString()) >= 0;
      }
      drawLine(ctx, {
        x: realX,
        y: realY
      }, {
        x: lastViewX,
        y: realY
      }, {
        thickness: 2,
        dashType: [],
        color: hover ? option.hoverColor : option.signals[i].color
      });


    } else if (key == option.selected) {
      var valX = option.signals[option.selected].value.x;
      if (point) {
        valX = chart.axisX[0].convertPixelToValue(point.x);
      }

      var realY = chart.axisY2[0].convertValueToPixel(valY);
      realX = points[0].x
      val = valY;
      drawLine(ctx, {
        x: minViewX,
        y: realY
      }, {
        x: points[0].x,
        y: realY
      }, {
        thickness: 2,
        dashType: [3, 5],
        color: option.signals[i].color
      });
      drawLine(ctx, {
        x: lastViewX,
        y: realY
      }, {
        x: points[0].x,
        y: realY
      }, {
        thickness: 2,
        dashType: [],
        color: option.signals[i].color
      });
      var ppow = Math.pow(10, precision);
      var offsetY = valY;
      if (key > 0) offsetY -= option.signals[0].value.y;
      option.signals[i].value = {
        x: valX,
        y: Math.round(offsetY * ppow) / ppow
      };
    }

    if (option.signals[i].visible) {
      if (realX > lastViewX) continue;
      if (option.signals[i].value.y != 0 && realY < chart.height - 45 && realY > 0) {
        var textOffset = getTextStyle(option.signals[i].title, {
          fontSize: 12
        });
        // var labelX = chart.axisX[0].convertValueToPixel(option.signals[i].labelX);
        drawText(ctx, option.signals[i].title, lastViewX - textOffset.x - 10, parseInt(realY - 7), {
          color: option.signals[i].color,
          font: 'normal normal 12px Arial',
        });
        var obj = $(`.analysis_${option.id}_` + i);
        if (obj.length > 0) {
          obj.css("top", parseInt(realY) + 10).css("display", option.signals[i].value.y != 0 && option.signals[i].visible ? "inline-flex" : "none");
          $(`.analysis_${option.id}_` + i).rating('set rating', option.signals[i].rate);
        } else {
          var rateObj = document.createElement("div");
          $(rateObj).addClass(`analysis_${option.id}_` + i).addClass("ui rating star analyze");
          $(rateObj).css("position", "absolute").css("top", parseInt(realY) + 10).css("right", margin + 10).css("transform", "rotateY(180deg)");
          $(chart.container).find('.canvasjs-chart-container').append(rateObj);
          $(rateObj).rating({
            initialRating: option.signals[i].rate,
            maxRating: 3
          }).rating('disable');
        }
      }
    } else {
      $(`.analysis_${option.id}_` + i).css("display", "none");
      continue;
    }

    var offset = val;
    if (key > 0) offset = Math.abs(option.signals[i].value.y / Math.pow(10, precision));
    var showFlag = offset > 0 && option.signals[i].visible;
    if (option.selected > 2) {
      showFlag = showFlag && option.advanced;
    }
    var labelVal = Math.round(Math.pow(10, precision) * val) / Math.pow(10, precision);
    stripLines.push({
      value: val,
      label: labelVal.toString(),
      labelPlacement: 'inside',
      color: 'transparent',
      showOnTop: true,
      labelFontColor: showFlag ? "white" : "transparent",
      labelAlign: 'near',
      labelBackgroundColor: showFlag ? option.signals[i].color : 'transparent',
      labelFontSize: 12,
      orgColor: showFlag ? option.signals[i].color : 'transparent',
      orgFontColor: showFlag ? "white" : "transparent",
      objectType: 'trade',
      optionId: option.id
    });
  }

  const ttStripLines = chart.options.axisY2.stripLines;
  let tempStripLines = ttStripLines.filter(o => (o.optionId !== option.id));
  tempStripLines = tempStripLines.concat(stripLines);
  for (var i = 0; i < 7 - stripLines.length; i++) {
    tempStripLines.push({
      value: 0,
      label: labelVal.toString(),
      labelPlacement: 'outside',
      color: 'transparent',
      showOnTop: true,
      labelFontColor: "transparent",
      labelAlign: 'near',
      labelBackgroundColor: 'transparent',
      labelFontSize: 12,
      orgColor: 'transparent',
      orgFontColor: "transparent",
      objectType: 'trade',
      optionId: option.id
    });
  }

  option.priceOffset = stripLines.length - 1;
  option.priceIndex = tempStripLines.length - 1;
  chart.options.axisY2.stripLines = tempStripLines;
  chart.render();

  // drawing signals
  if (option.signal.visible) {
    const tempPoints = [...dataPoints];
    tempPoints.reverse()
    const createdAt = tempPoints.find(pp => (pp.x <= option.signal.createdAt));
    if (createdAt) {
      var startX = chart.axisX[0].convertValueToPixel(createdAt.x);
      var maxY = chart.axisY2[0].convertValueToPixel(chart.axisY2[0].get("viewportMaximum"));
      var minY = chart.axisY2[0].convertValueToPixel(chart.axisY2[0].get("viewportMinimum"));
      drawLine(ctx, {
        x: startX,
        y: maxY
      }, {
        x: startX,
        y: minY
      }, {
        color: createdAt.color,
        thickness: 1,
        dashType: [2, 4]
      });

      const used = option.signals.filter(signal => (signal.used));
      if (used.length > 0) {
        const entryReached = used[0];
        const otherReached = used.length > 1 ? used[1] : null;
        const textOffset = getTextStyle(entryReached.title + " reached!", {
          fontSize: 12
        });
        // const entryX = entryReached.color? entryReached: tempPoints.find(pp => (pp.x <= entryReached.labelX));
        var labelX = chart.axisX[0].convertValueToPixel(entryReached.labelX);
        var labelY = chart.axisY2[0].convertValueToPixel(entryReached.value.y);
        drawText(ctx, entryReached.title + " reached!", labelX - textOffset.x / 2, labelY - 7, {
          color: entryReached.color,
          font: `12px`,
        });
        ctx.fillStyle = entryReached.color;
        ctx.rect(labelX - 3.5, labelY - 3.5, 7, 7);
        ctx.fill();

        drawLine(ctx, {
          x: labelX,
          y: maxY
        }, {
          x: labelX,
          y: minY
        }, {
          color: entryReached.usedColor,
          thickness: 1,
          dashType: []
        });
        if (otherReached) {
          // const otherX = otherReached.color? otherReached: tempPoints.find(pp => (pp.x <= otherReached.labelX));
          var otherLX = chart.axisX[0].convertValueToPixel(otherReached.labelX);
          var otherLY = chart.axisY2[0].convertValueToPixel(entryReached.value.y + otherReached.value.y);
          ctx.beginPath();
          ctx.globalAlpha = 0.1;
          ctx.fillStyle = entryReached.usedColor;
          ctx.rect(labelX, maxY, Math.abs(otherLX - labelX), Math.abs(maxY - minY));
          ctx.fill();

          const otherTOffset = getTextStyle(otherReached.title + " reached!", {
            fontSize: 12
          });
          drawText(ctx, otherReached.title + " reached!", otherLX - otherTOffset.x / 2, otherLY - 7, {
            color: otherReached.color,
            font: `12px`,
          });
          ctx.rect(otherLX - 3.5, otherLY - 3.5, 7, 7);
          ctx.fill();

          drawLine(ctx, {
            x: otherLX,
            y: maxY
          }, {
            x: otherLX,
            y: minY
          }, {
            color: otherReached.usedColor,
            thickness: 1,
            dashType: []
          });
          ctx.beginPath();
          ctx.globalAlpha = 0.1;
          ctx.fillStyle = otherReached.usedColor;
          ctx.rect(otherLX, maxY, Math.abs(lastViewX - otherLX), Math.abs(maxY - minY));
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.globalAlpha = 0.1;
          ctx.fillStyle = entryReached.usedColor;
          ctx.rect(labelX, maxY, Math.abs(lastViewX - labelX), Math.abs(maxY - minY));
          ctx.fill();
        }
      }
    }

  }
  ctx.beginPath();
  ctx.globalAlpha = 1;
  return option;
};

export function drawParallel(ctx, option, points, lastViewX) {
  if (points.length < 2) return;
  let mainDashType = [];

  if (option.mainLine.lineDashType === "dot")
    mainDashType = [5, 5];
  else if (option.mainLine.lineDashType === "dash")
    mainDashType = [10, 15];
  var lineOption = {
    thickness: option.hoverover ? 4 : parseInt(option.mainLine.lineThickness),
    dashType: mainDashType,
    color: option.hoverover ? option.hoverColor : option.mainLine.lineColor
  };

  let kVal = 0,
    offsetY = 0;
  if (points.length > 2) {
    kVal = (points[1].y - points[0].y) / (points[1].x - points[0].x);
    const expectY = kVal * (points[2].x - points[0].x) + points[0].y;
    offsetY = points[2].y - expectY;
  }

  let startP = points[0].x < points[1].x ? points[0] : points[1];
  let endP = points[0].x < points[1].x ? points[1] : points[0];

  if (option.start.extend) {
    startP = {
      x: 0,
      y: -kVal * startP.x + startP.y
    }
  }

  if (option.end.extend) {
    endP = {
      x: lastViewX,
      y: kVal * (lastViewX - endP.x) + endP.y
    }
  }

  drawLine(ctx, startP, endP, lineOption);
  if (points.length > 2) {
    const expectedPoints = [
      startP,
      endP,
      {
        x: endP.x,
        y: endP.y + offsetY
      },
      {
        x: startP.x,
        y: startP.y + offsetY
      },
      startP
    ];
    drawLine(ctx, expectedPoints[2], expectedPoints[3], lineOption);
    drawMultiRange(ctx, expectedPoints, option);
    if (option.levelLine.visible) {
      let dashType = [];
      if (option.levelLine.lineDashType === "dot")
        dashType = [3, 3];
      else if (option.levelLine.lineDashType === "dash")
        dashType = [10, 5];
      drawLine(ctx, {
        x: startP.x,
        y: startP.y + offsetY / 2
      }, {
        x: endP.x,
        y: endP.y + offsetY / 2
      }, {
        thickness: parseInt(option.levelLine.lineThickness),
        dashType: dashType,
        color: option.levelLine.lineColor
      });
    }
  }
};