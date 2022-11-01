import './css/app.scss';
import './assets/semantic-range/range.css';
import './assets/jquery-ui-1.12.1.custom/jquery-ui.min.css';
import './assets/jquery-ui-1.12.1.custom/jquery-ui.theme.css';
import {
  ChartWidget
} from './widget/chart-widget';
import {
  chartOptionsDefaults
} from './model/default-options';
import {
  SymbolDatas,
  CIntervals
} from './model/constants';
import * as _ from 'lodash';
const $ = window.$;

class App {
  _chartWidget = null;
  constructor(container, options) {
    if (container) {
      if (options.chartId) {
        const chartId = options.chartId;
        options._id = chartId;
      }
      delete options.chartId;
      const htmlElement = typeof container === 'string' ? document.getElementById(container) : container;
      const chartOptions = (options === undefined) ? _.cloneDeep(chartOptionsDefaults) : _.merge(_.cloneDeep(chartOptionsDefaults), options);

      const that = this;
      if (options.defaultSymbol) {
        $.get({
          url: options.hostUrl + `/api/history/symbol?instrument=${options.defaultSymbol}`,
          dataType: "json",
          beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", options.token);
          },
          success: res => {
            if (res && res.currency) {
              _.merge(chartOptions.topToolbar, {
                currency: res.currency
              });
              // chartOptions.topToolbar.currency = res.currency;
              that._chartWidget = new ChartWidget(htmlElement, chartOptions);
            } else {
              that._chartWidget = new ChartWidget(htmlElement, chartOptions);
            }
          },
          error: e => {
            _.merge(that._options, {
              _id: null
            });
            that._initialize();
          }
        });
      } else {
        this._chartWidget = new ChartWidget(htmlElement, chartOptions);
      }
    }
  }

  createChart = (container, options) => {
    if (this._chartWidget) {
      this._chartWidget.destroy();
      delete this._chartWidget;
    }
    if (container) {
      const htmlElement = typeof container === 'string' ? document.getElementById(container) : container;
      const chartOptions = (options === undefined) ? _.clone(chartOptionsDefaults) : _.merge(_.clone(chartOptionsDefaults), options);
      this._chartWidget = new ChartWidget(htmlElement, chartOptions);
    }
  };

  setSymbol = (symbol) => {
    const options = this._chartWidget._options;
    const that = this;
    let instrument = null;
    if (this._chartWidget._toptoolbar._symbol_datas.length > 0) {
      instrument = this._chartWidget._toptoolbar._symbol_datas.find(item => item.name === symbol);
    }

    if (instrument) {
      if (this._chartWidget._pan) {
        this._chartWidget._pan._feedEnable = false;
      }
      this._chartWidget._toptoolbar.setSymbol(instrument);
    } else {
      $.get({
        url: options.hostUrl + `/api/history/symbol?instrument=${symbol}`,
        dataType: "json",
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", options.token);
        },
        success: res => {
          if (res && res.currency) {
            this._chartWidget._toptoolbar.setSymbol(res.currency);
          } else {
            _.merge(that._options, {
              _id: null
            });
            that._initialize();
          }
        },
        error: e => {
          _.merge(that._options, {
            _id: null
          });
          that._initialize();
        }
      });
    }
  }

  destroy = () => {
    this._chartWidget.destroy();
  };

  getScreenshot = (flag = false) => {
    const that = this;
    return new Promise(resolve => {
      if (flag) {
        this._chartWidget.saveChart(null, function () {
          that._chartWidget._pan.takeSnapshotImage(base64Image => {
            resolve(base64Image);
          });
        });
      } else {
        this._chartWidget._pan.takeSnapshotImage(base64Image => {
          resolve(base64Image);
        });
      }
    });
  };

  hoverover = (options) => {
    const that = this;
    if (!this._chartWidget._loaded) return;
    if (!this._chartWidget._pan) return;
    that._chartWidget._pan.initPen();
    this._chartWidget._pan._global_autosave_flag = false;
    options.forEach(option => {
      that._chartWidget._pan.hoveroverShape(option);
    });
  };

  hoverout = (options) => {
    if (!this._chartWidget._loaded) return;
    if (!this._chartWidget._pan) return;
    const curOptions = this._chartWidget._pan._shapes;
    const hoveredOptions = curOptions.filter(oo => (options.indexOf(oo.id) < 0 && oo.hoverover));
    const that = this;
    that._chartWidget._pan.initPen();
    hoveredOptions.forEach(option => {
      that._chartWidget._pan.hoveroutShape(option.id);
    });
    this._chartWidget._pan._global_autosave_flag = true;
  };

  isContainsOption = (options) => {
    if (!this._chartWidget._loaded || !this._chartWidget._pan) return false;
    const cpOptions = options.map(option => {
      const temp = option.split(':');
      return temp[0];
    });
    const curOptions = this._chartWidget._pan._shapes;
    let flag = false;
    for (let i = 0; i < curOptions.length; i++) {
      if (cpOptions.indexOf(curOptions[i].id) >= 0) {
        flag = true;
        break;
      }
    }
    return flag;
  };

  isCommentOption = (options) => {
    if (!this._chartWidget._loaded || !this._chartWidget._pan) return false;
    const cpOptions = options.map(option => {
      const temp = option.split(':');
      return temp[0];
    });
    const chartOption = this._chartWidget._options;
    const curOptions = this._chartWidget._pan._shapes;
    let flag = false;
    const writerId = isNaN(chartOption.writerId) ? chartOption.writerId : parseInt(chartOption.writerId);
    for (let i = 0; i < curOptions.length; i++) {
      if (cpOptions.indexOf(curOptions[i].id) >= 0) {
        const optionOwner = isNaN(curOptions[i].ownerId) ? curOptions[i].ownerId : parseInt(curOptions[i].ownerId);
        if (optionOwner !== writerId && curOptions[i].comment) {
          flag = true;
          break;
        }
      }
    }
    return flag;
  };

  disCommentOptions = (options) => {
    if (!this._chartWidget._loaded || !this._chartWidget._pan) return false;
    let submitOptions = [];
    const that = this;
    options.forEach(id => {
      const option = that._chartWidget._pan._shapes.find(o => (o.id === id));
      if (option) {
        const curPan = that._chartWidget._pan.getCurrentPan();
        option.hoverover = false;
        option.comment = false;
        curPan.updateShape(option);
        submitOptions.push(option);
      }
    });
    this._chartWidget._pan.autoSave(submitOptions);
  };

  saveCommentOptions = ids => {
    if (!this._chartWidget._loaded || !this._chartWidget._pan) return false;
    let submitOptions = [];
    const that = this;
    const cpIds = ids.map(id => {
      const temp = id.split(':');
      return temp[0];
    });
    const extras = [];
    const ownerId = this.getOwner();
    cpIds.forEach(id => {
      const option = this._chartWidget._pan._shapes.find(o => (o.id === id));
      if (option) {
        const optionOwner = isNaN(option.ownerId) ? option.ownerId : parseInt(option.ownerId);
        if (ownerId === optionOwner) return;
        const curPan = that._chartWidget._pan.getCurrentPan(option.containerId);
        if (!curPan) return;
        option.commentFor = false;
        curPan.updateShape(option);
        submitOptions.push(option);
        if (option.extra && option.comment) extras.push(option);
      }
    });

    extras.forEach(extra => {
      const curPan = that._chartWidget._pan.getCurrentPan(extra.containerId);
      curPan.destroy();
      that._chartWidget._pan._pans = that._chartWidget._pan._pans.filter(pan => (pan._containerId !== curPan._containerId));
      that._chartWidget._pan._pans[0]._resize({
        width: curPan._width,
        height: that._chartWidget._pan._pans[0]._height + curPan._height
      });
    })
    this._chartWidget._pan.autoSave(submitOptions);
  }

  getShapeOptions = () => {
    if (!this._chartWidget._pan) return false;
    const curOptions = this._chartWidget._pan._shapes;
    return _.cloneDeep(curOptions);
  };

  isWriter = () => {
    return this._chartWidget._pan._is_editor;
  };

  viewSuggestions = suggestor => {
    suggestor = isNaN(suggestor) ? suggestor : parseInt(suggestor);
    this._chartWidget._options.suggestor = suggestor;
    const options = this._chartWidget._options;
    const shapeOptions = options.pan.shape;
    let newOptions = [];

    shapeOptions.forEach(option => {
      const optionOwner = isNaN(option.ownerId) ? option.ownerId : parseInt(option.ownerId);
      if (optionOwner !== suggestor)
        option.visible = false;
      newOptions.push(option);
    });
    this._chartWidget._pan._shapes = newOptions;
  }

  loadChart = (chartId, newInfo) => {
    if (!this._chartWidget._loaded) {
      const that = this;
      setTimeout(() => {
        that.loadChart(chartId)
      }, 1000)
    } else {
      this._chartWidget.loadChartWithId(chartId, newInfo);
    }
    this._chartWidget.loadChart(newInfo);
  }

  saveChart = (cb = null) => {
    const that = this;
    this._chartWidget.saveChart(null, function () {
      const shapes = that.getShapeOptions();
      const viewport = that._chartWidget._pan._viewport;
      if (cb) cb(shapes, viewport);
    });
  }

  reRender = (shapes, flag = true) => {
    if (this._chartWidget._pan && this._chartWidget._pan._pans && this._chartWidget._pan._pans[0]._height <= 0) return;
    if (!flag) {
      this._chartWidget._pan._global_autosave_flag = false;
    }
    this._chartWidget._pan.initPen();
    this._chartWidget.renderShapes(shapes, flag);

    if (flag) {
      this._chartWidget._pan._global_autosave_flag = true;
    }
  }

  renderShapesWithRange = (payload) => {
    if (payload.shapes)
      this._chartWidget.renderShapes(payload.shapes)

    if (payload.range)
      this._chartWidget._pan.setRange(payload.range)
  }

  getOwner = () => {
    return this._chartWidget._options.ownerId;
  }

  drawTimeLines = (xTime) => {
    // if (this._chartWidget && !this._chartWidget._loaded || this._chartWidget && !this._chartWidget._pan) return false;
    // if (this._chartWidget && (this._chartWidget._pan && typeof this._chartWidget._pan.drawTimeLines == 'function')) {
    //   this._chartWidget._pan.drawTimeLines(xTime);
    // }
  }

  hideTimeLines = () => {
    // if (this._chartWidget && !this._chartWidget._loaded) return false;
    // if (this._chartWidget && (this._chartWidget._pan && typeof this._chartWidget._pan.hideTimeLines == 'function')) {
    //   this._chartWidget._pan.hideTimeLines();
    // }
  }

  isLoaded = () => {
    if (this._chartWidget) {
      return this._chartWidget._loaded;
    }
  }

  /**
   * opening object tree window for linking text with object
   */
  openObjectTree = (cb) => {
    if (!this._chartWidget._loaded || !this._chartWidget._pan) return false;
    if (cb && typeof cb == 'function') {
      this._chartWidget._pan.openObjectTree(true, cb);
    }
  }

  /** drawing signal lines along with line */
  updateSignalUsed = (signalUsed) => {
    this._chartWidget.drawingSignals(signalUsed);
  }

  getMainChart = () => {
    if (this.isLoaded()) {
      return this._chartWidget._pan._pans[0]._component
    } else {
      return null;
    }
  }

  cloneShapes = (shapes) => {
    if (!this._chartWidget._loaded || !this._chartWidget._pan) return [];
    const that = this;
    if (this.isLoaded()) {
      const chart = this._chartWidget._pan._pans[0]._component;
      const temp = shapes.map(shape => {
        const points = shape.chartPoints.map(point => {
          const y = chart.axisY2[0].convertValueToPixel(point.y)
          return {
            x: point.x,
            y: chart.axisY2[0].convertPixelToValue(y + 10)
          }
        })

        shape.chartPoints = points
        return shape
      })

      return temp;
    } else {
      return []
    }
  }

  updateTrade = (trade, sIndex) => {
    this._chartWidget._pan.initPen();
    this._chartWidget._pan._pen.pointsNum = 1;
    this._chartWidget._pan._pen.objectType = trade.key;
    this._chartWidget._pan._pen.option = trade;
    this._chartWidget._pan._pen.option.active = false;
    this._chartWidget._pan._pen.option.selected = parseInt(sIndex);
    this._chartWidget._pan._pen.finished = false;
    this._chartWidget._pan._pen.enabled = false;
    this._chartWidget._pan._pen.pointIndex = parseInt(sIndex);
    this._chartWidget._pan._pen.dragged = false;
    const points = trade.signals.map(oo => ({
      x: this._chartWidget._pan._pans[0]._component.axisX[0].convertValueToPixel(oo.value.x),
      y: this._chartWidget._pan._pans[0]._component.axisY2[0].convertValueToPixel(oo.value.y)
    }));
    this._chartWidget._pan._pen.points = points;
    trade.points = points;
    if (trade.key == 'analysis') {
      this._chartWidget._pan._pivotStyle = trade.signals[8].color;
    } else {
      this._chartWidget._pan._pivotStyle = null;
    }

    this._chartWidget._pan._pans[0].updateShape(trade);
    this._chartWidget._pan._pans[0].draw();
  }

  selectTrade = (trade, sIndex) => {
    if (this._chartWidget._pan._pen && this._chartWidget._pan._pen.option && !this._chartWidget._pan._pen.finished && this._chartWidget._pan._pen.enabled) {
      return;
    }
    const points = trade.signals.map(oo => ({
      x: this._chartWidget._pan._pans[0]._component.axisX[0].convertValueToPixel(oo.value.x),
      y: this._chartWidget._pan._pans[0]._component.axisY2[0].convertValueToPixel(oo.value.y)
    }));

    if (trade.key == 'analysis' && !this._chartWidget._pan._pivotStyle) {
      this._chartWidget._pan._pivotStyle = trade.signals[8].color;
    } else {
      this._chartWidget._pan._pivotStyle = null;
    }
    this._chartWidget._pan._pans[0]._component.options.axisY2.crosshair.enabled = false;
    this._chartWidget._pan._pans[0]._component.render();
    trade.points = points;
    this._chartWidget._pan._pans[0].updateShape(trade);
    this._chartWidget._pan._pans[0].draw();
    this._chartWidget._pan._pen.pointsNum = trade.pointsNum;
    this._chartWidget._pan._pen.objectType = trade.key;
    this._chartWidget._pan._pen.option = trade;
    this._chartWidget._pan._pen.option.active = true;
    this._chartWidget._pan._pen.option.selected = parseInt(sIndex);
    this._chartWidget._pan._pen.finished = false;
    this._chartWidget._pan._pen.enabled = true;
    this._chartWidget._pan._pen.pointIndex = parseInt(sIndex);
    this._chartWidget._pan._pen.dragged = true;
    this._chartWidget._pan._pen.points = points;
    this._chartWidget._pan._pen.option.signals[parseInt(sIndex)].visible = true;
  }

  getCurrentVal = () => {
    return Number(this._chartWidget._pan._finalPrice).toFixed(this._chartWidget._options.topToolbar.currency.precision)
  }

  setTimeframe = (val, viewport) => {
    // if (viewport) {
    //   this._chartWidget._options.pan.viewport = viewport;
    // }
    const that = this;
    _.merge(this._chartWidget._pan._afterLoaded, {
      setRange: function () {
        console.log('after loaded');
        that._chartWidget._pan.setRange(viewport);
      }
    })
    if (val == this._chartWidget._toptoolbar._interval.label && viewport) {
      const minX = this._chartWidget._pan._pans[0]._component.axisX[0].get('minimum');
      if (minX > viewport.x[0]) {
        this._chartWidget._pan._option.minViewport = viewport.x[0];
        this._chartWidget._pan.loadData();
      } else {
        this._chartWidget._pan.setRange(viewport);
      }
    } else {
      this._chartWidget._toptoolbar.setTimeframe(val);
    }
  }

  getTimeRange = () => {
    if (this._chartWidget._pan) {
      return this._chartWidget._pan.getRange();
    }
    return {};
  }

  boosts = (boost) => {
    this._chartWidget._toptoolbar._boost_list = boost;
  }
}

export function getInterval(interval) {
  var index = _.findIndex(CIntervals, o => (o.value === interval))
  if (index < 0) {
    return null;
  } else {
    return CIntervals[index];
  }
};

function getIntervalByLabel(label) {
  var index = _.findIndex(CIntervals, o => (o.label === label))
  if (index < 0) {
    return null;
  } else {
    return CIntervals[index];
  }
};

export default {
  App: App,
  getInterval: getInterval,
  getIntervalByLabel
};