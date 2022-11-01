import * as _ from 'lodash';
import hResize from '../assets/double-arrow.ico';
import vResize from '../assets/resize.ico';
import {
  StochasticIndicator,
  MACDIndicator,
  RSIIndicator,
  ATRIndicator,
  hexToRGB
} from '../helpers/data-util';
import {
  colorPalette,
  TimeUnits
} from '../model/constants';
import {
  defaultOptions
} from '../model/options';
import {
  getIndicatorTemplates
} from '../helpers/template';
import {
  detectLine,
  getTextStyle,
  drawSelecter,
  drawHRay,
  drawArrow,
  drawFib,
  drawRect,
  drawCallout,
  drawXABCD,
  drawABCD,
  drawTriPattern,
  drawThreePattern,
  drawHeadShoulder,
  drawElliottWave,
  drawMAIndicator,
  drawIchimokuIndicator,
  drawAnalysis,
  drawTradeLines,
  drawParallel
} from '../helpers/render';
import {
  isNaN
} from 'lodash';

const $ = window.$;

export class ChartPan {
  _parent = null;
  _container = null;
  _canvasElement = null;
  _element = null;
  _chart_option = null;
  _component = null;
  _height = 0;
  _width = 0;
  _containerId = '';
  _option = null;
  _precision = 0;
  _dataPoints = [];
  _hasChart = false;
  _shapes = [];
  _drawTimer = null;
  _renderTimer = null;
  _mainShape = 'normal';
  _ctx = null;
  _magent = '';
  _xMargin = 50;
  _renderCtx = null;

  constructor(option) {
    this._parent = option.parent;
    this._width = option.width;
    this._containerId = option.containerId;
    this._precision = option.precision;
    this._component = option.component;
    this._shapes = option.shapes || [];
    this._dataPoints = option.dataPoints || [];
    this._hasAxisX = option.hasAxisX || false;
    this._mainShape = option.mainShape || {};
    $(this._component.container).attr('id', this._containerId);
    if (this._component) {
      this._addCanvas();
    }
  }

  _detectBrowser = () => {
    if (navigator.userAgent.includes("Chrome")) {
      return "Chrome";
    } else {
      return "NO";
    }
  }

  _addCanvas = (flag = true) => {
    if (this._component && $(this._component.container).find('canvas').length === 2) {
      this._canvasElement = $(this._component.container).find('canvas').last().clone();
      const width = Number($(this._canvasElement).attr('width')) - this._parent._xMargin;
      const height = $(this._component.container).find('canvas').last().height() - 30;
      this._height = height;
      $(this._canvasElement).attr("id", this._containerId + "_drawer").addClass('drawer-canvas').removeClass("canvasjs-chart-canvas")
        .attr("width", width).css("width", width + 'px')
        .attr("height", height).css("height", height + 'px');
      this._canvasElement = this._canvasElement[0];
      $(this._component.container).find('.canvasjs-chart-canvas')[0].after(this._canvasElement);
      var canvas = document.getElementById(this._containerId + "_drawer");

      var ctx = null;
      var isIE = /*@cc_on!@*/ false || !!document.documentMode;
      // Edge 20+
      var isEdge = !isIE && !!window.StyleMedia;
      // Chrome 1 - 79
      const _chrome = this._detectBrowser();
      var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime) || _chrome === "Chrome" ? true : false;
                  
      console.log("Edge ", isEdge);
      console.log("Chrome", isChrome);

      if (isEdge || isChrome) {
        ctx = canvas.transferControlToOffscreen().getContext("2d");
      } else {
        ctx = canvas.getContext("2d");
      }

      ctx.setTransform(width / ctx.canvas.width, 0, 0, height / ctx.canvas.height, 0, 0);
      this._ctx = ctx;

      if (flag) {
        $(this._component.container) //.find('.canvasjs-chart-canvas').last()
          .mousedown(this.handleMouseDown)
          .mouseup(this.handleMouseUp)
          .mousemove(this.handleMouseMove)
          .dblclick(this.handleDblClick)
          .bind('wheel mousewheel', (e) => {
            this._zoomingTimer = requestAnimationFrame(() => {
              this._xZoomControl(e);
            });
            clearTimeout($.data(this, 'timer'));
            $.data(this, 'timer', setTimeout(function () {
              if (this._zoomingTimer) {
                cancelAnimationFrame(this._zoomingTimer);
                this._zoomingTimer = null;
              }
            }, 250));
          });
      }
    }
    if (flag) {
      const that = this;
      setTimeout(() => {
        // $("#" + that._containerId).resizable({
        $(that._component.container).resizable({
          resize: (event, ui) => {
            if (ui.size.height < 150) {
              event.preventDefault();
            }
            that._parent.resize(that._containerId, ui.size);
          },
          disabled: that._hasAxisX
        });

        if (that._containerId != 'primary_chart') {
          that._makeIndicatorTool();
        } else {
          that._shapes.forEach(shape => {
            if (shape.indicator) {
              that._makeIndicatorTool(shape.id);
            }
          })
        }

        const option = that._parent._chartWidget.options().pan;
        const bgcolor = option[option.theme].backgroundColor;
        const hideTrialArea = document.createElement('div')
        $(hideTrialArea).addClass('hide-trial-area').css('width', 62).css('height', 10).css('position', 'absolute').css('left', 0).css('top', 0)
          .css('background-color', bgcolor === 'transparent' ? '#1b1b1b' : bgcolor)
        const hideScaleArea = $(hideTrialArea).clone()
        $(hideTrialArea).appendTo(that._component.container)
      }, 500);
    }

    this.draw();
  }

  mathRound = (somenum) => {
    let rounded = (0.5 + somenum) | 0;
    // A double bitwise not.
    rounded = ~~(0.5 + somenum);
    // Finally, a left bitwise shift.
    rounded = (0.5 + somenum) << 0;
    return rounded;
  }

  draw = (pen) => {
    if (!this._ctx) return;
    const orgOptions = this._parent._chartWidget.options();
    if (pen)
      this._parent._pen = JSON.parse(JSON.stringify(pen));

    const chart = this._component;
    const mainPoints = this._parent._mainPoints;
    const _pen = this._parent._pen;
    if (_pen.enabled && _pen.points.length <= 0) {
      return;
    }

    if (_pen.option && (_pen.selected || _pen.enabled) && this._parent._chartWidget._toptoolbar._shared) {
      this._parent._chartWidget._toptoolbar.shared(false);
    }

    if (_pen.option && _pen.option.containerId === this._containerId) {
      // if (_pen.objectType !== "trade" && _pen.objectType !== 'analysis') {
      if (_pen.objectType === "rect") {
        if (_pen.points.length > 2) {
          if (_pen.pointIndex === 0) {
            _pen.points[1].y = _pen.points[0].y;
            _pen.points[3].x = _pen.points[0].x;
          } else if (_pen.pointIndex === 1) {
            _pen.points[0].y = _pen.points[1].y;
            _pen.points[2].x = _pen.points[1].x;
          } else if (_pen.pointIndex === 2) {
            _pen.points[1].x = _pen.points[2].x;
            _pen.points[3].y = _pen.points[2].y;
          } else if (_pen.pointIndex === 3) {
            _pen.points[0].x = _pen.points[3].x;
            _pen.points[2].y = _pen.points[3].y;
          }
        } else {
          _pen.points = [{
              x: _pen.points[0].x,
              y: _pen.points[0].y
            },
            {
              x: _pen.points[1].x,
              y: _pen.points[0].y
            },
            {
              x: _pen.points[1].x,
              y: _pen.points[1].y
            },
            {
              x: _pen.points[0].x,
              y: _pen.points[1].y
            }
          ];
          _pen.pointIndex = 2;
        }
      } else if (_pen.objectType === 'parallel') {
        if (_pen.points.length > 2) {
          const kVal = (_pen.points[1].y - _pen.points[0].y) / (_pen.points[1].x - _pen.points[0].x);
          const expectY = kVal * (_pen.points[2].x - _pen.points[0].x) + _pen.points[0].y;
          const offsetY = _pen.points[2].y - expectY;
          _pen.points[2].x = (_pen.points[0].x + _pen.points[1].x) / 2;
          _pen.points[2].y = (_pen.points[0].y + _pen.points[1].y) / 2 + offsetY;
        }
      }

      if (_pen.selected || _pen.enabled) {
        const dataPoints = _pen.points.map(point => ({
          x: chart.axisX[0].convertPixelToValue(point.x),
          y: chart.axisY2[0].convertPixelToValue(point.y)
        }));
        const xPoints = dataPoints.map(point => (point.x));
        const minX = Math.min(...xPoints);
        const maxX = Math.max(...xPoints);
        _pen.option.chartPoints = dataPoints;
        // if (_pen.option.isTrade) {
        //   _pen.option.points[_pen.pointIndex] = 
        // } else {
        _pen.option.points = _pen.points;
        // }
        _pen.option.timeRange = [minX, maxX];
        this.updateShape(_pen.option);
      }
      // }
    }

    this._ctx.clearRect(0, 0, this._ctx.canvas.width, this._ctx.canvas.height)
    let lastViewX = this._ctx.canvas.width;
    this.lastViewX = lastViewX;
    let minViewX = 0;

    let starFlag = true;
    $(chart.container).find('.analyze').css('display', 'none');
    let spLines = chart.options.axisY2.stripLines.filter(o => (['price', 'final-price', 'price-width', 'trade'].indexOf(o.objectType) >= 0));
    // chart.options.axisY2.stripLines = temps;
    // chart.render();
    const minViewport = chart.axisX[0].get('viewportMinimum');
    const maxViewport = chart.axisX[0].get('viewportMaximum');
    if (this._shapes && this._shapes.length > 0) {
      const filterOptions = this._shapes.filter(option => {
        if (option.key != 'h-ray' && !option.indicator && ['analysis', 'trade'].indexOf(option.key) < 0 && (option.timeRange && option.timeRange.length > 0)) {
          let inFlag = false;
          inFlag = option.timeRange[0] >= minViewport && option.timeRange[0] <= maxViewport;
          inFlag = inFlag || option.timeRange[1] >= minViewport && option.timeRange[1] <= maxViewport;
          inFlag = inFlag || (option.timeRange[0] >= minViewport && option.timeRange[1] <= maxViewport);
          inFlag = inFlag || (option.timeRange[0] <= minViewport && option.timeRange[1] >= maxViewport);
          if (!inFlag) return false;
        }
        if (option.extra) return false;
        if (option.hoverover) return true;
        if (option.commentFor) return true;
        else if (option.visible) {
          if (orgOptions.suggestor && orgOptions.suggestor === option.ownerId) return true;
          else return !option.comment;
        }
        return false;
      });

      const sortOptions = filterOptions.sort((a, b) => (a.zIndex - b.zIndex));
      sortOptions.forEach(option => {
        let flag = false;
        let points = [];
        let priceOption = null;
        if (_pen.option && option.id === _pen.option.id) {
          option = _pen.option;
          if (option.isTrade) {
            points = [_pen.points[_pen.pointIndex]];
          } else {
            points = _pen.option.points;
          }
          flag = true;
        } else if (!this._parent._whileZooming && this._parent._activeShape && this._parent._activeShape.id == option.id) {
          points = this._parent._activeShape.points;
        } else if (!option.indicator) {
          if (!option.isTrade) {
            points = option.chartPoints.map(point => {
              return {
                x: chart.axisX[0].convertValueToPixel(point.x),
                y: chart.axisY2[0].convertValueToPixel(point.y)
              };
            });
            option.points = points;
          } else {
            const sPoints = option.signals.map(signal => {
              return {
                x: chart.axisX[0].convertValueToPixel(signal.value.x),
                y: chart.axisY2[0].convertValueToPixel(signal.value.y)
              };
            });

            points = []
            option.points = sPoints;
            option.selected = -1;
          }
        }

        if (this._parent._chartWidget._options.hoverColor) {
          option.hoverColor = this._parent._chartWidget._options.hoverColor;
        }

        let dataPoints = [];
        if (option.indicator) {
          let minVal = chart.axisX[0].get("viewportMinimum");
          let maxVal = chart.axisX[0].get("viewportMaximum");
          let optionLen = 0;
          if (option.key.indexOf("ma") >= 0) {
            optionLen = option.len;
            // option.label = option.key.toUpperCase() + ' ( ' + option.len + ', ' + option.source + ', ' + option.offset + ' )';
          } else if (option.key.indexOf("ichimoku") >= 0) {
            optionLen = Math.max(option.conversionPeriod, option.basePeriod, option.laggingSpanPeriod, option.displacement);
            option.label = option.key.substr(0, 1).toUpperCase() + option.key.substr(1) + ' ';
            option.label = option.label + '( ' + option.conversionPeriod + ', ' + option.basePeriod + ', ' + option.laggingSpanPeriod + ', ' + option.displacement + ' )';
          }
          this.updateShape(option);
          const minIndex = chart.options.data[0].dataPoints.findIndex(point => (point.x >= minVal));
          const maxIndex = chart.options.data[0].dataPoints.findIndex(point => (point.x >= maxVal));

          const start = minIndex - optionLen > 0 ? minIndex - optionLen : 0;
          const end = maxIndex + optionLen > mainPoints.length - 1 ? mainPoints.length - 1 : maxIndex + optionLen;
          dataPoints = mainPoints.slice(start, end).filter(point => (point.y && point.y.length > 0));
        }
        if (option.key === 'h-ray') priceOption = drawHRay(this._ctx, option, points, lastViewX, chart, this._precision);
        else if (['arrow', 't-line', 'ray'].indexOf(option.key) >= 0) drawArrow(this._ctx, option, points, chart, flag, lastViewX, minViewX);
        else if (option.key.indexOf("fib") >= 0) drawFib(this._ctx, option, points, chart, this._precision, lastViewX);
        else if (option.key === "parallel") drawParallel(this._ctx, option, points, lastViewX);
        else if (option.key === "rect") drawRect(this._ctx, option, points);
        else if (option.key === "callout") drawCallout(this._ctx, option, points);
        else if (option.key === "trade") {
          option = drawTradeLines(this._ctx, option, points, lastViewX, minViewX, chart, this._precision, mainPoints, this._parent._lastDate, this._parent._finalPrice, this._xMargin);
          starFlag = false;
          if (this._parent._pen.option && this._parent._pen.option.id === option.id)
            this._parent._pen.option = option;
          this.updateShape(option);
        } else if (option.key == "analysis") {
          var result = drawAnalysis(this._ctx, option, points, lastViewX, minViewX, chart, this._precision, _pen.selected || _pen.enabled, mainPoints, this._xMargin, _pen.finished);
          starFlag = false;
          option = result.option;
          // flag = !result.flag;
          if (result.flag && result.point) {
            points = [result.point];
          }

          priceOption = result.priceOption;

          if (this._parent._pen.option && this._parent._pen.option.id === option.id)
            this._parent._pen.option = option;
          this.updateShape(option);
        } else if (option.key === "xabcd" || option.key === "cypher") drawXABCD(this._ctx, option, points);
        else if (option.key === "abcd") drawABCD(this._ctx, option, points);
        else if (option.key === "tri_pattern") drawTriPattern(this._ctx, option, points);
        else if (option.key === "three_pattern") drawThreePattern(this._ctx, option, points);
        else if (option.key === "head_shoulder") drawHeadShoulder(this._ctx, option, points, lastViewX, minViewX);
        else if (option.key.indexOf("wave") >= 0) drawElliottWave(this._ctx, option, points);
        else if (option.key.indexOf("ma") >= 0) {
          option = drawMAIndicator(this._ctx, dataPoints, option, chart);
          this.updateShape(option);
        } else if (option.key.indexOf("ichimoku") >= 0) {
          option = drawIchimokuIndicator(this._ctx, dataPoints, option, chart);
          this.updateShape(option);
        }
        if (flag) {
          if (option.indicator) {
            if (option.key.indexOf('ichimoku') >= 0) {
              let temps = [];
              Object.keys(points).forEach(key => {
                temps = [...temps, ...points[key].filter((point, index) => (index % 10 === 0))];
              });
              points = temps;
            } else {
              points = points.filter((point, index) => (index % 10 === 0));
            }
          }
          drawSelecter(this._ctx, points, 5, _pen.selectEnabled);
        }

        if (priceOption) {
          const tIndex = spLines.findIndex(o => {
            if (o.optionId === priceOption.optionId) {
              if (o.objectType == 'trade') {
                return o.pIndex == priceOption.pIndex;
              } else {
                return true;
              }
            }
          });
          if (tIndex > -1) {
            spLines[tIndex] = priceOption;
          } else {
            spLines.push(priceOption);
          }
        }
      });
    }

    if (_pen.option && _pen.selected) {
      this._parent._activeShape = JSON.parse(JSON.stringify(_pen.option));
    }

    if (spLines.length > 0) {
      // chart.options.axisY2.stripLines = spLines;
      // chart.render();
      this._parent.updateStripeLines(this._containerId, spLines)
    }

    // if (_pen.points && _pen.selected && ['trade', 'analysis', 'h-ray'].indexOf(_pen.objectType) < 0) {
    //   const yLines = this._chart.options.axisY2.stripLines;
    //   const xLines = this._chart.options.axisX.stripLines;
    //   let xTemps = yLines.filter(o => (o.objectType !== 'selectors'));
    //   let yTemps = xLines.filter(o => (o.objectType !== 'selectors'));
    //   let xPoints = [];
    //   let yPoints = [];

    //   _pen.option.chartPoints.forEach(point => {
    //     xPoints.push(point.x);
    //     yPoints.push(point.y);
    //   });

    //   xPoints = [...new Set(xPoints)]; 
    //   yPoints = [...new Set(yPoints)];

    //   yPoints.forEach(oo => {
    //     yTemps.push({
    //       color: '#ff0000',
    //       showOnTop: true,
    //       labelFontColor: "white",
    //       labelAlign: 'near',
    //       labelBackgroundColor: '#666',
    //       labelFontSize: 12,
    //       labelPlacement: 'outside',
    //       lineDashType: 'dot',
    //       thickness: 0,
    //       label: oo.toString(),
    //       value: oo,
    //       objectType: 'selectors'
    //     });
    //   });

    //   xPoints.forEach(oo => {
    //     xTemps.push({
    //       color: '#ff0000',
    //       showOnTop: true,
    //       labelFontColor: "white",
    //       labelAlign: 'near',
    //       labelBackgroundColor: '#666',
    //       labelFontSize: 12,
    //       labelPlacement: 'outside',
    //       lineDashType: 'dot',
    //       thickness: 0,
    //       label: moment(oo).format('YYYY-MM-DD'),
    //       value: oo,
    //       objectType: 'selectors',
    //       labelMaxWidth: 80
    //     });
    //   });
    //   this._chart.options.axisX.stripLines = xTemps;
    //   this._chart.options.axisY2.stripLines = yTemps;
    //   this._chart.render();
    // } else {
    //   const yLines = this._chart.options.axisY2.stripLines;
    //   const xLines = this._chart.options.axisX.stripLines;
    //   let xTemps = yLines.filter(o => (o.objectType !== 'selectors'));
    //   let yTemps = xLines.filter(o => (o.objectType !== 'selectors'));
    //   this._chart.options.axisX.stripLines = xTemps;
    //   this._chart.options.axisY2.stripLines = yTemps;
    //   this._chart.render();
    // }
  };

  _enablePanning = () => {
    if (this._component && this._component.get("zoomEnabled")) {
      var curState = $(this._component.container).find(`.canvasjs-chart-toolbar button:first-child`).attr("state");
      if (curState === "pan")
        $(this._component.container).find(`.canvasjs-chart-toolbar button:first-child`).click();
    }
  }

  handleMouseDown = e => {
    // if (this._containerId !== 'primary_chart' && this._parent._pen.option && ['trade', 'analysis'].indexOf(this._parent._pen.option.key) >= 0) {
    //   return;
    // }
    let rect = e.target.getBoundingClientRect();
    let point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    this._parent._pen.down = true;
    this._parent._pen.up = false;
    this._parent._pen.originalP = point;
    this._parent._pen.currentP = point;
    this._parent._pen.offsetP = {
      x: e.pageX,
      y: e.pageY
    };

    this._parent._whileZooming = false;

    if (this._parent._pen && this._parent._pen.enabled) {
      this._parent._pen.option.containerId = this._containerId
      if (this._magnet > 0) {
        point = this.magnetPoint(point);
        this._parent._pen.originalP = point;
        this._parent._pen.currentP = point;
      }
      if (this._parent._pen.option && this._parent._pen.option.isTrade) {
        this._parent._pen.points[this._parent._pen.pointIndex] = point;
        this._parent._pen.started = false;
        this._parent._pen.finished = true;
        this._parent._pen.dragged = false;
        this._parent._pen.selected = true;
        this._parent._pen.enabled = false;
        this._parent._pen.option.selected = -1;
      } else if (this._parent._pen.points.length >= this._parent._pen.pointsNum) {
        if (this._parent._pen.points.length > 3 && this._parent._pen.objectType === "rect")
          this._parent._pen.points[2] = point;
        else
          this._parent._pen.points[this._parent._pen.pointsNum - 1] = point;

        this._parent._pen.started = false;
        this._parent._pen.finished = true;
        this._parent._pen.enabled = false;
        this._parent._pen.selected = true;
      } else {
        // if (this._parent._pen.option.isTrade) {
        //   this._parent._pen.points[this._parent._pen.pointIndex] = point;
        // } else {
        if (!this._parent._pen.mainDraw)
          this._parent._pen.points.push(point);
        if (this._parent._pen.points.length < this._parent._pen.pointsNum) {
          if (this._parent._pen.points.length >= this._parent._pen.pointsNum - 1) {
            this._parent._pen.started = true;
            this._parent._pen.mainDraw = false;
          } else {
            if (this._parent._pen.option.mainDraw)
              this._parent._pen.mainDraw = true;
          }
          if (this._parent._pen.started || this._parent._pen.mainDraw) {
            if (this._parent._pen.pointIndex < this._parent._pen.pointsNum - 1) {
              if (this._parent._pen.objectType !== "rect") {
                this._parent._pen.points.push(point);
                this._parent._pen.pointIndex++;
              } else if (this._parent._pen.points.length > 2) {
                this._parent._pen.pointIndex = 2;
              }
            }

            if (!this._drawTimer)
              this._drawTimer = requestAnimationFrame(this._onDrawTimerTick);
          }
        } else {
          if (!this._drawTimer && this._parent._pen.objectType === "h-ray") {
            this._parent._pen.selected = true;
            this.draw();
            $('.tfa-left-sidebar .active').removeClass('active');
            $('.tfa-left-sidebar .item.cursor').addClass('active');
            this._parent.shapeDrawingFinished(this._parent._pen.option)
            if (this._parent._auto_save && this._parent._pen.option) {
              this._parent.autoSave(this._parent._pen.option, 'create');
            }
          }

          this._parent._pen.started = false;
          this._parent._pen.finished = true;
          this._parent._pen.enabled = false;
        }
        // }
      }
    } else if (this._parent._pen && !this._parent._pen.enabled) {
      let detection = this._detectPosition(point, this._component);
      if (detection.selectEnabled) {
        this._parent._pen.selected = true;
        this._parent._pen.chartIndex = detection.chartIndex;
        this._parent._pen.option = detection.option;
        this._parent._pen.pointIndex = detection.pointIndex;
        this._parent._pen.objectType = detection.objectType;
        this._parent._pen.points = detection.points;
        this._parent._pen.pointsNum = detection.pointsNum;
        this._parent._pen.dragged = true;

        this._parent.shapeSelected({
          option: detection.option,
          oIndex: detection.oIndex
        });
        // if (this._parent._pen.objectType === "trade") $scope.$broadcast("Open.TradeManager");
        if (!this._drawTimer && (detection.option && !detection.option.isLocked)) {
          this._drawTimer = requestAnimationFrame(this._onTimerTick);
        }

      } else {
        if (this._parent._pen.option && this._parent._pen.option.key == 'analysis') {
          this._parent._pen.option.selected = -1;
          this.updateShape(this._parent._pen.option);
        }
        this._parent.initPen()
        this._parent._pen.down = true;
        this._parent._pen.originalP = point;
        this._parent._pen.currentP = point;
        this._parent._pen.ranging = true;
        this._parent._pen.offsetP = {
          x: e.pageX,
          y: e.pageY
        };
        this.draw();
      }
    }

    if (this._parent._pen.option && !this._parent._pen.option.indicator)
      this._parent.displayToolbar(this._parent._pen.enabled || this._parent._pen.selected);

    if (!this._parent._pen.enabled && this._parent._pen.finished && !this._parent._interactivity) {
      this._parent._interactivity = true;
      setTimeout(() => {
        this._component.set("interactivityEnabled", true);
      }, 50);
      // e.preventDefault();
    }
  };

  handleMouseMove = e => {
    e.preventDefault();
    // if (this._containerId !== 'primary_chart' && this._parent._pen.option && ['trade', 'analysis'].indexOf(this._parent._pen.option.key) >= 0) {
    //   return;
    // }

    // if (this._gripped) return;
    let rect = e.target.getBoundingClientRect();
    // let parentOffset = $(e.target).offset();    
    // let offsetHeight = chartHeight * cIndex / 4;
    let point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    let detection = null;
    let pen = this._parent._pen;
    if (!pen.dragged && !pen.enabled && !pen.ranging) {
      detection = this._detectPosition(point, this._component);
      if (pen.down) {
        if (pen.selected) {
          $(".canvasjs-chart-canvas").css("cursor", "grabbing");
        } else {
          $(".canvasjs-chart-canvas").css("cursor", "move");
        }
      } else {
        if (detection.selectEnabled) {
          $(".canvasjs-chart-canvas").css("cursor", "pointer");
          if (this._parent._interactivity) {
            this._parent._interactivity = false;
            this._component.set("interactivityEnabled", false);
          }

        } else {
          $(".canvasjs-chart-canvas").css("cursor", "");
          if (!this._parent._interactivity) {
            this._parent._interactivity = true;
            this._component.set("interactivityEnabled", true);
          }

        }
      }
    } else {
      if (pen.pointIndex > -1 && !pen.ranging) {
        $(".canvasjs-chart-canvas").css("cursor", "");
      } else {
        $(".canvasjs-chart-canvas").css("cursor", "grabbing");
      }
    }

    if (rect.width - point.x < this._xMargin) {
      $(".canvasjs-chart-canvas").css("cursor", vResize);
    } else if (rect.height - point.y < 30) {
      $(".canvasjs-chart-canvas").css("cursor", hResize);
    }

    let offsetX = e.pageX - pen.offsetP.x;
    let offsetY = e.pageY - pen.offsetP.y;
    pen.currentP = point;
    pen.offsetP = {
      x: e.pageX,
      y: e.pageY
    };

    if ((pen && pen.pointIndex >= 0 && (pen.enabled || pen.dragged)) && this._magnet > 0) {
      point = this.magnetPoint(point);
      pen.currentP = point;
    }

    if (pen && !pen.enabled) { // in case of managing existed object
      if (!pen.selected && !pen.dragged) {
        pen.selectEnabled = detection ? detection.selectEnabled : false;
        if (pen.selectEnabled) { // mouse pointer is over existed object              
          pen = this._parent.initPen()
          pen.objectType = detection.objectType;
          pen.points = detection.points;
          pen.pointsNum = detection.pointsNum;
          pen.pointIndex = detection.pointIndex;
          pen.option = detection.option;
          if (pen.option.key == 'analysis') {
            pen.option.selected = -1;
          }
          pen.selectEnabled = true;
          pen.selectFlag = true;
          this.draw(pen);
        } else { // chart drag function with selected object                    
          if (pen.down) {
            if (rect.width - point.x < this._xMargin) {
              let viewportMin = this._component.axisY2[0].get("viewportMinimum");
              let viewportMax = this._component.axisY2[0].get("viewportMaximum");
              const minPixel = this._component.axisY2[0].convertValueToPixel(viewportMin) + offsetY;
              const maxPixel = this._component.axisY2[0].convertValueToPixel(viewportMax) - offsetY;

              let realMin = this._component.axisY2[0].convertPixelToValue(minPixel);
              let realMax = this._component.axisY2[0].convertPixelToValue(maxPixel);
              const minimumPixel = this._component.axisY2[0].convertPixelToValue(minPixel + 150);
              const maximumPixel = this._component.axisY2[0].convertPixelToValue(maxPixel - 150);
              this._component.set('zoomType', 'xy');
              this._component.axisY2[0].set("viewportMinimum", realMin, false);
              this._component.axisY2[0].set("viewportMaximum", realMax, false);
              this._component.axisY2[0].set('minimum', minimumPixel, false);
              this._component.axisY2[0].set('maximum', maximumPixel);
              // this._enablePanning();
              this.draw();
            } else {
              if (rect.height - point.y < 25) {
                this._parent.zoomRange(offsetX);
              }
            }
          }
          if (pen.selectFlag) {
            pen = this._parent.initPen()
            this.draw(pen);
          }
        }
      }
    } else if (pen.enabled) {
      // if (pen.down) {
      if (this._parent._interactivity) {
        this._parent._interactivity = false;
        this._component.set("interactivityEnabled", false);
      }
      // } 
      // else {
      //   if (!this._parent._interactivity) {
      //     this._parent._interactivity = true;
      //     this._component.set("interactivityEnabled", true);
      //   }
      // }
    }

    if (pen && pen.option && pen.option.isTrade && pen.enabled && !this._drawTimer) {
      console.log('init draw')
      pen.currentP = point;
      pen.originalP = point;
      pen.points = [...pen.option.points];
      pen.points[pen.pointIndex] = point;
      // pen.points = [point];
      this._drawTimer = requestAnimationFrame(this._onDrawTimerTick);
    }

  };

  handleMouseUp = e => {
    let rect = e.target.getBoundingClientRect();
    let point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    if (this._parent._pen && this._parent._pen.dragged) {
      point = this.magnetPoint(point);
      this._parent._pen.currentP = point;
      this._parent._pen.dragged = false;
    }
    this._parent._pen.down = false;
    this._parent._pen.up = true;
    this._parent._pen.ranging = false;
    if (this._parent._pen && !this._parent._pen.enabled) { // in case of managing existed object
      if (this._parent._pen.dragged) {
        this._parent._pen.dragged = false;
        var option = this._parent._pen.option;
        if (option.isTrade) {
          this._parent._pen.finished = true;
        }
      }
      if (this._parent._pen.selectEnabled) {
        this._parent._pen.selected = true;
        this._parent._pen.selectEnabled = false;
      }
    }

    var detection = this._detectPosition(point);
    if (detection.selectEnabled) {
      $(".canvasjs-chart-canvas").last().css("cursor", "pointer !important");
    } else {
      $(".canvasjs-chart-canvas").last().css("cursor", "crosshair !important");
    }

    this._parent._chartWidget._sidebar.closeSidebar();
    return true;
  };

  handleDblClick = e => {
    let rect = e.target.getBoundingClientRect();
    // let parentOffset = $(e.target).offset();    
    // let offsetHeight = chartHeight * cIndex / 4;
    let point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    if (this._parent._pen.selected) {
      if (this._parent._pen.option) {
        if (!this._parent._pen.option.indicator) {
          this._parent.settingOption();
        } else {
          const option = {
            ...this._parent._pen.option
          };
          this._parent.initPen()
          this._indicatorSetting(option.id);
        }
      }
    }

    if (rect.width - point.x < 50) {
      this._component.set("zoomType", 'x');
      this._component.axisY2[0].set("maximum", null, false);
      this._component.axisY2[0].set("minimum", null, false);
      this._component.axisY2[0].set("viewportMaximum", null, false);
      this._component.axisY2[0].set("viewportMinimum", null);
      // this._enablePanning(this._component);
    }
    this.draw();
  };

  _detectPosition = point => {
    let res = {
      objectType: '',
      selectEnabled: false,
      points: [],
      pointsNum: 0,
      pointIndex: -1,
      option: null,
      oIndex: -1
    };

    let result = {
      flag: false,
      pointIndex: -1,
      option: null,
      oIndex: -1
    };

    // if (['trade', 'analysis'].indexOf(this._parent._pen.objectType) >= 0) return result;

    const orgOptions = this._parent._chartWidget.options();
    const minViewport = this._component.axisX[0].get('viewportMinimum');
    const maxViewport = this._component.axisX[0].get('viewportMaximum');
    let options = this._shapes.filter(option => {
      if (option.containerId !== this._containerId) return false;
      if (!option.indicator && ['trade', 'analysis'].indexOf(option.key) < 0 && (option.timeRange && option.timeRange.length > 0)) {
        let inFlag = false;
        inFlag = option.timeRange[0] >= minViewport && option.timeRange[0] <= maxViewport;
        inFlag = inFlag || option.timeRange[1] >= minViewport && option.timeRange[1] <= maxViewport;
        inFlag = inFlag || (option.timeRange[0] >= minViewport && option.timeRange[1] <= maxViewport);
        inFlag = inFlag || (option.timeRange[0] <= minViewport && option.timeRange[1] >= maxViewport);
        if (!inFlag) return false;
      }
      if (option.extra) return false;
      // if (['trade', 'analysis'].indexOf(option.key) >= 0) return false;
      if (option.hoverover) return true;
      if (option.commentFor) return true;
      else if (option.visible) {
        if (orgOptions.suggestor && orgOptions.suggestor === option.ownerId) return true;
        else return !option.comment;
      } else return false;
    });
    options.sort((a, b) => (b.zIndex - a.zIndex));

    if (options && options.length > 0) {
      for (let i = 0; i < options.length; i++) {
        let option = options[i];
        let j = 0;
        for (j = 0; j < option.points.length; j++) {
          if (Math.abs(option.points[j].x - point.x) < 5 && Math.abs(option.points[j].y - point.y) < 5) {
            if (option.isTrade) {
              option.active = true;
              result.oIndex = j
            }
            result.flag = true;
            result.pointIndex = j;
            result.option = option;
            break;
          }
        }

        if (!result.flag) {
          if (option.key.indexOf("fib") >= 0) {
            result = detectLine(point, option.points);
            if (result.flag) {
              result.option = option;
              break;
            }

            let offsetY = option.points[0].y - option.points[1].y;
            for (let k = 0; k < option.levels.length; k++) {
              let level = option.levels[k];
              if (!level.visible) continue;
              let yValue = 0;
              let xValue = [0, 0];
              if (option.key === 'fibonacci') {
                xValue = [option.points[0].x, option.points[1].x];
                yValue = option.points[1].y + Math.round(10000 * level.value * offsetY) / 10000;
              } else {
                offsetY = option.points[1].y - option.points[0].y;
                if (option.revert)
                  offsetY = -1 * offsetY;
                xValue = [option.points[1].x, option.points[2].x];
                yValue = option.points[2].y + Math.round(10000 * level.value * offsetY) / 10000;
              }

              let points = [{
                x: xValue[0],
                y: yValue
              }, {
                x: xValue[1],
                y: yValue
              }];

              result = detectLine(point, points);
              if (result.flag) {
                result.option = option;
                result.oIndex = k;
                break;
              }
              let label = level.value.toString();
              if (option.label.extra.percents) {
                label = (Math.round(level.value * 10000) / 100).toString();
                label += "%";
              }
              if (option.label.extra.price) {
                var seedNum = Math.pow(10, this._precision);
                var yText = this._component.axisY2[0].convertPixelToValue(yValue);
                yText = Math.round(yText * seedNum) / seedNum;
                label += '(' + yText + ')';
              }
              if (label.length > 0) {
                let offset = label.length * 6;
                if (option.label.align != "center") {
                  const lPoint = option.label.align === 'left' ? Math.min(...xValue) : Math.max(...xValue);
                  if (option.label.align === 'left') offset = offset * -1;
                  const expectX = lPoint + offset;
                  if (point.x >= Math.min(expectX, lPoint) && point.x <= Math.max(expectX, lPoint) && Math.abs(point.y - yValue) <= 10) {
                    result = {
                      flag: true,
                      pointIndex: -1,
                      option: option,
                      oIndex: k
                    };
                    break;
                  }
                }
              }
            }
          } else if (option.key === "rect" || option.key === "arrow") {
            const points = option.key === 'rect' ? [...option.points, option.points[0]] : option.points;
            result = detectLine(point, points);
            if (result.flag) {
              result.option = option;
              break;
            }
          } else if (option.key === "callout") {
            let labels = option.label.text.split("\n");
            let labelLength = labels.map(item => (item.length));
            let maxLength = Math.max(...labelLength);
            let maxLabel = labels[labelLength.indexOf(maxLength)];
            let textOffset = getTextStyle(maxLabel, option.label);
            let rectHeight = textOffset.y * labels.length + 20;
            let rectWidth = textOffset.x + 20;
            if (rectWidth < 40) rectWidth = 40;
            if (rectHeight < 30) rectHeight = 30;

            if (point.x >= option.points[1].x - rectWidth && point.x <= option.points[1].x && point.y <= option.points[1].y + rectHeight / 2 && point.y >= option.points[1].y - rectHeight / 2) {
              result.flag = true;
              result.option = option;
              result.pointIndex = 1;
              break;
            }
          } else if (option.key === "h-ray") {
            const points = [...option.points, {
              x: this.lastViewX,
              y: option.points[0].y
            }];
            result = detectLine(point, points);
            if (result.flag) {
              result.option = option;
              break;
            }
          } else if (option.isTrade) {
            option.active = false;
            for (j = 0; j < option.points.length; j++) {
              const points = [option.points[j], {
                x: this.lastViewX,
                y: option.points[j].y
              }];
              result = detectLine(point, points);
              if (result.flag) {
                result.option = option;
                result.pointIndex = j;
                result.oIndex = j;
                break;
              }

              if (option.signals[j].visible && option.signals[j].value.y != 0) {
                let offset = option.signals[j].title.length * 6;
                const lPoint = this.lastViewX - 15;
                const expectX = lPoint - offset;
                const yOffset = (point.y - option.points[j].y);
                if (point.x >= Math.min(expectX, lPoint) && point.x <= Math.max(expectX, lPoint) && yOffset < 0 && yOffset > -15) {
                  result = {
                    flag: true,
                    pointIndex: j,
                    option: option,
                    oIndex: j
                  };
                  break;
                }
              }
            }
            if (result.flag) {
              break;
            }
          } else if (option.key.indexOf('ichimoku') >= 0) {
            for (let k = 0; k < Object.keys(option.points).length; k++) {
              const key = Object.keys(option.points)[k];
              for (j = 0; j < option.points[key].length; j++) {
                if (Math.abs(option.points[key][j].x - point.x) < 5 && Math.abs(option.points[key][j].y - point.y) < 5) {
                  result = {
                    flag: true,
                    pointIndex: key,
                    option: option
                  };
                  break;
                }
              }
              if (result.flag) {
                break;
              }
            }
          } else {
            let points = [...option.points];
            if (['xabcd', 'cypher'].indexOf(option.key) >= 0 && option.points.length > 4) {
              points = [...option.points, option.points[2], option.points[0], option.points[4], option.points[3], option.points[1]];
            } else if (['abcd'].indexOf(option.key) >= 0 && option.points.length > 3) {
              points = [...option.points, option.points[1], option.points[0], option.points[2]];
            } else if (['three_pattern'].indexOf(option.key) >= 0 && option.points.length > 6) {
              points = [...option.points, option.points[5], option.points[3], option.points[1]];
            } else if (option.key === 'head_shoulder' && option.points.length > 6) {
              points = [...option.points, option.points[5], option.points[4], option.points[2]];
            }

            result = detectLine(point, points);
            if (result.flag) {
              result.option = option;
              break;
            }
          }
        }

        if (result.flag) {
          break;
        }
      }
      if (result.flag) {

        res.objectType = result.option.key;
        res.selectEnabled = true;
        if (['trade', 'analysis'].indexOf(res.objectType) > -1) {
          result.option.selected = result.pointIndex;
          res.points = result.option.points;
        } else {
          // let dataPoints = result.option.chartPoints.map(point => {
          //   const xVal = this._component.axisX[0].convertValueToPixel(point.x);
          //   return {
          //     x: xVal,
          //     y: this._component.axisY2[0].convertValueToPixel(point.y)
          //   }
          // });
          // res.points = dataPoints;
          res.points = result.option.points;
        }
        res.pointsNum = result.option.pointsNum;
        res.pointIndex = result.pointIndex;
        res.option = result.option;
        res.oIndex = (isNaN(result.oIndex) || typeof result.oIndex == 'undefined') ? -1 : result.oIndex;
      }
    }
    return res;
  };

  _onDrawTimerTick = () => {
    var pen = this._parent._pen;
    if (pen.objectType === "") {
      cancelAnimationFrame(this._drawTimer);
      this._drawTimer = null;
      return;
    }

    if (pen.currentP.x > this._width - this._parent._xMargin) {
      pen.currentP.x = this._width - this._parent._xMargin;
    }

    if (this._height > 0 && pen.currentP.y > this._height) {
      pen.currentP.y = this._height;
    }

    var offsetX = (pen.currentP.x - pen.originalP.x);
    var offsetY = (pen.currentP.y - pen.originalP.y);
    pen.originalP = pen.currentP;
    var point = null;
    if (!pen.started && pen.mainDraw) {
      if (pen.points.length < 2) {
        pen.points.push(pen.currentP);
        pen.pointIndex++;
      } else {
        point = pen.points[pen.pointIndex];
        pen.points[pen.pointIndex] = {
          x: point.x + offsetX,
          y: point.y + offsetY
        };
      }
    } else {
      if (pen.option.isTrade) {
        point = pen.points[pen.pointIndex];
        pen.points[pen.pointIndex] = {
          x: point.x + offsetX,
          y: point.y + offsetY
        };
      } else {
        if (pen.points.length > pen.pointsNum - 1) {
          if (pen.objectType === "rect") {
            point = pen.points[2];
            if (point) {
              pen.points[2] = {
                x: point.x + offsetX,
                y: point.y + offsetY
              };
            }
            pen.pointIndex = 2;
          } else {
            point = pen.points[pen.pointIndex];
            if (point) {
              pen.points[pen.pointIndex] = {
                x: point.x + offsetX,
                y: point.y + offsetY
              };
            }
          }
        } else {
          pen.points.push(pen.currentP);
          pen.pointIndex++;
        }
      }

    }

    if (['trade', 'analysis'].indexOf(pen.objectType) >= 0 && pen.finished) {
      // pen.option.selected = null;
      pen.option.active = false;
      // // pen.enabled = false;
      this.updateShape(pen.option);
    }
    this.draw();

    if (pen.finished && (Math.abs(pen.originalP.x - pen.currentP.x) < 2) && (Math.abs(pen.originalP.y - pen.currentP.y) < 2)) {
      $('.tfa-left-sidebar .active').removeClass('active');
      $('.tfa-left-sidebar .item.cursor').addClass('active');
      // $('.analysis-tooltip').removeClass('active');
      cancelAnimationFrame(this._drawTimer);
      this._drawTimer = null;
      if (['analysis', 'trade'].indexOf(pen.option.key) >= 0) {
        this._component.options.axisY2.crosshair.enabled = true;
        this._component.render();
        this._parent._chartWidget._chat.updateValues(pen.option.signals, pen.option.key);
      } else if (this._parent._auto_save && !pen.option.commentFor) {
        this._parent.autoSave(pen.option, 'create');
      }
      this._parent.shapeDrawingFinished(pen.option)
    } else {
      if (this._parent._chartWidget._toptoolbar._shared) {
        this._parent._chartWidget._toptoolbar.shared(false);
      }
      this._drawTimer = requestAnimationFrame(this._onDrawTimerTick);
    }
  }

  _onTimerTick = () => {
    var pen = this._parent._pen;

    if (pen.currentP.x > this._width - this._parent._xMargin) {
      pen.currentP.x = this._width - this._parent._xMargin;
    }

    if (this._height > 0 && pen.currentP.y > this._height) {
      pen.currentP.y = this._height;
    }

    if (pen.option && !this._parent._is_editor) {
      if (!pen.option.comment && !pen.option.commentFor) {
        cancelAnimationFrame(this._drawTimer);
        this._drawTimer = null;
        return;
      }
      const orgOptions = this._parent._chartWidget.options();
      if (orgOptions.writerId != pen.option.ownerId) {
        cancelAnimationFrame(this._drawTimer);
        this._drawTimer = null;
        return;
      }
    }
    var offsetX = (pen.currentP.x - pen.originalP.x);
    var offsetY = (pen.currentP.y - pen.originalP.y);
    pen.originalP = pen.currentP;
    if (pen.option && pen.option.isTrade) {
      var point = pen.points[pen.pointIndex];
      pen.points[pen.pointIndex] = {
        x: point.x + offsetX,
        y: point.y + offsetY
      };
    } else if (pen.pointIndex >= 0) {
      if (!pen.dragged && this._magnet > 0) {
        pen.currentP = this.magnetPoint(pen.currentP);
      }
      var point = pen.points[pen.pointIndex];
      if (point)
        pen.points[pen.pointIndex] = pen.currentP;
    } else {
      const points = pen.points.map(point => ({
        x: point.x + offsetX,
        y: point.y + offsetY
      }));
      pen.points = points;

    }

    this.draw();
    if (!pen.dragged && (this._magnet > 0 || ((Math.abs(pen.originalP.x - pen.currentP.x) < 2) && (Math.abs(pen.originalP.y - pen.currentP.y) < 2)))) {
      // if ( !pen.dragged) {  
      // $('.analysis-tooltip').removeClass('active');
      cancelAnimationFrame(this._drawTimer);
      this._drawTimer = null;
      if (pen.option) {
        if (['analysis', 'trade'].indexOf(pen.option.key) >= 0) {
          this._parent._chartWidget._chat.updateValues(pen.option.signals, pen.option.key);
        } else if (this._parent._auto_save && !pen.option.commentFor) {
          this._parent.autoSave(pen.option, 'update');
        }
        this._parent.shapeDrawingFinished(pen.option)
      }
    } else {
      if (this._parent._chartWidget._toptoolbar._shared) {
        this._parent._chartWidget._toptoolbar.shared(false);
      }
      this._drawTimer = requestAnimationFrame(this._onTimerTick);
    }
  }

  stopDrawing = () => {
    if (this._drawTimer) {
      cancelAnimationFrame(this._drawTimer);
      this._drawTimer = null;
    }
  }

  startRenderShapes = () => {
    this.draw();
    this._renderTimer = requestAnimationFrame(this.startRenderShapes);
  }

  stopRenderShapes = () => {
    if (this._renderTimer) {
      cancelAnimationFrame(this._renderTimer);
      this._renderTimer = null;
    }
  }

  /** getting magnet points */
  magnetPoint = (point) => {
    const arr = this._component.data[0].get('dataPoints');
    const minV = this._component.axisX[0].get('viewportMinimum');
    const maxV = this._component.axisX[0].get('viewportMaximum');
    const viewArr = arr.filter(p => (p.x >= minV && p.x <= maxV));
    const current = this.iterativeFunction(viewArr, point.x);
    if (current && current.y.length > 0) {
      let offsets = [];
      const yVals = current.y.map(pp => {
        const val = this._component.axisY2[0].convertValueToPixel(pp);
        offsets.push(Math.abs(val - point.y));
        return val;
      });
      const lowest = Math.min(...offsets);
      const yVal = yVals[offsets.indexOf(lowest)];
      if (this._magnet > 1 || Math.abs(yVal - point.y) <= 20) {
        point = {
          x: this._component.axisX[0].convertValueToPixel(current.x),
          y: yVal
        };
      }
    }
    return point;
  }

  iterativeFunction = (arr, x) => {

    let start = 0,
      end = arr.length - 1;
    const xDate = parseInt(this._component.axisX[0].convertPixelToValue(x));
    // Iterate while start not meets end 
    while (start <= end) {

      // Find the mid index 
      let mid = Math.floor((start + end) / 2);

      // If element is present at mid, return True 
      if (arr[mid].x === xDate) return arr[mid];
      else if (xDate > arr[mid].x) {
        if (mid < arr.length - 1 && xDate < arr[mid + 1].x) return arr[mid];
        else if (mid === arr.length - 1 && xDate > arr[mid].x) return arr[mid];
        else start = mid + 1;
      } else {
        if (mid > 0 && xDate > arr[mid - 1].x) return arr[mid - 1];
        else if (mid === 0 && xDate < arr[0].x) return arr[0];
        else end = mid - 1;
      }
    }

    return null;
  }

  _xZoomControl = e => {
    let delta;

    if (e.originalEvent.wheelDelta !== undefined) {
      delta = e.originalEvent.wheelDelta;
    } else {
      delta = Math.round(e.originalEvent.deltaY) * -30;
    }

    this._parent.zooming(delta / 2);
  }
  /** === end of getting magnet points === */

  _makeIndicatorTool = (optionId) => {
    const that = this;
    const option = optionId ? this._shapes.find(o => (o.id === optionId)) : this._mainShape;
    let wrapper = $(this._component.container).find('.indicator-panel');
    if (wrapper.length <= 0) {
      wrapper = document.createElement('div');
      $(wrapper).addClass('ui card transparent indicator-panel');
      if (option.extra) {
        $(wrapper).addClass('extra');
      }
      $(this._component.container).append(wrapper);
    }

    const item = $(`
      <div class="ui icon buttons" key="${option.id}">
        <div class="ui basic label">${option.label}</div>
        <div class="ui button icon eye" key="visible"><i class="icon small eye"></i></div>
        <div class="ui button setting" key="setting"><i class="icon small setting"></i></div>
        <div class="ui button delete" key="delete"><i class="icon small trash"></i></div>
      </div>
    `);
    if (option.extra) {
      $(item).find('.ui.button.eye').remove();
    }

    if ($(wrapper).has(`.ui.buttons[key="${option.id}"]`).length > 0) {
      $(wrapper).find(`.ui.buttons[key="${option.id}"]`).replaceWith(item);
    } else {
      $(wrapper).append(item);
    }
    if (!option.visible) $(wrapper).find('ui.button.eye .icon').addClass('slash');
    else $(wrapper).find('ui.button.eye .icon').removeClass('slash');
    $(wrapper).find(`.buttons[key="${option.id}"] .button`).on('pointerenter', (e) => {
      let obj = e.target;
      if (obj.nodeName === 'I') obj = $(e.target).closest('.button');
      $(obj).css('background', '#2185d0');
    }).on('pointerleave', (e) => {
      let obj = e.target;
      if (obj.nodeName === 'I') obj = $(e.target).closest('.button');
      $(obj).css('background', '#d4d4d596');
    }).on('pointerdown', (e) => {
      let obj = e.target;
      if (obj.nodeName === 'I') obj = $(e.target).closest('.button');
      const pItem = $(obj).closest('.buttons');
      const oId = $(pItem).attr('key');
      console.log(that._parent._shapes);
      let option = that._shapes.find(o => (o.id === oId));
      if (!option) {
        option = that._parent._shapes.find(o => (o.id === oId));
      }
      if (!option) return;
      const key = $(obj).attr('key');
      if (key === 'visible') {
        option.visible = !option.visible;
        if (!option.visible) $(obj).find('.icon').addClass('slash');
        else $(obj).find('.icon').removeClass('slash');
        that.updateShape(option);
        that.draw();
      } else if (key === 'setting') {
        that._indicatorSetting(option.id);
      } else if (key === 'delete') {
        that._parent.deleteShape(option.id);
        $(pItem).remove();
        if (that._parent._auto_save) {
          that._parent.autoSave(option, 'delete');
        }
      }
    });
  }

  _indicatorSetting = (optionId) => {
    const that = this;
    let option = this._shapes.find(o => (o.id === optionId));
    const oldOption = _.cloneDeep(option);
    option.hoverover = false;
    const template = getIndicatorTemplates(option.templateName);
    $(this._component.container).append(template);

    const colorWrappers = [
      'mainLine.lineColor', 'label.color', 'background.color',
      'tenkan.lineColor', 'kijun.lineColor', 'senkouA.lineColor', 'senkouB.lineColor', 'lagging.color',
      'histogram.color[0]', 'histogram.color[1]', 'histogram.color[2]', 'histogram.color[3]', 'macd.color', 'signal.visible', 'signal.color',
      'kLine.lineColor', 'dLine.lineColor', 'upperBand.lineColor', 'lowBand.lineColor', 'lagging.color', 'rsi.lineColor'
    ];

    $(this._component.container).find('.setting-modal.tfa-modal').dialog({
      modal: true,
      title: 'Setting of ' + option.title,
      width: 450,
      resizable: false,
      classes: {
        'ui-dialog': 'tfa-chart-setting-dialog'
      },
      open: event => {
        const modalEl = event.target;
        that._setting_modal = modalEl;
        window.setTimeout(() => {
          $(modalEl).closest('.ui-dialog').css('zIndex', 1000);
        }, 100);

        $(modalEl).find('.tabular.menu .item').tab();

        that._initializeSettingOfIndicator(option);

        $(modalEl).find('.ui.dropdown').dropdown({
          onChange: (value, text, $choice) => {
            var oKey = $($choice).closest('.ui.dropdown').attr('key');
            let temp = {};
            _.set(temp, oKey, value);
            _.merge(option, temp);
            that.updateShape(option);
            if (option.extra) {
              that._mainShape = option;
              that.renderNewData(that._dataPoints);
            } else {
              that.draw();
            }
          }
        });

        $("#template").selectmenu({
          select: (event, ui) => {
            const val = $(event.target).val();
            if (val === 'save') {
              that._parent.saveTemplate('default', {
                ...option
              });
            } else {
              const newOption = defaultOptions[option.key];
              _.merge(newOption, {
                points: [],
                chartPoints: [],
                visible: true,
                hoverover: false,
                isLocked: false,
                id: option.id,
                zIndex: option.zIndex
              });
              option = _.cloneDeep(newOption);
              that.updateShape(newOption);
              if (option.extra) {
                that._mainShape = option;
                that.renderNewData(that._dataPoints);
              } else {
                that.draw();
              }

              that._initializeSettingOfIndicator(newOption);
            }
          }
        });

        $(modalEl).find('.input-box').change((e) => {
          var oKey = $(e.target).attr('key');
          let temp = {};
          _.set(temp, oKey, parseInt($(e.target).val()));
          _.merge(option, temp);

          if (!option.extra && option.key.indexOf("ma") >= 0) {
            option.label = option.key.toUpperCase() + ' ( ' + option.len + ', ' + option.source + ', ' + option.offset + ' )';
          } else if (option.key.indexOf("ichimoku") >= 0) {
            option.len = Math.max(option.conversionPeriod, option.basePeriod, option.laggingSpanPeriod, option.displacement);
            option.label = option.key.substr(0, 1).toUpperCase() + option.key.substr(1) + ' ';
            option.label = option.label + '( ' + option.conversionPeriod + ', ' + option.basePeriod + ', ' + option.laggingSpanPeriod + ', ' + option.displacement + ' )';
          } else if (option.key === 'macd') {
            option.label = "MACD (" + option.fast_length + ", " + option.slow_length + ", " + option.source + ", " + option.signal_length + ")";
          } else if (option.key === 'stochastic') {
            option.label = 'Stochastic ' + '( ' + option.kPeriod + ', ' + option.dPeriod + ', ' + option.smooth + ' )';
          } else if (option.key === 'rsi') {
            option.label = "RSI (" + option.len + ", " + option.source + ")";
          }
          that.updateShape(option);
          if (option.extra) {
            that._mainShape = option;
            that.renderNewData(that._dataPoints);
          } else {
            that.draw();
          }
        });

        colorWrappers.forEach(oKey => {
          if (_.has(option, oKey)) {
            const color = _.get(option, oKey);
            let thisPalette = _.cloneDeep(colorPalette);
            let existFlag = false;
            for (let i = 0; i < thisPalette.length; i++) {
              existFlag = thisPalette[i].indexOf(color) >= 0;
              if (existFlag) break;
            }
            if (!existFlag) thisPalette.push([color]);
            $(modalEl).find(`.color-wrapper[key="${oKey}"]`).spectrum({
              // coloe: color,
              showPaletteOnly: true,
              togglePaletteOnly: true,
              togglePaletteMoreText: '+',
              togglePaletteLessText: '-',
              showAlpha: true,
              palette: thisPalette,
              change: color => {
                let temp = {};
                _.set(temp, oKey, color.toRgbString());
                _.merge(option, temp);
                that.updateShape(option);
                if (option.extra) {
                  that._mainShape = option;
                  if (option.key === 'macd' && oKey.indexOf('histogram') >= 0) {
                    that.renderNewData(that._dataPoints);
                  } else {
                    that.redrawExtraChartWithStyle(option);
                  }
                } else {
                  that.draw();
                }
              }
            });
          }
        });

        $(modalEl).find('.actions .ui.button.ok').click(() => {
          const confirmOption = that._shapes.find(o => (o.id === option.id));
          $(`.indicator-panel .ui.buttons[key="${option.id}"] .label`).html(confirmOption.label);
          $(modalEl).dialog('close');
          if (this._parent._auto_save) {
            this._parent.autoSave(confirmOption, 'update');
          }
        });

        $(modalEl).find('.actions .ui.button.cancel').click(() => {
          that.updateShape(oldOption);
          if (option.extra) {
            that._mainShape = oldOption;
            that.renderNewData(that._dataPoints);
          } else {
            that.draw();
          }
          $(modalEl).dialog('close');
        });

        //check box
        $(modalEl).find(".ui.checkbox").checkbox({
          onChecked: function () {
            const oKey = $(this).parent(".ui.checkbox").attr("key");
            let temp = {};
            _.set(temp, oKey, true);
            _.merge(option, temp);
            that.updateShape(option);
            if (option.extra) {
              if (oKey == 'sma_signal' || oKey == 'sms_source') that.renderNewData(that._dataPoints);
              else that.redrawExtraChartWithStyle(option);
            } else {
              that.draw();
            }
          },
          onUnchecked: function () {
            const oKey = $(this).parent(".ui.checkbox").attr("key");
            let temp = {};
            _.set(temp, oKey, false);
            _.merge(option, temp);
            that.updateShape(option);
            if (option.extra) {
              if (oKey == 'sma_signal' || oKey == 'sms_source') that.renderNewData(that._dataPoints);
              else that.redrawExtraChartWithStyle(option);
            } else {
              that.draw();
            }
          }
        });

        // range setting
        if (_.has(option, 'lagging.opacity')) {
          $(modalEl).find(".ui.range[key='lagging.opacity']").range({
            min: 0,
            max: 1,
            step: 0.1,
            start: option.lagging.opacity,
            smooth: true,
            onChange: function (value) {
              const rgb = hexToRGB(option.lagging.color);
              const bColor = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', ' + value + ')';
              $(modalEl).find(`.color-wrapper[key="lagging.color"]`).css('backgroundColor', bColor);
              _.set(option, 'lagging.opacity', value);
              that.redrawExtraChartWithStyle(option);
            }
          });
        }
      },
      close: event => {
        $(event.target).remove();
        that._setting_modal = null;
        colorWrappers.forEach(item => {
          const id = _.replace(_.replace(_.replace(_.clone(item), '[', '_'), '.', '_'), ']', '_');
          $('#' + id).remove();
        });
      }
    });
  }

  _initializeSettingOfIndicator = (option) => {
    const that = this;
    const modalEl = that._setting_modal;
    const dropdowns = ['source', 'scale',
      'tenkan.lineThickness', 'kijun.lineThickness', 'senkouA.lineThickness', 'senkouB.lineThickness', 'mainLine.lineThickness',
      'macd.lineThickness', 'signal.lineThickness',
      'kLine.lineThickness', 'dLine.lineThickness', 'upperBand.lineThickness', 'lowBand.lineThickness',
      'rsi.lineThickness', 'upperBand.lineDashType', 'lowBand.lineDashType'
    ];
    dropdowns.forEach(oKey => {
      if (_.has(option, oKey)) {
        $(modalEl).find(`.ui.dropdown[key="${oKey}"]`).dropdown('set selected', _.get(option, oKey));
      }
    });

    // input element
    const inputs = [
      'len', 'offset', 'mainLine.lineThickness',
      'conversionPeriod', 'basePeriod', 'laggingSpanPeriod', 'displacement',
      'fast_length', 'slow_length', 'signal_length',
      'kPeriod', 'dPeriod', 'smooth'
    ];
    inputs.forEach(oKey => {
      if (_.has(option, oKey)) {
        $(modalEl).find(`.input-box[key="${oKey}"]`).val(_.get(option, oKey));
      }
    });

    // color picker
    const colorWrappers = [
      'mainLine.lineColor', 'label.color', 'background.color',
      'tenkan.lineColor', 'kijun.lineColor', 'senkouA.lineColor', 'senkouB.lineColor', 'lagging.color',
      'histogram.color[0]', 'histogram.color[1]', 'histogram.color[2]', 'histogram.color[3]', 'macd.color', 'signal.visible', 'signal.color',
      'kLine.lineColor', 'dLine.lineColor', 'upperBand.lineColor', 'lowBand.lineColor', 'lagging.lineColor',
      'rsi.lineColor'
    ];
    colorWrappers.forEach(oKey => {
      if (_.has(option, oKey)) {
        const color = _.get(option, oKey);
        $(modalEl).find(`.color-wrapper[key="${oKey}"]`).val(color);
      }
    });

    const checks = [
      'tenkan.visible', 'kijun.visible', 'mainLine.visible', 'senkouA.visible', 'senkouB.visible', 'lagging.visible',
      'sma_source', 'sma_signal', 'histogram.visible', 'macd.visible', 'signal.visible',
      'kLine.visible', 'dLine.visible', 'upperBand.visible', 'lowBand.visible',
      'rsi.visible'
    ];
    checks.forEach(oKey => {
      if (_.has(option, oKey)) {
        $(modalEl).find(`.ui.checkbox[key="${oKey}"]`).checkbox(_.get(option, oKey) ? 'set checked' : 'set unchecked');
      }
    });

    if (option.key === 'ichimoku2c') {
      $(modalEl).find('.label[key="tenkan"]').html('Tenkan');
      $(modalEl).find('.label[key="kijun"]').html('Kijun');
      $(modalEl).find('.label[key="chikou"]').html('Chikou');
      $(modalEl).find('.label[key="senkoua"]').html('SenkouA');
      $(modalEl).find('.label[key="senkoub"]').html('SenkouB');
    }

    if (_.has(option, 'lagging.opacity')) {
      $(modalEl).find(".ui.range[key='lagging.opacity']").range('set value', _.get(option, 'lagging.opacity'));
    }
  }

  // option operating module
  updateShape = (shape) => {
    let oIndex = this._shapes.findIndex(o => (o.id === shape.id));
    let allShapes = this._parent._chartWidget._options.pan.shape || [];
    shape.containerId = this._containerId;
    if (oIndex >= 0) {
      this._shapes[oIndex] = {
        ...shape
      };
    } else {
      this._shapes.push({
        ...shape
      });
    }
    if (allShapes.findIndex(o => (o.id === shape.id)) >= 0) {
      allShapes[allShapes.findIndex(o => (o.id === shape.id))] = {
        ...shape
      };
    } else {
      allShapes.push({
        ...shape
      });
    }
    this._parent._shapes = allShapes;
  }

  _initializeSetting = () => {
    const that = this;
    const modalEl = that._setting_modal;
    const key = this._parent._pen.option.key;
    if (!modalEl) return;
    // dropdown setting    
    const dropdowns = [
      'mainLine.lineDashType', 'label.fontFamily', 'label.fontSize', 'label.vAlign', 'start.arrow', 'end.arrow',
      'levelLine.lineDashType'
    ];

    dropdowns.forEach(oKey => {
      if (_.has(that._pen.option, oKey)) {
        $(modalEl).find(`.ui.dropdown[key="${oKey}"]`).dropdown('set selected', _.get(that._pen.option, oKey));
      }
    });

    // input box setting
    let inputs = [
      'mainLine.lineThickness', 'label.text', 'levelLine.lineThickness',
      'levels[0].value', 'levels[4].value', 'levels[7].value',
      'levels[1].value', 'levels[5].value', 'levels[8].value',
      'levels[2].value', 'levels[6].value', 'levels[9].value',
      'levels[3].value'
    ];
    // color picker
    let colorWrappers = [
      'mainLine.lineColor', 'label.color', 'background.color',
      'levels[0].color', 'levels[4].color', 'levels[7].color',
      'levels[1].color', 'levels[5].color', 'levels[8].color',
      'levels[2].color', 'levels[6].color', 'levels[9].color',
      'levels[3].color', 'levelLine.color', 'levelLine.lineColor'
    ];

    let checks = [
      'label.visible', 'label.indexVisible', 'label.extra.price', 'label.extra.bars', 'label.extra.distance', 'label.extra.angle', 'label.extra.date',
      'mainLine.visible', 'extend', 'start.extend', 'end.extend',
      'levels[0].visible', 'levels[4].visible', 'levels[7].visible',
      'levels[1].visible', 'levels[5].visible', 'levels[8].visible',
      'levels[2].visible', 'levels[6].visible', 'levels[9].visible',
      'levels[3].visible', 'revert', 'label.extra.levels', 'label.extra.percents', 'background.visible',
      'levelLine.visible'
    ];

    if (key.indexOf('fib') >= 0) {
      this._parent._pen.option.levels.forEach((option, index) => {
        if (inputs.indexOf(`levels[${index}].value`) < 0) inputs.push(`levels[${index}].value`);
        if (colorWrappers.indexOf(`levels[${index}].color`) < 0) colorWrappers.push(`levels[${index}].color`);
        if (checks.indexOf(`levels[${index}].visible`) < 0) checks.push(`levels[${index}].visible`);
      })
    }
    inputs.forEach(oKey => {
      if (_.has(that._pen.option, oKey)) {
        $(modalEl).find(`.input-box[key="${oKey}"]`).val(_.get(that._pen.option, oKey));
      }
    });

    colorWrappers.forEach(oKey => {
      if (_.has(this._parent._pen.option, oKey)) {
        const color = _.get(this._parent._pen.option, oKey);
        $(modalEl).find(`.color-wrapper[key="${oKey}"]`).val(color);
      }
    });

    // checkbox setting   

    checks.forEach(oKey => {
      if (_.has(that._pen.option, oKey)) {
        $(modalEl).find(`.ui.checkbox[key="${oKey}"]`).checkbox(_.get(that._pen.option, oKey) ? 'set checked' : 'set unchecked');
      }
    });

    // button setting
    if (_.has(that._pen.option, 'label.fontWeight')) {
      if (_.get(that._pen.option, 'label.fontWeight') === 'bold')
        $(modalEl).find(`.ui.button[key="label.fontWeight"]`).addClass('active');
      else
        $(modalEl).find(`.ui.button[key="label.fontWeight"]`).removeClass('active');
    }

    if (_.has(that._pen.option, 'label.fontStyle')) {
      if (_.get(that._pen.option, 'label.fontStyle') === 'italic') {
        $(modalEl).find(`.ui.button[key="label.fontStyle"]`).addClass('active');
      } else {
        $(modalEl).find(`.ui.button[key="label.fontStyle"]`).removeClass('active');
      }
    }

    $(modalEl).find('.ui.buttons[key="label.align"] .ui.button').removeClass('active');
    $(modalEl).find(`.ui.buttons[key="label.align"] .ui.button[data-value="${_.get(that._pen.option, 'label.align')}"]`).addClass('active');

    $(modalEl).find('.ui.buttons[key="label.vAlign"] .ui.button').removeClass('active');
    $(modalEl).find(`.ui.buttons[key="label.vAlign"] .ui.button[data-value="${_.get(that._pen.option, 'label.vAlign')}"]`).addClass('active');

    // coordinates tab
    var points = [];
    $(modalEl).find('.ui.tab[data-tab="coordinate-tab"]').html('');
    this._parent._pen.option.chartPoints.forEach((point, index) => {
      var bar = 0;
      // var valX = chart.axisX[0].convertPixelToValue(point.x);
      for (var i = 0; i < that._chart.options.data[0].dataPoints.length; i++) {
        if (that._chart.options.data[0].dataPoints[i].x >= point.x) {
          bar = that._chart.options.data[0].dataPoints[i].x;
          break;
        }
      }

      if (key == "rect") {
        if (index == 0 || index == 2) {
          points.push({
            price: Math.round(point.y * Math.pow(10, this._precision)) / Math.pow(10, this._precision),
            bar: bar
          });
        }
      } else {
        points.push({
          price: Math.round(point.y * Math.pow(10, this._precision)) / Math.pow(10, this._precision),
          bar: bar
        });
      }
    });
    points.forEach((point, index) => {
      const row = document.createElement('div');
      $(row).addClass('fields row');
      $(row).html(`<div class="field four wide column label">Price</div>
      <div class="field four wide column">
        <div class="ui fluid input">
          <input type="text" name="price" class="price" index="${index}" value="${point.price}"/>
        </div>
      </div>
      <div class="field four wide column label">Bar #</div>
      <div class="field four wide column">
        <div class="ui fluid input">
          <input type="number" min="0" class="bar" index="${index}" value="${point.bar}"/>
        </div>
      </div>`);
      $(modalEl).find('.ui.tab[data-tab="coordinate-tab"]').append(row);
    });
    that._coords = points;

    if (_.has(that._pen.option, 'background.opacity')) {
      $(modalEl).find(".ui.range[key='background.opacity']").range('set value', _.get(that._pen.option, 'background.opacity'));
    }
  }

  redrawExtraChartWithStyle = () => {
    const chart = this._component;
    if (chart) {
      if (this._mainShape.key === 'stochastic') {
        chart.options.data[0].lineThickness = this._mainShape.dLine.lineThickness;
        chart.options.data[0].lineColor = this._mainShape.dLine.lineColor;
        chart.options.data[0].visible = this._mainShape.visible && this._mainShape.dLine.visible;
        chart.options.data[1].fillOpacity = this._mainShape.lagging.opacity;
        chart.options.data[1].color = this._mainShape.lagging.color;
        chart.options.data[1].visible = this._mainShape.visible && this._mainShape.lagging.visible;
        chart.options.data[2].lineThickness = this._mainShape.upperBand.lineThickness;
        chart.options.data[2].lineColor = this._mainShape.upperBand.lineColor;
        chart.options.data[2].visible = this._mainShape.visible && this._mainShape.upperBand.visible;
        chart.options.data[2].lineDashType = this._mainShape.upperBand.lineDashType;
        chart.options.data[3].lineThickness = this._mainShape.lowBand.lineThickness;
        chart.options.data[3].lineColor = this._mainShape.lowBand.lineColor;
        chart.options.data[3].visible = this._mainShape.visible && this._mainShape.lowBand.visible;
        chart.options.data[3].lineDashType = this._mainShape.lowBand.lineDashType;
        chart.options.data[4].lineThickness = this._mainShape.kLine.lineThickness;
        chart.options.data[4].lineColor = this._mainShape.kLine.lineColor;
        chart.options.data[4].visible = this._mainShape.visible && this._mainShape.kLine.visible;
      } else if (this._mainShape.key === 'macd') {
        // chart.options.data[0].color = option.histogram.color[0];
        // chart.options.data[0].lineColor = option.histogram.color[0];
        chart.options.data[0].visible = this._mainShape.visible && this._mainShape.histogram.visible;
        chart.options.data[1].color = this._mainShape.signal.color;
        chart.options.data[1].lineColor = this._mainShape.signal.color;
        chart.options.data[1].lineThickness = this._mainShape.signal.lineThickness;
        chart.options.data[1].visible = this._mainShape.visible && this._mainShape.signal.visible;
        chart.options.data[2].color = this._mainShape.macd.color;
        chart.options.data[2].lineColor = this._mainShape.macd.color;
        chart.options.data[2].lineThickness = this._mainShape.macd.lineThickness;
        chart.options.data[2].visible = this._mainShape.visible && this._mainShape.macd.visible;
      } else if (this._mainShape.key === 'rsi') {
        chart.options.data[0].lineThickness = this._mainShape.upperBand.lineThickness;
        chart.options.data[0].lineDashType = this._mainShape.upperBand.lineDashType;
        chart.options.data[0].lineColor = this._mainShape.upperBand.lineColor;
        chart.options.data[0].visible = this._mainShape.visible && this._mainShape.upperBand.visible;
        chart.options.data[1].lineThickness = this._mainShape.lowBand.lineThickness;
        chart.options.data[1].lineDashType = this._mainShape.lowBand.lineDashType;
        chart.options.data[1].lineColor = this._mainShape.lowBand.lineColor;
        chart.options.data[1].visible = this._mainShape.visible && this._mainShape.lowBand.visible;
        chart.options.data[2].fillOpacity = this._mainShape.lagging.opacity;
        chart.options.data[2].color = this._mainShape.lagging.color;
        chart.options.data[2].visible = this._mainShape.visible && this._mainShape.lagging.visible;
        chart.options.data[3].lineThickness = this._mainShape.rsi.lineThickness;
        chart.options.data[3].lineColor = this._mainShape.rsi.lineColor;
        chart.options.data[3].visible = this._mainShape.visible && this._mainShape.rsi.visible;
      } else if (this._mainShape.key === 'atr') {
        chart.options.data[0].lineThickness = this._mainShape.signal.lineThickness;
        chart.options.data[0].lineDashType = this._mainShape.signal.lineDashType;
        chart.options.data[0].lineColor = this._mainShape.signal.color;
        chart.options.data[0].visible = this._mainShape.visible && this._mainShape.signal.visible;
      }
      chart.render();
    }
  }

  renderNewData = (dataPoints) => {
    if (dataPoints) this._dataPoints = dataPoints;
    if (this._containerId && this._containerId != 'primary_chart') {
      let chartData = null;
      if (this._mainShape.key === 'stochastic') {
        chartData = StochasticIndicator(_.cloneDeep(this._dataPoints), _.cloneDeep(this._mainShape));
      } else if (this._mainShape.key === 'rsi') {
        chartData = RSIIndicator(_.cloneDeep(this._dataPoints), _.cloneDeep(this._mainShape))
      } else if (this._mainShape.key === 'macd') {
        chartData = MACDIndicator(_.cloneDeep(this._dataPoints), _.cloneDeep(this._mainShape))
      }

      this._component.options.data = chartData.charts;
      this._component.render();
      this.draw();
    } else {
      this._component.options.data[0].dataPoints = dataPoints;
      this._component.render();
      this.draw();
    }
  }

}