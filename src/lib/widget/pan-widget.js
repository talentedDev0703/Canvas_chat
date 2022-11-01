import * as _ from 'lodash';
import '../assets/semantic-range/range';
import * as moment from 'moment';
import * as htmlToImage from 'html-to-image';
import Swal from 'sweetalert2';
import {
  CreateUUID,
  hexToRGB,
  StochasticIndicator,
  RSIIndicator,
  MACDIndicator,
  ATRIndicator
} from '../helpers/data-util';
import {
  getTemplates
} from '../helpers/template';
import {
  colorPalette,
  TimeUnits,
  CIntervals
} from '../model/constants';
import {
  defaultOptions
} from '../model/options';
import {
  ChartPan
} from './chart-pan';
import * as CanvasJS from '../assets/canvasjs.stock.min';
import {
  CanvasChartOption
} from '../model/constants';

const OANDASymbols = ['EUR/USD', 'EUR/JPY', 'EUR/AUD', 'USD/JPY', 'USD/CAD', 'USD/MXN', 'USD/CHF', 'USD/INR', 'USD/SEK',
  'USD/NOK', 'USD/HKD', 'USD/CNH', 'USD/THB', 'AUD/USD', 'NZD/USD', 'GBP/USD', 'AUD/CAD', 'AUD/JPY', 'AUD/NZD', 'CAD/CHF',
  'CAD/JPY', 'CHF/JPY', 'EUR/GBP', 'EUR/CHF', 'EUR/CAD', 'EUR/SEK', 'EUR/SGD', 'GBP/AUD', 'GBP/CAD', 'GBP/CHF', 'GBP/JPY',
  'GBP/NZD', 'NZD/CAD', 'NZD/CHF', 'NZD/JPY', 'USD/SGD'
];

const $ = window.$;

export class PanWidget {
  _chart = null;
  _charts = [];
  _slider = {
    outlineThickness: 0,
  };
  _chartWidget = null;
  _chartHeights = {
    primary_chart: 0
  };
  _viewport = {
    x: [],
    y: []
  }
  _maxViewport = 0;
  _minViewport = 0;
  _option = null;
  _canvasElement = null;
  _lastDate = 0;
  _gettingFlag = false;
  _intervalVal = '';
  _interval = null;
  _primaryWrapper = null;
  _primary_chart_option = null;
  _sel_shapes = [];
  _shape_templats = [];
  _setting_modal = null;
  _object_tree = null;
  _auto_save = true;
  _is_editor = true;
  _socket = null;
  _socket_connected = false;
  _room_id = null;
  _temp_options = null;
  _copy_option = false;
  _mainPoints = [];
  _customBreaks = [];
  _finalPrice = 0;
  _finalColor = '';
  _realtimePrice = [];
  _magnet = '';
  _templates = {};
  _pans = [];
  _pan_ids = [];
  _pen = null;
  _shapes = [];
  _coords = [];
  _analyzeOption = null;
  _feedTimer = null;
  _feedEnable = true;
  _realTimer = null;
  _orgRange = [];
  _afterLoaded = {};
  _defaultRangeFlag = false;
  _lastShape = null;
  _pivotStyle = null;
  _stopRange = false;
  _interactivity = true;
  _msgTipElem = null;
  _activeShape = null;
  _whileZooming = false;
  _global_autosave_flag = true;
  _loading_symbol = null;
  constructor(chart) {
    this._chartWidget = chart;
    const options = chart.options();
    this._auto_save = options.controlling.autoSave;
    this._is_editor = options.controlling.isEditor;
    this._option = options.pan;
    this._height = options.height - 40;
    this._width = options.chat.toggle ? options.width - window.innerWidth * 0.25 - 60 : options.width - 60;
    this._chartHeights.primary_chart = this._height;
    this._element = document.createElement('div');
    $(this._element).addClass('tfa-chart-wrapper');
    $(this._element).attr('id', 'tfa-parent-chart');
    $(this._element).css('height', this._height).css('width', this._width);

    this._chartWidget.loaded(false);
    this._init();
    this._addEvent();
    this._activeShape = null;
  }

  /**
   * initialze of pan widget
   */
  _init = (flag = false) => {
    const that = this;
    this.initPen();
    const options = this._chartWidget.options();
    this._option = options.pan;
    if (options.pan.shape) {
      this._shapes = options.pan.shape.map(shape => {
        if (shape.key === 'analysis' || shape.key === 'trade') {
          shape.containerId = 'primary_chart';
          if (shape.key === 'trade') {
            for (var i = 0; i < 7; i++) {
              shape.signals[i].used = options.signalUsed[i].used;
              shape.signals[i].labelX = options.signalUsed[i].created;
            }
          }
        } else if (!shape.indicator && !shape.timeRange) {
          const xPoints = shape.chartPoints.map(point => (point.x));
          shape.timeRange = xPoints.length > 0 ? [Math.min(...xPoints), Math.max(...xPoints)] : [];
        }
        return shape;
      });
    }

    this._pans = [];
    this._chartWidget.loaded(true, false);
    if (flag) {
      this.loadData();
    }
  }

  _feedTimerInit = (flag) => {
    if (!this._feedEnable) {
      return;
    }
    const that = this;
    const hostUrl = that._chartWidget._options.hostUrl;
    const currency = that._chartWidget._options.topToolbar.currency; //.replace("/", "_");
    const interval = that._chartWidget._options.topToolbar.interval;
    const resolution = interval ? interval.label : 'M1';
    let url = '';
    if (currency.provider) {
      if (currency.provider == 'TV') {
        const exchange = that._chartWidget._options.topToolbar.currency.exchange || 'FX';
        url = `${hostUrl}/api/history/tv-stream?exchange=${exchange}&symbol=${currency.name}`;
      } else {
        url = `${hostUrl}/api/history/realtime-bars?resolution=${resolution}&symbol=${currency.name}`;
      }
    } else {
      return;
    }

    if (!this._chartWidget._loaded) {
      return;
    }

    $.ajax({
      type: 'GET',
      url: url,
      dataType: 'text',
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", that._chartWidget._options.token);
      },
      success: result => {
        if (result != '' && that._feedEnable) {
          let bar = JSON.parse(result);
          let yPriceVal = '';
          // console.log(bar);
          if (currency.provider && currency.provider == 'TV') {
            yPriceVal = bar.bid;
            bar = {
              _id: bar.symbol,
              open: bar.bid,
              high: bar.bid,
              low: bar.bid,
              // close: (bar.bid + bar.ask)/2,
              close: bar.bid,
              date: bar.update_time
            }
          } else {
            yPriceVal = [bar.open, bar.high, bar.low, bar.close].toString();
          }

          if (that._loading_symbol == bar._id && that._realtimePrice != yPriceVal && that._feedEnable) {
            that._realtimePrice = yPriceVal;
            if (that._feedEnable && this._chartWidget._loaded) {
              that.updateDatePointsWithPrice(bar);
            }
          } else {
            setTimeout(that._feedTimerInit, 1000);
          }
        } else {
          setTimeout(that._feedTimerInit, 1000);
        }
      },
      error: () => {
        setTimeout(that._feedTimerInit, 3000);
      }
    })

  }

  /**
   * render the all chat pans
   */

  _render = () => {
    this._global_autosave_flag = true;
    const panExistFlag = {};
    const shapes = _.groupBy(this._shapes, 'containerId');
    let containers = Object.keys(shapes).filter(key => key != 'primary_chart');
    const extraNums = containers.length;
    this._charts = [];
    if (this._chart) {
      this._chart.destroy();
      this._chart = null;
    }

    const that = this;
    let yFomatString = ['###0', '00000'];
    yFomatString[1] = '00000'.slice(0, this._chartWidget._options.topToolbar.currency.precision);

    const chartType = this._chartWidget._options.pan.mainType;
    const styledData = this.getChartDataPerType(chartType);

    const option = _.merge(_.cloneDeep(CanvasChartOption), {
      dataPointWidth: this._option.dataPointWidth,
      zoomEnabled: false,
      axisX: {
        tickLength: 5,
        lineThickness: 1,
        crosshair: {
          labelFormatter: function (e) {
            return moment(e.value).format("DD MMM`YY H:mm");
          }
        },
        labelFormatter: (e) => {
          if (that._interval.value === 'D') {
            if (moment(e.value).isSame(moment(e.value).startOf('year'))) {
              return moment(e.value).format('YYYY');
            }
            if (moment(e.value).isBetween(moment(e.value).startOf('month'), moment(e.value).startOf('month').add(1, 'day'))) {
              return moment(e.value).format('MMM');
            }

            if (moment(e.value).format('D') === '1') {
              return moment(e.value).format('MMM');
            } else {
              return moment(e.value).format('D');
            }
          } else {
            if (moment(e.value).isSame(moment(e.value).startOf('year'))) {
              return moment(e.value).format('YYYY');
            }
            if (moment(e.value).isSame(moment(e.value).startOf('month'))) {
              return moment(e.value).format('MMM');
            }
            if (moment(e.value).isSame(moment(e.value).startOf('day'))) {
              return moment(e.value).format('D');
            } else {
              return moment(e.value).format('HH:mm');
            }
          }
        },
        scaleBreaks: {
          customBreaks: this._option.customBreaks,
          spacing: 0,
          lineThickness: 0,
          fillOpacity: 0
        }
      },
      axisY2: {
        crosshair: {
          enabled: true,
          valueFormatString: yFomatString.join('.')
        },
        valueFormatString: yFomatString.join('.')
      },
      // theme: `${this._chartWidget._options.pan.theme}1`,
      // backgroundColor: this._chartWidget._options.pan[this._chartWidget._options.pan.theme].backgroundColor,
      data: [{
        type: styledData.type,
        risingColor: styledData.risingColor,
        fallingColor: styledData.fallingColor,
        axisYType: 'secondary',
        color: styledData.color,
        xValueType: 'dateTime',
        toolTipContent: '',
        dataPoints: styledData.dataPoints,
      }]
    });

    if (this._chartWidget._options.pan.mainType == 'line') {
      option.data[0].lineColor = styledData.color;
    }

    if (styledData.theme === 'light1') {
      option.axisX.gridColor = '#e1ecf2';
      option.axisX.gridThickness = 1;
      option.axisY2.gridColor = '#e1ecf2';
      option.axisY2.gridThickness = 1;
    }

    this._chartHeights.primary_chart = Math.floor(this._height * (4 - extraNums) * 0.25);

    containers = ['primary_chart', ...containers];
    containers.forEach(containerId => {
      if (containerId != 'primary_chart') {
        this._chartHeights[containerId] = Math.floor(this._height * 0.25);
      }
    });

    this._chart = new CanvasJS.StockChart('tfa-parent-chart', {
      title: {
        text: ""
      },
      theme: `${this._option.theme}1`,
      backgroundColor: this._chartWidget._options.pan[this._chartWidget._options.pan.theme].backgroundColor,
      width: this._width,
      height: this._height,
      charts: [
        option
      ],
      rangeSelector: {
        enabled: false
      },
      rangeChanging: this._rangeChanging,
      rangeChanged: this._rangeChanged,
      navigator: {
        enabled: true,
        backgroundColor: 'transparent',
        maskColor: "transparent",
        height: 1,
        width: 1,
        slider: this._slider,
        scaleBreaks: {
          customBreaks: this._option.customBreaks,
          spacing: 0,
          lineThickness: 0
        }
      }
    });
    this._chart.render();

    const options = this._chartWidget.options();
    // const mainPoints = JSON.parse(JSON.stringify(this._mainPoints));
    containers.forEach((containerId, cIndex) => {
      if (containerId != 'primary_chart') {
        let shape = shapes[containerId].find(item => (item.indicator && item.extra));
        if (!shape) return;

        let result = null;
        const rDatapoints = this._mainPoints.filter((point, index) => {
          if (index > 49 && index < this._mainPoints.length - 110) {
            return point.y && point.y.length > 0;
          } else {
            return true;
          }
        })
        if (shape.key === 'stochastic') {
          result = StochasticIndicator(_.cloneDeep(rDatapoints), _.cloneDeep(shape), options.topToolbar.interval.intervalVal);
        } else if (shape.key === 'rsi') {
          result = RSIIndicator(_.cloneDeep(rDatapoints), _.cloneDeep(shape))
        } else if (shape.key === 'macd') {
          result = MACDIndicator(_.cloneDeep(rDatapoints), _.cloneDeep(shape))
        } else if (shape.key === 'atr') {
          result = ATRIndicator(_.cloneDeep(rDatapoints), _.cloneDeep(shape))
        }

        if (!result) return;

        let yFomatString = ['###0', '0000'];
        yFomatString[1] = '0000'.slice(0, this._chartWidget._options.topToolbar.currency.precision);

        // this.updateShape(result.option);

        let childOption = _.merge(_.cloneDeep(CanvasChartOption), {
          dataPointWidth: this._option.dataPointWidth,
          axisX: {
            crosshair: {
              labelFormatter: function (e) {
                return moment(e.value).format("DD MMM`YY H:mm");
              }
            },
            labelFormatter: (e) => {
              if (this._interval.value === 'D') {
                if (moment(e.value).isSame(moment(e.value).startOf('year'))) {
                  return moment(e.value).format('YYYY');
                }
                if (moment(e.value).isBetween(moment(e.value).startOf('month'), moment(e.value).startOf('month').add(1, 'day'))) {
                  return moment(e.value).format('MMM');
                }

                if (moment(e.value).format('D') === '1') {
                  return moment(e.value).format('MMM');
                } else {
                  return moment(e.value).format('D');
                }

              } else {
                if (moment(e.value).isSame(moment(e.value).startOf('year'))) {
                  return moment(e.value).format('YYYY');
                }
                if (moment(e.value).isSame(moment(e.value).startOf('month'))) {
                  return moment(e.value).format('MMM');
                }
                if (moment(e.value).isSame(moment(e.value).startOf('day'))) {
                  return moment(e.value).format('D');
                } else {
                  return moment(e.value).format('HH:mm');
                }
              }
            },
            // viewportMinimum: option.viewport.x[0],
            // viewportMaximum: option.viewport.x[1],
            scaleBreaks: {
              customBreaks: this._option.customBreaks,
              spacing: 0,
              lineThickness: 0
            }
          },
          axisY2: {
            crosshair: {
              enabled: true
            },
            valueFormatString: yFomatString.join('.'),
            stripLines: []
          },
          data: result.charts
        });

        if (shape.key === 'stochastic' || shape.key === 'rsi') {
          _.merge(childOption, {
            axisY2: {
              viewportMaximum: 100,
              viewportMinimum: 0,
              maximum: 100,
              minimum: 0,
              valueFormatString: '#0.####'
            }
          })
        } else if (shape.key != 'atr') {
          var maxval = Math.max(Math.abs(result.option.maximum), Math.abs(result.option.minimum));
          _.merge(childOption, {
            axisY2: {
              includeZero: false,
              gridThickness: 0.1,
              labelFontSize: 12,
              valueFormatString: "0.####",
              crosshair: {
                enabled: true,
                color: "orange",
              },
              viewportMaximum: maxval,
              viewportMinimum: -maxval,
              maximum: maxval,
              minimum: -maxval
            }
          })
        }

        if (options.topToolbar.interval.value == 'D') {
          childOption.axisX.interval = 1;
          childOption.axisX.intervalType = 'month';
        } else {
          childOption.axisX.interval = null;
          childOption.axisX.intervalType = null;
        }

        this._chartHeights[containerId] = Math.floor(this._height * 0.25);
        this._chartHeights['primary_chart'] = this._chartHeights['primary_chart'] - this._chartHeights[containerId];

        childOption.height = this._chartHeights[containerId];

        this._chart.addTo('charts', childOption);

        this._chart.charts[cIndex - 1].axisX[0].set('labelFormatter', (e) => (''), false);
        this._chart.charts[cIndex - 1].axisX[0].crosshair.set('labelFormatter', (e) => (''), false);
        this._chart.charts[cIndex - 1].axisX[0].set('tickLength', 0, false);
        this._chart.charts[cIndex - 1].axisX[0].set('lineThickness', 6, true);
      } else { // adjust yaxis length
        let label = Number(this._finalPrice).toFixed(this._chartWidget._options.topToolbar.currency.precision + 1);
        const len = label.length > 4 ? label.length : 5;
        const mainChart = this._chart.charts[cIndex];
        let midVal = parseFloat(mainChart.axisY2[0].get('viewportMaximum')) - parseFloat(mainChart.axisY2[0].get('viewportMinimum'));
        midVal = midVal / 2 + parseFloat(mainChart.axisY2[0].get('viewportMinimum'));
        if (typeof this._mainShape !== 'object') {
          label = (parseFloat(label) - 0.000001).toString();
          label = label.substr(0, len);
        } else {
          const seed = Math.pow(10, -1 * (len - 2));
          label = midVal + seed;
          label = label.toString().substr(0, len);
        }

        this._xMargin = (label.length) * 8;
        var priceOption = {
          color: 'transparent',
          showOnTop: true,
          labelFontColor: "transparent",
          labelAlign: 'near',
          labelBackgroundColor: 'transparent',
          labelFontSize: 12,
          lineDashType: 'dot',
          thickness: 0,
          value: Number(label),
          label: label,
          objectType: 'price-width',
          labelPlacement: "outside",
          labelWrap: false
        };

        let prices = mainChart.options.axisY2.stripLines;
        const priceIndex = prices.findIndex(o => (o.objectType === 'price-width'));
        if (priceIndex >= 0) {
          prices[priceIndex] = priceOption;
        } else {
          prices.push(priceOption);
        }
        mainChart.options.axisY2.stripLines = prices;
        mainChart.render();
      }
    })

    this._pans = [];
    this._chart.charts.forEach((chart, index) => {
      let mainShape = this._chartWidget._options.pan.mainType;
      if (containers[index] != 'primary_chart') {
        mainShape = shapes[containers[index]].find(item => (item.extra && item.indicator));
      }
      this._pans.push(new ChartPan({
        parent: that,
        elementIndex: index,
        width: that._width,
        precision: this._chartWidget._options.topToolbar.currency.precision,
        component: chart,
        mainShape,
        containerId: containers[index],
        shapes: shapes[containers[index]] || [],
        hasAxisX: index == this._chart.charts.length - 1,
        dataPoints: this._mainPoints
      }))

      if (containers[index] == 'primary_chart') {
        this.printPrice();
      }
    })
  }

  renderChartWithCustomStyle = () => {
    const chartType = this._chartWidget._options.pan.mainType;
    const panOption = this._chartWidget._options.pan;
    const data = this.getChartDataPerType(chartType);
    this._chart.charts[0].data[0].set('dataPoints', data.dataPoints, false);
    this._chart.charts[0].data[0].set('type', data.type, false);
    this._chart.charts[0].data[0].set('risingColor', data.risingColor, false);
    this._chart.charts[0].data[0].set('fallingColor', data.fallingColor, false);
    if (chartType == 'line') {
      this._chart.charts[0].data[0].set('lineColor', data.color, false);
    }
    this._chart.charts[0].data[0].set('color', data.color, false);
    this._chart.set('theme', panOption.theme + 1, false);
    this._chart.set('backgroundColor', panOption[panOption.theme].backgroundColor, true);

    const color = panOption[panOption.theme].backgroundColor
    $(this._element).find('.hide-trial-area').css('background-color', color === 'transparent' ? '#1b1b1b' : color)
    $(this._element).find('.hide-scale-area').css('background-color', color === 'transparent' ? '#1b1b1b' : color);
    this._pans.forEach((pan, index) => {
      this._chart.charts[index].axisX[0].set('scaleBreaks', {
        customBreaks: this._option.customBreaks,
        spacing: 0,
        lineThickness: 0
      });
    })
  }

  getChartDataPerType = (chartType) => {
    const panOption = this._chartWidget._options.pan;
    const theme = panOption[panOption.theme];
    let newData = [];
    let dataPoints = [...this._mainPoints];
    if (chartType === 'line') {
      let prevPoints = dataPoints.slice(0, 50).map(point => ({
        ...point,
        y: null
      }));
      let afterPoints = dataPoints.slice(dataPoints.length - 110).map(point => ({
        ...point,
        y: null
      }));
      if (dataPoints.length >= 160) {
        dataPoints = dataPoints.slice(50, dataPoints.length - 110);
      }
      newData = dataPoints.filter(point => (point.y)).map(point => {
        const temp = {
          ...point
        };
        if (point.y && point.y.length > 0)
          temp.y = point.y[3]
        else
          temp.y = null;

        return temp;
      });
      newData = [...prevPoints, ...newData, ...afterPoints];
    } else if (chartType === 'candle') {
      newData = dataPoints.map(point => {
        point.color = theme.wick[point.colorKey];
        return point;
      });
    } else {
      newData = dataPoints.map((point, index) => {
        const temp = {
          ...point
        };
        if (point.y && point.y.length > 0) {
          let prevPoint = dataPoints[index - 1];
          if (!prevPoint.y || prevPoint.y.length == 0) {
            prevPoint = dataPoints[index - 2];
          }
          if (index > 49 && prevPoint.y && prevPoint.y.length > 0) {
            const close = (point.y[0] + point.y[1] + point.y[2] + point.y[3]) / 4;
            const open = (prevPoint.y[0] + prevPoint.y[3]) / 2;
            const high = Math.max(point.y[0], point.y[1], point.y[3]);
            const low = Math.max(point.y[0], point.y[2], point.y[3]);
            temp.y = [open, high, low, close];
          } else {
            temp.y = [];
          }
        }
        temp.color = theme.wick[point.colorKey];
        return temp;
      });
    }

    return {
      dataPoints: newData,
      type: chartType === 'line' ? 'spline' : 'candlestick',
      risingColor: theme.body.rising,
      color: theme.color,
      fallingColor: theme.body.falling,
      axisYType: 'secondary'
    };
  }

  journeySignal = () => {
    const options = this._chartWidget.options();
    if (!options._id || options.type !== 'signal') {
      return;
    }
    var datas = this._mainPoints;
    const tradeOption = this._shapes.find(shape => (shape.key === 'trade'));

    if (tradeOption) {
      if (!tradeOption.signal.visible || !tradeOption.signal.createdAt) return;

      const flag = tradeOption.signals[0].used;
      let otherReachedIndex = 0;
      for (var i = 1; i < tradeOption.signals.length; i++) {
        if (tradeOption.signals[i].used) {
          otherReachedIndex = i;
          break;
        }
      }
      if (flag && otherReachedIndex < 3) return;
      var entryIndex = 0;
      var entryFlag = tradeOption.signals[0].used;
      const baseTimeline = entryFlag ? tradeOption.signals[0].labelX : tradeOption.signal.createdAt;
      var startIndex = 0;
      for (var i = 0; i < this._mainPoints.length; i++) {
        if (this._mainPoints[i].x >= baseTimeline) {
          startIndex = i;
          entryIndex = i;
          break;
        }
      }
      if (startIndex === 0) startIndex = 1;

      var secondIndex = 0;
      var secondKey = 0;
      for (var i = startIndex; i < this._mainPoints.length; i++) {
        if (entryFlag) {
          for (var j = 1; j < 7; j++) {
            if (tradeOption.signals[j].value.y == 0) continue;
            if (this._mainPoints[i].y.length <= 0) break;
            var val = tradeOption.signals[0].value.y + tradeOption.signals[j].value.y;
            const curMax = Math.max(...this._mainPoints[i].y);
            const curMin = Math.min(...this._mainPoints[i].y);
            const prevMax = Math.max(...this._mainPoints[i - 1].y);
            const prevMin = Math.min(...this._mainPoints[i - 1].y);

            let flag = curMax >= val && curMin <= val;
            flag = flag || (prevMax <= val && curMin >= val);
            flag = flag || (prevMin >= val && curMax <= val);
            if (flag) {
              secondKey = j;
              secondIndex = i;
              break;
            }
          }
          if (secondIndex > 0) break;
        } else {
          entryFlag = Math.max(this._mainPoints[i].y[0], this._mainPoints[i - 1].y[0], this._mainPoints[i].y[3], this._mainPoints[i - 1].y[3]) >= tradeOption.signals[0].value.y;
          entryFlag = entryFlag && Math.min(this._mainPoints[i].y[0], this._mainPoints[i - 1].y[0], this._mainPoints[i].y[3], this._mainPoints[i - 1].y[3]) <= tradeOption.signals[0].value.y;
          if (entryFlag) {
            entryIndex = i;
          }
        }
      }

      if (entryFlag) {
        // check status and update idea
        if (options.callFn.updateSignal) {
          options.callFn.updateSignal({
            chartId: options._id,
            reason: 'Entry Reached',
            status: 'Open',
            date: this._mainPoints[entryIndex].x.getTime()
          });
        }
        tradeOption.signals[0].used = true;
        tradeOption.signals[0].labelX = this._mainPoints[entryIndex].x.getTime();
        tradeOption.signals[0].usedColor = this._mainPoints[entryIndex].color;
        tradeOption.status = 'Open';

        if (secondIndex > 0) {
          // check status and update idea
          if (secondKey < 3) {
            tradeOption.status = 'Closed';
          } else if (secondKey === 3) { // break event reached
            tradeOption.signals[1].value.y = 0; // move stop loss to entry
          } else if (secondKey === 4) { // invalidation event reached
            tradeOption.signals[2].value.y = 0; // move tp to entry
          }
          if (!tradeOption.signals[secondKey].used && options.callFn.updateSignal) {
            options.callFn.updateSignal({
              chartId: options._id,
              reason: secondKey,
              status: tradeOption.status,
              date: this._mainPoints[secondIndex].x.getTime()
            });
          }
          tradeOption.signals[secondKey].used = true;
          tradeOption.signals[secondKey].labelX = this._mainPoints[secondIndex].x.getTime();
          tradeOption.signals[secondKey].usedColor = this._mainPoints[secondIndex].color;
        }
      }
      this._pans[0].updateShape(tradeOption);
      this._pans[0].draw();

      if (this._chartWidget._socket) {

        // const shapeData = JSON.parse(JSON.stringify(tradeOption));
        // delete shapeData.points;
        // delete shapeData.toolbar;
        // this._chartWidget._socket.emit("rtTfaChart:Updating", {
        //   chartId: options._id,
        //   symbol: options.topToolbar.currency.name,
        //   layout: _.merge(this._chartWidget._layout, {
        //     shapes: {}
        //   }),
        //   shape: shapeData,
        //   verb: 'update',
        //   editor: options.writerId
        // });
      }
    }
  }

  renderStyle = () => {
    this._option = this._chartWidget._options.pan;
    if (this._pans.length > 1) {
      this._pans.forEach((pan) => {
        if (pan._containerId !== 'primary_chart') {
          pan._component.set("backgroundColor", this._option[this._option.theme].backgroundColor, false);
          pan._component.set('theme', this._option.theme);
        }
      });
    }
  }

  /**
   * destory this
   */
  destroy = () => {
    if (this._feedTimer) {
      clearTimeout(this._feedTimer);
      this._feedTimer = null;
    }

    if (this._realTimer) {
      clearTimeout(this._realTimer);
      this._realTimer = null;
    }
    if (this._chart) {
      this._chart.destroy();
      this._chart = null;
    }

    this._pans = [];
  }

  renderMsgTip = (msg) => {
    if (!this._msgTipElem) {
      this._msgTipElem = document.createElement('div');
      $(this._msgTipElem).html(`<div class="content">
        <div class="tfa-msg-tooltip"></div>
      </div>`);
      $(this._msgTipElem).addClass('ui dimmer');
      $(this._msgTipElem).appendTo(this._element);
    }
    $(this._element).find('.tfa-msg-tooltip').html(msg);
    $(this._element).dimmer('show');
    // $(this._msgTipElem).addClass('active');
    setTimeout(() => {
      $(this._element).dimmer('hide');
    }, 2000);
  }

  /**
   * get DOM elements
   */
  getElement = () => {
    return this._element;
  }

  resetAxisYRange = () => {
    this._pans[0]._component.set("zoomType", 'x');
    this._pans[0]._component.axisY2[0].set("maximum", null, false);
    this._pans[0]._component.axisY2[0].set("minimum", null, false);
    this._pans[0]._component.axisY2[0].set("viewportMaximum", null, false);
    this._pans[0]._component.axisY2[0].set("viewportMinimum", null);
    this._pans[0]._enablePanning(this._pans[0]._component);
  }

  /**
   * fetching chart data from historical saver per currency, horizon
   */
  loadData = (cb = null) => {
    if (!this._chartWidget._loaded) return;
    this._feedEnable = false;
    // this._feedTimerInit();
    this._chartWidget.loaded(false);
    this._feedEnable = false;
    this.initPen();
    this._option.customBreaks = [];
    const option = this._chartWidget.options();
    this._mainPoints = [];
    let socket = null;
    if (_.has(this._chartWidget._socket, 'getSocket')) {
      socket = this._chartWidget._socket.getSocket();
    } else {
      socket = this._chartWidget._socket;
    }

    if (socket) {
      const interval = option.topToolbar.interval;
      const intervalVal = interval ? interval.value : 1;
      socket.emit('price:timeframe', {
        timeframe: intervalVal
      })
    }
    const that = this;
    this._gettingDataPoints(false, () => {
      const interval = option.topToolbar.interval;
      const intervalVal = interval ? interval.intervalVal : 3600;
      const lastPoint = this._mainPoints[this._mainPoints.length - 111];
      this._finalPrice = lastPoint.y[3];
      this._finalColor = this._pivotStyle ? this._pivotStyle : (lastPoint.y[0] > lastPoint.y[3] ? this._option.fallingColor : this._option.raisingColor);

      if (this._mainPoints.length > 0) {
        if (option.pan.viewport && option.pan.viewport.x[0]) {
          this._viewport = option.pan.viewport
          this._maxViewport = option.pan.viewport.x[1];
          this._minViewport = option.pan.viewport.x[0];
        } else {
          this._maxViewport = Number(JSON.stringify(this._mainPoints[this._mainPoints.length - 100].x.getTime()));
          if (this._mainPoints.length > 240) {
            this._minViewport = Number(JSON.stringify(this._mainPoints[this._mainPoints.length - 220].x.getTime()));
          } else {
            this._minViewport = Number(JSON.stringify(this._mainPoints[0].x.getTime()));
          }
          this._viewport.x = [this._minViewport, this._maxViewport];
          this._viewport.y = []
        }
      }
      var visualNum = moment(this._maxViewport).diff(this._minViewport, 'seconds') / intervalVal;
      var stickWidth = Math.round(parseInt(this._width) / (visualNum * 2.5));
      if (stickWidth <= 0) stickWidth = 1;
      else if (stickWidth >= 30) stickWidth = 30;
      this._option.dataPointWidth = stickWidth;
      this._slider.minimum = this._minViewport;
      this._slider.maximum = this._maxViewport;
      this._chartWidget.loaded(true);
      this._render();
      this._feedEnable = true;
      // setTimeout(this._feedTimerInit, 1000);
      if (cb) cb();
      // call functions after loaded
      if (this._afterLoaded && Object.keys(this._afterLoaded).length > 0) {
        const fns = Object.keys(this._afterLoaded);
        fns.forEach(fn => {
          if (typeof that._afterLoaded[fn] == 'function') {
            that._afterLoaded[fn]();
          }
        });

        this._afterLoaded = {};
      }

      if (this._chartWidget._options.callFn.loaded && typeof this._chartWidget._options.callFn.loaded == 'function') {
        this._chartWidget._options.callFn.loaded(true);
      }
    });
  }

  /**
   * get all templates that user saved
   */
  getTemplates = () => {
    const option = this._chartWidget.options();
    const that = this;
    $.get({
      url: `${option.hostUrl}/api/shape-template?owner=${option.writerId}`,
      dataType: "json",
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", option.token);
      },
      success: res => {
        console.log('result', res.data);
        if (res.status.toLowerCase() === 'ok') {
          that._templates = res.data;
        }
      }
    });
  }

  /**
   * api call function to chart host
   * direction: true - forward, false - afterward
   */
  _gettingDataPoints = (flag, cb) => {
    this._feedEnable = false;
    if (!flag) this._chartWidget.loaded(false);
    const option = this._chartWidget.options();
    const oanda_token = option.priceFeed.token;
    // const dataUrl = option.hostUrl + option.dataUrl;
    const dataUrl = option.priceFeed.hostUrl;
    let interval = option.topToolbar.interval;
    if (!interval) {
      interval = CIntervals[4];
    }
    const intervalVal = interval ? interval.intervalVal : 360;
    const currency = option.topToolbar.currency;
    const resolution = interval ? interval.value : '60';
    this._intervalVal = intervalVal;
    this._interval = interval;
    let endTime = moment().startOf('minute').valueOf() // new Date().getTime();
    endTime = endTime / 1000;
    if (flag) {
      endTime = this._mainPoints[50].x.getTime() / 1000;
    }

    let startTime = endTime - intervalVal * 500;
    // let startTime = endTime - intervalVal * 3000;

    if (currency && currency.type !== 'forex') {
      startTime = endTime - intervalVal * 1000;
    }

    if (moment(this._option.minViewport).isAfter('2000-01-01T00:00:00') && startTime > this._option.minViewport / 1000) {
      startTime = this._option.minViewport / 1000 - intervalVal * 50;
    }

    if (flag && intervalVal < 3600) {
      startTime = moment(startTime * 1000).startOf('week').valueOf() / 1000;
    }

    if (moment(startTime * 1000).isBefore('2000-01-01T00:00:00')) {
      startTime = moment('2000-01-01T00:00:00').valueOf() / 1000;
    }

    let url = '';
    let token = null;
    if (currency.provider) {
      if (currency.provider == 'oanda') {
        url = `${dataUrl}/${currency ? currency.name.replace('/','_') : 'EUR_USD'}/candles?price=B&from=${Math.floor(startTime)}&granularity=${interval.label}`;
        url += '&to=' + Math.floor(endTime);
        token = oanda_token;
      } else if (currency.provider == 'TV') {
        url = `${option.hostUrl}/api/history/tv-history?exchange=${currency? currency.exchange: 'FX'}&symbol=${currency ? currency.name : 'USD/EUR'}&resolution=${resolution}&from=${Math.floor(startTime)}&to=${Math.floor(endTime)}`;
        token = option.token;
      }
    } else {
      url = `${option.hostUrl}/api/history?symbol=${currency ? currency.name : 'USD/EUR'}&resolution=${resolution}&from=${Math.floor(startTime)}&to=${Math.floor(endTime)}`;
      token = option.token;
    }
    this._loading_symbol = currency.name;
    // console.log(url);
    $.ajax({
      type: 'GET',
      url: url,
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", token);
      },
      success: dataCsv => {
        const apiData = dataCsv.candles;

        if (!apiData || apiData.length <= 0) {
          this._chartWidget.loaded(true);
          Swal.fire('Error', 'No Datas for the symbol', 'error');
          return;
        }
        const l = apiData.length;

        // this._mainPoints = [];
        const firstTime = new Date(apiData[0].time).getTime();
        const lastTime = new Date(apiData[apiData.length - 1].time).getTime();
        let tempPoints = [];
        const theme = option.pan[option.pan.theme];
        if (interval.value == 'M') {
          tempPoints = apiData.map(item => ({
            x: new Date(item.time),
            y: [Number(item.bid.o), Number(item.bid.h), Number(item.bid.l), Number(item.bid.c)],
            color: item.bid.o < item.bid.c ? theme.wick.rising : theme.wick.falling,
            colorKey: item.bid.o < item.bid.c ? 'rising' : 'falling',
            toolTipContent: null
          }))
        } else {
          apiData.forEach((item, index) => {
            if (tempPoints.length > 0) {
              const intTime = new Date(item.time).getTime() - tempPoints[tempPoints.length - 1].x.getTime();
              if (intTime >= intervalVal * 1000) {
                tempPoints.push({
                  x: new Date(item.time),
                  y: [Number(item.bid.o), Number(item.bid.h), Number(item.bid.l), Number(item.bid.c)],
                  color: item.bid.o < item.bid.c ? theme.wick.rising : theme.wick.falling,
                  colorKey: item.bid.o < item.bid.c ? 'rising' : 'falling',
                  toolTipContent: null
                })
              }
            } else {
              tempPoints.push({
                x: new Date(item.time),
                y: [Number(item.bid.o), Number(item.bid.h), Number(item.bid.l), Number(item.bid.c)],
                color: item.bid.o < item.bid.c ? theme.wick.rising : theme.wick.falling,
                colorKey: item.bid.o < item.bid.c ? 'rising' : 'falling',
                toolTipContent: null
              })
            }
          });

        }
        const prevPoints = Array(50).fill(0).map((v, i) => ({
          x: new Date(firstTime - (50 - i) * intervalVal * 1000),
          y: [],
          color: theme.wick.rising,
          colorKey: 'rising',
          toolTipContent: null
        }));
        tempPoints = [...prevPoints, ...tempPoints];
        if (this._mainPoints.length <= 0) {
          const nextPoints = Array(110).fill(0).map((v, i) => ({
            x: new Date(lastTime + (i + 1) * intervalVal * 1000),
            y: [],
            color: theme.wick.rising,
            colorKey: 'rising',
            toolTipContent: null
          }));
          this._mainPoints = Array.from(new Set([...tempPoints, ...nextPoints]));
        } else {
          this._mainPoints = Array.from(new Set([...tempPoints, ...this._mainPoints.slice(50)]));
        }

        this._option.customBreaks = interval.value == 'M' ? [] : this.getCustomBreaks();
        this._lastDate = this._mainPoints[50].x;
        if (flag) {
          this._feedEnable = true;
          // this._feedTimerInit();
        }
        if (cb) cb();
      },
      error: () => {
        Swal.fire('Error', 'No Datas for the symbol', 'error');
        this._chartWidget.loaded(true);
      }
    });
  }

  getCustomBreaks = () => {
    let customBreaks = [];
    const option = this._chartWidget.options();
    const interval = option.topToolbar.interval;
    const intervalVal = interval ? interval.intervalVal : 360;
    for (var index = 1; index < this._mainPoints.length; index++) {
      const prevT = this._mainPoints[index - 1].x.getTime();
      const diff = Math.abs(prevT - this._mainPoints[index].x.getTime()) / 1000;
      if (!isNaN(diff) && Math.floor(diff) > intervalVal) {
        customBreaks.push({
          startValue: prevT,
          endValue: this._mainPoints[index].x.getTime() - intervalVal * 1000,
        });
      }
    }
    return customBreaks;
  }

  _realTimeUpdate = (from, expectIndex, resolution) => {
    if (this._mainPoints.length <= 0) {
      return;
    }
    const that = this;
    const option = this._chartWidget.options();
    const dataUrl = option.priceFeed.hostUrl;
    const currency = option.topToolbar.currency;

    const startTime = Math.floor(from / 1000);

    let url = '';
    let token = null;
    if (currency.provider) {
      if (currency.provider == 'oanda') {
        url = `${dataUrl}/${currency ? currency.name.replace('/','_') : 'EUR_USD'}/candles?price=B&from=${startTime}&granularity=${resolution}`;
        token = option.priceFeed.token;
      } else if (currency.provider == 'TV') {
        const resolution = option.topToolbar.interval ? option.topToolbar.interval.value : '60';
        url = `${option.hostUrl}/api/history/tv-history?exchange=${currency? currency.exchange: 'FX'}&symbol=${currency ? currency.name : 'USD/EUR'}&resolution=${resolution}&from=${Math.floor(startTime)}&to=${Math.floor(new Date().getTime()/1000)}`;
        token = option.token;
      }

      $.ajax({
        type: 'GET',
        url: url,
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", token);
        },
        success: dataCsv => {
          const apiData = dataCsv.candles;
          if (apiData.length > 0) {
            const lastIndex = that._mainPoints.length - 111;
            apiData.forEach((bar, index) => {
              // const roundedCurrent = (parseInt(current/1000/intervalVal) ) * intervalVal * 1000;
              if (lastIndex > 0 && that._mainPoints[lastIndex].x.getTime() > new Date(bar.time).getTime()) {
                that._mainPoints[expectIndex + index] = {
                  x: new Date(bar.time),
                  y: [Number(bar.bid.o), Number(bar.bid.h), Number(bar.bid.l), Number(bar.bid.c)],
                  color: bar.bid.o < bar.bid.c ? option.pan.wick1Color : option.pan.wick2Color,
                  colorKey: bar.bid.o < bar.bid.c ? 'wick1Color' : 'wick2Color',
                  toolTipContent: null,
                }
              }
            });

            that.renderNewData();

            // that._pans.forEach(pan => {
            //   pan.renderNewData(that._mainPoints, that._option.customBreaks);
            // });
          }
        }
      });
    }
  }

  updateDatePointsWithPrice = (price) => {
    const option = this._chartWidget.options();
    const interval = option.topToolbar.interval;
    const intervalVal = interval ? interval.intervalVal : 360;
    const current = new Date(price.date).getTime();
    const roundedCurrent = (parseInt(current / 1000 / intervalVal)) * intervalVal * 1000;
    let cIndex = -1;

    if (this._mainPoints.length <= 0) return;

    const expectIndex = this._mainPoints.length - 111;
    // let expectIndex = 0;

    let temp = this._mainPoints.slice(0, expectIndex + 1);
    if (temp[temp.length - 1].y.length <= 0) {
      temp.pop();
    }

    const cOffset = current - this._mainPoints[expectIndex + 1].x.getTime();
    const pOffset = current - this._mainPoints[expectIndex].x.getTime();

    let yVal = [price.open, price.high, price.low, price.close];
    let overlapFlag = false;
    const theme = this._option[this._option.theme];
    if (cOffset >= intervalVal * 1000 || pOffset >= intervalVal * 1000) {
      this._realTimeUpdate(temp[temp.length - 1].x.getTime(), temp.length - 1, interval.label);

      if (option.topToolbar.currency.provider && option.topToolbar.currency.provider == 'TV') {
        let latestBar = temp[temp.length - 1].y[3];
        yVal = [latestBar, latestBar < price.close ? price.close : latestBar, latestBar > price.close ? price.close : latestBar, price.close];
      }

      temp.push({
        x: new Date(roundedCurrent),
        y: yVal,
        color: yVal[0] < yVal[3] ? theme.wick.rising : theme.wick.falling,
        colorKey: yVal[0] < yVal[3] ? 'rising' : 'falling',
        toolTipContent: null
      })
      overlapFlag = true;
    } else {
      if (temp[temp.length - 1].y.length > 0) {
        let latestBar = temp[temp.length - 1].y;
        yVal = [...latestBar.slice(0, 3), price.close];

        if (option.topToolbar.currency.provider && option.topToolbar.currency.provider == 'TV') {
          yVal = [latestBar[0], latestBar[1] < price.close ? price.close : latestBar[1], latestBar[2] > price.close ? price.close : latestBar[2], price.close];
        }
        temp[temp.length - 1].y = yVal;
        // temp[temp.length - 1].y = [price.open, price.high, price.low, price.close]
        temp[temp.length - 1].color = yVal[0] < yVal[3] ? theme.wick.rising : theme.wick.falling;
        temp[temp.length - 1].colorKey = yVal[0] < yVal[3] ? 'rising' : 'falling';
      }
    }

    if (option.topToolbar.currency.name != price._id) {
      return;
    }

    this._mainPoints = [...temp, ...Array(110).fill(0).map((e, index) => ({
      x: new Date(roundedCurrent + (index + 1) * intervalVal * 1000),
      y: [],
      color: theme.wick.rising,
      colorKey: 'rising',
      toolTipContent: null
    }))];

    if (overlapFlag && !this._defaultRangeFlag) {
      this._maxViewport = Number(JSON.stringify(this._mainPoints[this._mainPoints.length - 100].x.getTime()));
      this._viewport.x = [this._minViewport, this._maxViewport];
    }

    const customBreaks = interval.value == "M" ? [] : this.getCustomBreaks();
    this.renderNewData();
    this._finalColor = this._pivotStyle ? this._pivotStyle : (yVal[0] > yVal[3] ? theme.body.falling : theme.body.rising);
    this.updatePrice(price.close);
  }

  /**
   * @desc: select shape to be drawing
   */
  selectShape = (key, option) => {
    this._activeShape = null;
    // this._chartWidget._toptoolbar.shared(false);
    $(this._chartWidget._sidebar._element).find('.item').popup({
      position: 'left center',
      className: {
        popup: 'ui popup custom-popup'
      }
    });
    if (this._pen.enabled && !this._pen.finished && this._pen.option && this._pen.points.length > 0) {
      return;
    }
    // this.initPen();
    const options = this._chartWidget.options();
    if (options.controlling.overideEnable && (key === 'trade' || key === 'analysis')) {
      const shapes = this._shapes.filter(shape => (shape.key !== 'trade' && shape.key != 'analysis'))
      this.setShapes(shapes);
    }
    // if (this._shapePan) {      
    if (!option) {
      option = _.cloneDeep(this.getShape(key, true));
    }
    _.merge(option, {
      key: key,
      points: [],
      chartPoints: [],
      visible: true,
      hoverover: false,
      isLocked: false,
      comment: !this._is_editor,
      commentFor: !this._is_editor,
      parent: 0,
      kind: 'normal'
    });

    if (option.extra) {
      if (this._pans.length > 3) {
        return Swal.fire('Indicator Limit Error', 'You can have till 2 extra indicators!', 'error');
      } else {
        this.initPen();
        this.addPan(option);
        // this._makeIndicatorTools($('#' + option.id), option.id);
      }
    } else {
      if (option.indicator) {
        this.initPen();
        if (option.key.indexOf("ma") >= 0) {
          option.label = option.key.toUpperCase() + ' ( ' + option.len + ', ' + option.source + ', ' + option.offset + ' )';
        } else if (option.key.indexOf("ichimoku") >= 0) {
          option.len = Math.max(option.conversionPeriod, option.basePeriod, option.laggingSpanPeriod, option.displacement);
          option.label = option.key.substr(0, 1).toUpperCase() + option.key.substr(1) + ' ';
          option.label = option.label + '( ' + option.conversionPeriod + ', ' + option.basePeriod + ', ' + option.laggingSpanPeriod + ', ' + option.displacement + ' )';
        }

        this._pans[0].updateShape(option);
        this._pans[0].draw();
        this._pans[0]._makeIndicatorTool(option.id);
        this.autoSave(option, 'create');
      } else if (['analysis', 'trade'].indexOf(option.key) < 0) {
        let pen = _.merge(this.initPen(), {
          objectType: key
        });
        pen.option = option;
        pen.enabled = true;
        pen.pointsNum = pen.option.pointsNum;
        this.initPen(pen);
      } else {
        let pen = this.initPen();
        pen.points = option.signals.map(oo => ({
          x: this._pans[0]._component.axisX[0].convertValueToPixel(oo.value.x),
          y: this._pans[0]._component.axisY2[0].convertValueToPixel(oo.value.y)
        }));
        pen.option = option;
        pen.pointsNum = option.pointsNum;
        pen.objectType = key;
        this.initPen(pen);

        // if (options.analyze.type != '' && options.analyze.type != key) {
        //   return Swal.fire('Invalid Shape!', 'This chart is for ' + options.analyze.type.toUpperCase() + '!', 'error');
        // }
        if (this._chartWidget._options.controlling.narrowDisable) {
          if (this._chartWidget._options.callFn.toggleChat) {
            return this._chartWidget._options.callFn.toggleChat(true, option)
          }
        }
        this._drawAnalyzeTool(option);
        return this.displayAnalyzeTool(key, true);
      }
    }
    this.displayToolbar();
    // }
  }

  setMagnet = (magnet) => {
    this._magnet = magnet;
    if (this._pans.length > 0)
      this._pans[0]._magnet = magnet;
  }

  /** initialize of pen */
  initPen = (pen) => {
    if (pen) this._pen = pen;
    else {
      this._pen = {
        objectType: '',
        points: [],
        mainDraw: false,
        enabled: false,
        started: false,
        finished: false,
        dragged: false,
        ranging: false,
        dragEnabled: false,
        currentIndex: 0,
        chartIndex: 0,
        pointIndex: 0,
        pointsNum: 0,
        selectEnabled: false,
        selected: false,
        option: null,
        originalP: {
          x: 0,
          y: 0
        },
        currentP: {
          x: 0,
          y: 0
        },
        offsetP: {
          x: 0,
          y: 0
        },
        down: false,
        up: false,
        precision: 0
      };
      this.displayToolbar(false);
    }
    return JSON.parse(JSON.stringify(this._pen));
  }

  getShape = (key, newFlag = false) => {
    let shape = this._shapes.find(o => (o.key === key));
    if (shape) {
      shape = JSON.parse(JSON.stringify(shape));
    } else {
      shape = {};
    }

    if (newFlag) {
      if (['trade', 'analysis'].indexOf(key) > -1 && shape && shape.ownerId !== this._chartWidget._options.writerId) {
        const tempOption = this._shapes.find(o => (o.key === key && o.ownerId === this._chartWidget._options.writerId));
        if (tempOption) {
          shape = tempOption;
        } else {
          shape.id = CreateUUID();
          shape.zIndex = this._shapes.length;
        }
      } else if (['analysis', 'trade'].indexOf(key) < 0 || !shape.id) {
        if (shape.ownerId !== this._chartWidget._options.writerId) {
          shape = JSON.parse(JSON.stringify(defaultOptions[key]));
          if (this._chartWidget._options.shapeStyle && !shape.indicator) {
            if (this._chartWidget._options.shapeStyle.color) {
              shape.mainLine.lineColor = this._chartWidget._options.shapeStyle.color;
              shape.mainLine.backgroundColor = this._chartWidget._options.shapeStyle.background;
            }
            if (this._chartWidget._options.shapeStyle.background) {
              shape.background.color = this._chartWidget._options.shapeStyle.background;
            }
            if (this._chartWidget._options.shapeStyle.labelColor) {
              shape.label.color = this._chartWidget._options.shapeStyle.labelColor;
            }
          }

          if (this._chartWidget._options.hoverColor) {
            shape.hoverColor = this._chartWidget._options.hoverColor;
          }
        }
        shape.id = CreateUUID();
        shape.zIndex = this._shapes.length;
      }
    }
    return _.merge(_.cloneDeep(defaultOptions[key]), shape);
  };

  displayToolbar = (flag = true, templateFlag = true) => {
    $('.tv-floating-toolbar__widget-wrapper.toolbar').css('visibility', flag ? 'visible' : 'hidden');
    if (!flag) return;
    if (this._pen && this._pen.option) {
      if (templateFlag) this.makeTemplateMenus();
      if (this._pen.option.indicator) {

      } else {
        let toolbar = this._pen.option.toolbar;
        if (!toolbar) {
          const shape = JSON.parse(JSON.stringify(defaultOptions[this._pen.option.key]));
          const newOption = _.merge(shape, this._pen.option);
          this._pen.option = newOption;
          toolbar = this._pen.option.toolbar;
        }
        $(`.tv-floating-toolbar__widget-wrapper.toolbar .tv-floating-toolbar__widget`).css('display', 'none');
        if (['trade', 'analysis'].indexOf(this._pen.option.key) >= 0) {
          $('.tv-floating-toolbar__widget-wrapper.toolbar').css('visibility', 'hidden');
          return;
        }
        if (this._pen.enabled || this._pen.selected) {
          // displaying original toolbars
          _.forIn(toolbar, (tool, key) => {
            $(`.tv-floating-toolbar__widget-wrapper.toolbar .tv-floating-toolbar__widget[key="${key}"]`).css('display', tool.inited ? 'flex' : 'none');
          });
        }

        if (this._pen.selected) {
          _.forIn(toolbar, (tool, key) => {
            $(`.tv-floating-toolbar__widget-wrapper.toolbar .tv-floating-toolbar__widget[key="${key}"]`).css('display', tool.inited || tool.expanded ? 'flex' : 'none');
          });
        }

        $(`.tv-floating-toolbar__widget-wrapper.toolbar .i-active`).removeClass('i-active');
        if (this._pen.option.isLocked)
          $(`.tv-floating-toolbar__widget-wrapper.toolbar .tv-floating-toolbar__widget[key="lock"] .apply-common-tooltip`).addClass('i-active');
        if (!this._pen.option.visible)
          $(`.tv-floating-toolbar__widget-wrapper.toolbar .tv-floating-toolbar__widget[key="eye"] .apply-common-tooltip`).addClass('i-active');

        // const rgb = hexToRGB(this._pen.option.background.color);
        // const opacity = this._pen.option.background.opacity? this._pen.option.background.opacity: 0.5;
        $(`.tv-floating-toolbar__widget-wrapper.toolbar .tv-floating-toolbar__widget[key="backgroundColor"]`).attr('color', this._pen.option.background.color);
        $(`.tv-floating-toolbar__widget-wrapper.toolbar .tv-floating-toolbar__widget[key="backgroundColor"] .colorpicker-widget`).css('backgroundColor', this._pen.option.background.color);
        $(`.tv-floating-toolbar__widget-wrapper.toolbar .tv-floating-toolbar__widget[key="lineColor"]`).attr('color', this._pen.option.mainLine.lineColor);
        $(`.tv-floating-toolbar__widget-wrapper.toolbar .tv-floating-toolbar__widget[key="lineColor"] .colorpicker-widget`).css('backgroundColor', this._pen.option.mainLine.lineColor);
        $(`.tv-floating-toolbar__widget-wrapper.toolbar .tv-floating-toolbar__widget[key="fontSize"] .value`).html(this._pen.option.label.fontSize);
        $(`.tv-floating-toolbar__widget[key="fontColor"]`).attr('color', this._pen.option.label.color);
        $(`.tv-floating-toolbar__widget[key="fontColor"] .colorpicker-widget`).css('backgroundColor', this._pen.option.label.color);
        const lineThickness = [
          `<path d="M1.5 2a.5.5 0 0 0 0 1h19a.5.5 0 0 0 0-1h-19z"></path>`,
          `<path d="M2 2a1 1 0 0 0 0 2h18a1 1 0 0 0 0-2H2z"></path>`,
          `<path d="M2 1a1.5 1.5 0 0 0 0 3h18a1.5 1.5 0 0 0 0-3H2z"></path>`,
          `<path d="M2 1a2 2 0 0 0 0 4h18a2 2 0 0 0 0-4H2z"></path>`
        ];
        $(`.tv-floating-toolbar__widget-wrapper.toolbar .tv-floating-toolbar__widget[key="lineThickness"] svg`).html(lineThickness[this._pen.option.mainLine.lineThickness - 1]);
        let lineStyle = '<path d="M1.5 2a.5.5 0 0 0 0 1h19a.5.5 0 0 0 0-1h-19z"></path>';
        if (this._pen.option.mainLine.lineDashType == 'dot')
          lineStyle = '<path d="M1.5 2a.5.5 0 0 0 0 1H3V2H1.5zM4 2v1h2V2H4zm3 0v1h2V2H7zm3 0v1h2V2h-2zm3 0v1h2V2h-2zm3 0v1h2V2h-2zm3 0v1h1.5a.5.5 0 0 0 0-1H19z"></path>';
        else if (this._pen.option.mainLine.lineDashType == 'dash')
          lineStyle = '<path d="M1.5 2a.5.5 0 0 0 0 1H5V2zM7 2v1h3V2zm5 0v1h3V2zm5 0v1h3.5a.5.5 0 0 0 0-1z"></path>';
        $(`.tv-floating-toolbar__widget-wrapper.toolbar .tv-floating-toolbar__widget[key="lineStyle"] svg`).html(lineStyle);

        let startArrow = '<path d="M20 2.5a.5.5 0 1 1 1 0 .5.5 0 1 1-1 0zm-19 0a2 2 0 1 1 4 0 2 2 0 1 1-4 0z"></path><path d="M20.5 3H3V2h17.5z"></path>';
        if (this._pen.option.start && this._pen.option.start.arrow)
          startArrow = '<path d="M0 2.5L8 0v5zm20 0a.5.5 0 1 1 1 0 .5.5 0 1 1-1 0z"></path><path d="M20.5 3H7V2h13.5z"></path>';
        else if (this._pen.option.start && this._pen.option.start.extend)
          startArrow = '<path d="M0 2.5a.5.5 0 1 1 1 0 .5.5 0 1 1-1 0zm18 0a2 2 0 1 1 4 0 2 2 0 1 1-4 0zm-9 0a2 2 0 1 1 4 0 2 2 0 1 1-4 0z"></path><path d="M19 3H.5V2H19z"></path>';
        $(`.tv-floating-toolbar__widget-wrapper.toolbar .tv-floating-toolbar__widget[key="startArrow"] svg`).html(startArrow);

        let endArrow = '<path d="M20 2.5a.5.5 0 1 1 1 0 .5.5 0 1 1-1 0zm-19 0a2 2 0 1 1 4 0 2 2 0 1 1-4 0z"></path><path d="M20.5 3H3V2h17.5z"></path>';
        if (this._pen.option.end && this._pen.option.end.arrow)
          endArrow = '<path d="M0 2.5L8 0v5zm20 0a.5.5 0 1 1 1 0 .5.5 0 1 1-1 0z"></path><path d="M20.5 3H7V2h13.5z"></path>';
        else if (this._pen.option.end && this._pen.option.end.extend)
          endArrow = '<path d="M22 2.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0zM4 2.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM13 2.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0z"></path><path d="M3 2h18.5v1H3z"></path>';
        $(`.tv-floating-toolbar__widget-wrapper.toolbar .tv-floating-toolbar__widget[key="endArrow"] svg`).html(endArrow);

        // order disable
        $('.tv-floating-toolbar__widget[key="order"] .item').removeClass('inactive');
        const zIndex = this._pen.option.zIndex;
        if (this._shapes.length > 1) {
          var maxIndex = this._shapes.length - 1;
          if (zIndex >= maxIndex) $('.tv-floating-toolbar__widget[key="order"] .item:nth-child(1)').addClass('inactive');
          if (zIndex <= 0) $('.tv-floating-toolbar__widget[key="order"] .item:nth-child(2)').addClass('inactive');
          if (zIndex >= maxIndex - 1) $('.tv-floating-toolbar__widget[key="order"] .item:nth-child(3)').addClass('inactive');
          if (zIndex <= 1) $('.tv-floating-toolbar__widget[key="order"] .item:nth-child(4)').addClass('inactive');
        } else {
          $('.tv-floating-toolbar__widget[key="order"] .item').addClass('inactive');
        }
      }
    } else {
      $('.tv-floating-toolbar__widget-wrapper.toolbar').css('visibility', 'hidden');
    }
  };

  /** make template dropdown menu over toolbar */
  makeTemplateMenus = () => {
    const that = this;
    const key = this._pen.objectType;
    const templates = this._templates[key];
    let html = `<div class="item" data-value="save">Save Drawing Template As...</div>
            <div class="item" data-value="default">Apply Default Drawing Template</div>`;
    if (templates && templates.length > 0) {
      templates.forEach(item => {
        html += `<div class="item" data-value="${item.value}">${item.name}<i class="ui icon close"></i></div>`;
      });
    }

    $('.tv-floating-toolbar__widget[key="template"] .ui.dropdown .menu').html(html);
    $('.tv-floating-toolbar__widget[key="template"] .ui.dropdown .menu .item .icon.close').click(e => {
      that._delete_template_flag = true;
    });

    html = `<option value="blank">Templates</option>
              <option value="save">Save Drawing Template As...</option>
              <option value="default">Apply Default Drawing Template</option>`;
    if (templates && templates.length > 0) {
      templates.forEach(item => {
        html += `<option value="${item.value}">${item.name}</option>`;
      });
    }
    $('#template').html(html);
    $("#template").selectmenu("refresh");

  };

  /**
   * add chart pan
   */
  addPan = (shape) => {
    if (this._pans.length > 2) {
      return Swal.fire('Indicator Limit Error', 'You can have till 2 extra indicators!', 'error');
    }
    const options = this._chartWidget.options();
    // const extras = ['extra_0', 'extra_1'];
    const containerId = shape.id;
    // for (var i = 0; i < extras.length; i++) {
    //   const panIndex = this._pans.findIndex(pan => (pan._containerId === extras[i]));
    //   if (panIndex < 0) {
    //     containerId = extras[i];
    //     break;
    //   }
    // }
    // if (containerId === '') {
    //   return Swal.fire('Indicator Limit Error', 'You can have till 2 extra indicators!', 'error');
    // }
    shape.containerId = containerId;

    let result = null;
    const rDatapoints = this._mainPoints.filter((point, index) => {
      if (index > 49 && index < this._mainPoints.length - 110) {
        return point.y && point.y.length > 0;
      } else {
        return true;
      }
    })
    if (shape.key === 'stochastic') {
      result = StochasticIndicator(_.cloneDeep(rDatapoints), _.cloneDeep(shape), options.topToolbar.interval.intervalVal);
    } else if (shape.key === 'rsi') {
      result = RSIIndicator(_.cloneDeep(rDatapoints), _.cloneDeep(shape))
    } else if (shape.key === 'macd') {
      result = MACDIndicator(_.cloneDeep(rDatapoints), _.cloneDeep(shape))
    } else if (shape.key === 'atr') {
      result = ATRIndicator(_.cloneDeep(rDatapoints), _.cloneDeep(shape))
    }

    if (!result) return;

    let yFomatString = ['###0', '0000'];
    yFomatString[1] = '0000'.slice(0, this._chartWidget._options.topToolbar.currency.precision);

    // this.updateShape(result.option);

    let option = _.merge(_.cloneDeep(CanvasChartOption), {
      dataPointWidth: this._option.dataPointWidth,
      axisX: {
        crosshair: {
          labelFormatter: function (e) {
            return moment(e.value).format("DD MMM`YY H:mm");
          }
        },
        labelFormatter: (e) => {
          if (this._interval.value === 'D') {
            if (moment(e.value).isSame(moment(e.value).startOf('year'))) {
              return moment(e.value).format('YYYY');
            }
            if (moment(e.value).isBetween(moment(e.value).startOf('month'), moment(e.value).startOf('month').add(1, 'day'))) {
              return moment(e.value).format('MMM');
            }

            if (moment(e.value).format('D') === '1') {
              return moment(e.value).format('MMM');
            } else {
              return moment(e.value).format('D');
            }

          } else {
            if (moment(e.value).isSame(moment(e.value).startOf('year'))) {
              return moment(e.value).format('YYYY');
            }
            if (moment(e.value).isSame(moment(e.value).startOf('month'))) {
              return moment(e.value).format('MMM');
            }
            if (moment(e.value).isSame(moment(e.value).startOf('day'))) {
              return moment(e.value).format('D');
            } else {
              return moment(e.value).format('HH:mm');
            }
          }
        },
        // viewportMinimum: option.viewport.x[0],
        // viewportMaximum: option.viewport.x[1],
        scaleBreaks: {
          customBreaks: this._option.customBreaks,
          spacing: 0,
          lineThickness: 0
        }
      },
      axisY2: {
        crosshair: {
          enabled: true
        },
        valueFormatString: yFomatString.join('.'),
        stripLines: []
      },
      data: result.charts
    });

    if (shape.key === 'stochastic' || shape.key === 'rsi') {
      _.merge(option, {
        axisY2: {
          viewportMaximum: 100,
          viewportMinimum: 0,
          maximum: 100,
          minimum: 0,
          valueFormatString: '#0.####'
        }
      })
    } else if (shape.key != 'atr') {
      var maxval = Math.max(Math.abs(result.option.maximum), Math.abs(result.option.minimum));
      _.merge(option, {
        axisY2: {
          includeZero: false,
          gridThickness: 0.1,
          labelFontSize: 12,
          valueFormatString: "0.####",
          crosshair: {
            enabled: true,
            color: "orange",
          },
          viewportMaximum: maxval,
          viewportMinimum: -maxval,
          maximum: maxval,
          minimum: -maxval
        }
      })
    }

    if (options.topToolbar.interval.value == 'D') {
      option.axisX.interval = 1;
      option.axisX.intervalType = 'month';
    } else {
      option.axisX.interval = null;
      option.axisX.intervalType = null;
    }

    this._chartHeights[containerId] = Math.floor(this._height * 0.25);
    this._chartHeights['primary_chart'] = this._chartHeights['primary_chart'] - this._chartHeights[containerId];

    option.height = this._chartHeights[containerId];
    this._chart.addTo('charts', option);
    const chartIndex = this._chart.charts.length - 1;

    this._chart.charts[chartIndex - 1].axisX[0].set('labelFormatter', (e) => (''), false);
    this._chart.charts[chartIndex - 1].axisX[0].crosshair.set('labelFormatter', (e) => (''), false);
    this._chart.charts[chartIndex - 1].axisX[0].set('tickLength', 0, false);
    this._chart.charts[chartIndex - 1].axisX[0].set('lineThickness', 6, true);

    this._pans.forEach(pan => {
      $(`#${pan._containerId}_drawer`).remove();
      pan._addCanvas(false);
      pan.draw();

      if ($(pan._component.container).resizable("instance") != 'undefined') {
        $(pan._component.container).resizable('option', 'disabled', false);
      }
      pan._hasAxisX = false;
    });

    this._shapes.push(result.option);
    this._chartWidget._options.pan.shape = this._shapes;

    this.autoSave(result.option, 'create');

    this._pans.push(new ChartPan({
      parent: this,
      elementIndex: chartIndex,
      width: this._width,
      precision: options.topToolbar.currency.precision,
      component: this._chart.charts[chartIndex],
      containerId,
      shapes: [result.option],
      hasAxisX: true,
      mainShape: result.option,
      dataPoints: this._mainPoints
    }));
  }

  resize = (containerId, size) => {
    this._chartWidget._toptoolbar.hidingTools();
    if (containerId == 'primary_chart') {
      this._chartHeights['primary_chart'] = size.height;
      let height = this._height - size.height;
      if (this._pans.length > 2) {
        height = height - this._chartHeights[this._pans[2]._containerId];
      }
      this._chart.charts[0].set('height', size.height);
      this._chart.charts[1].set('height', height);
    } else {
      this._chartHeights[this._pans[1]._containerId] = size.height;
      let height = this._height - size.height;
      if (this._pans.length > 2) {
        height = height - this._chartHeights['primary_chart'];
      }
      this._chart.charts[1].set('height', size.height);
      this._chart.charts[2].set('height', height);
    }
    this._pans.forEach(pan => {
      $(`#${pan._containerId}_drawer`).remove();
      pan._addCanvas(false);
      pan.draw();
    });
  }

  resizeWidth = (offsetW) => {
    this.initPen();
    this._width = this._width + offsetW;
    $(this._element).css('width', this._width);
    if (this._chart) {
      this._chart.set('width', this._width);

      this._pans.forEach(pan => {
        $(`#${pan._containerId}_drawer`).remove();
        pan._addCanvas(false);
        // pan.draw();
      });
      this.zooming(-offsetW);
    }
    this._chartWidget._toptoolbar.hidingTools();
  }

  zoomRange = (offset) => {
    const chart = this._chart.charts[0];
    const minViewport = Math.floor(chart.axisX[0].convertPixelToValue(chart.axisX[0].convertValueToPixel(chart.axisX[0].get('viewportMinimum')) - offset));
    const maxViewport = Math.floor(chart.axisX[0].convertPixelToValue(chart.axisX[0].convertValueToPixel(chart.axisX[0].get('viewportMaximum')) + offset));

    const interval = this._chartWidget._options.topToolbar.interval;
    const intervalVal = interval ? interval.intervalVal : 3600;
    var visualNum = moment(maxViewport).diff(minViewport, 'seconds') / intervalVal;
    var stickWidth = Math.round(parseInt(this._width) / (visualNum * 2.5));
    if (stickWidth <= 0) stickWidth = 1;
    else if (stickWidth >= 30) stickWidth = 30;
    this._option.dataPointWidth = stickWidth;
    // this._orgRange = [this._minViewport, this._maxViewport];
    this._minViewport = new Date(minViewport);
    this._maxViewport = new Date(maxViewport);
    this._slider.minimum = this._minViewport;
    this._slider.maximum = this._maxViewport;
    this._chart.navigator.slider.set('minimum', this._minViewport, false)
    this._chart.navigator.slider.set('maximum', this._maxViewport)

    this._pans.forEach(extra => {
      extra._component.set('dataPointWidth', stickWidth);
      extra.draw();
    });
  }

  zooming = offset => {
    this._activeShape = null;
    this.initPen();
    this._whileZooming = true;
    const that = this;
    if (!this._pans[0]) return;
    const maxViewport = this._chart.navigator.slider.get('maximum');
    var maxVal = 0;
    for (var i = this._mainPoints.length - 1; i > 0; i--) {
      if (this._mainPoints[i].y.length > 0) {
        maxVal = this._mainPoints[i - 10].x;
        break;
      }
    }
    var min = this._pans[0]._component.axisX[0].convertPixelToValue(offset);
    var minimum = null;
    if (min < this._mainPoints[0].x.getTime()) {
      minimum = parseInt(min);
    }

    if (offset > 0 && (min > maxViewport || min > maxVal.getTime())) {
      return false;
    }

    const filters = this._mainPoints.filter(bar => {
      const tval = bar.x.getTime();
      // return tval >= min && tval <= maxViewport && bar.y.length > 0
      return tval >= min && tval <= maxViewport
    });

    var totalNum = filters.length;
    console.log(totalNum);
    if (totalNum > 3000 && offset < 0) {
      return false;
    }

    if (totalNum <= 0) totalNum = 6;
    var stickWidth = Math.round(this._pans[0]._component.get("width") / (totalNum * 2.5));
    if (stickWidth <= 0) stickWidth = 1;
    else if (stickWidth >= 50) stickWidth = 50;

    this._pans.forEach(pan => {
      pan._component.set('dataPointWidth', stickWidth);
    });

    if (min < this._mainPoints[50].x.getTime() && !this._gettingFlag) {
      this._gettingFlag = true;
      let offsetX = 0;
      this._gettingDataPoints(true, () => {
        const minBars = this._mainPoints.filter(bar => (bar.x.getTime() <= min));
        offsetX = this._mainPoints.length - minBars.length;
        this.renderNewData(offsetX);
        this._gettingFlag = false;
      });
    } else {
      this._minViewport = new Date(min);
      this._slider.minimum = this._minViewport;
      this._chart.options.navigator.slider = this._slider;
      this._chart.render();
      this._pans.forEach(pan => {
        pan.draw();
      });
    }
  }

  /**
   * reposition of chart axisx and point width
   */
  reset = () => {
    this.initPen();
    const minViewport = moment(this._viewport.x[0]).isAfter('2000-01-01T00:00:00') ? this._viewport.x[0] : this._mainPoints[this._mainPoints.length - 110].x;
    const maxViewport = moment(this._viewport.x[1]).isAfter('2000-01-01T00:00:00') ? this._viewport.x[1] : this._mainPoints[this._mainPoints.length - 1].x;
    this._pans.forEach(pan => {
      pan._component.axisX[0].set("viewportMinimum", minViewport, false);
      pan._component.axisX[0].set("viewportMaximum", maxViewport, false);
      if (pan._containerId === 'primary_chart') {
        $(pan._component.container).find(`.canvasjs-chart-toolbar button:nth-child(2)`).click();
      }
      pan.draw();
    });
  }

  resizeMe = function (img) {

    var canvas = document.createElement('canvas');

    var width = img.width;
    var height = img.height;
    var max_width = 400;
    var max_height = 400;
    // calculate the width and height, constraining the proportions
    if (width > height) {
      if (width > max_width) {
        //height *= max_width / width;
        height = Math.round(height *= max_width / width);
        width = max_width;
      }
    } else {
      if (height > max_height) {
        //width *= max_height / height;
        width = Math.round(width *= max_height / height);
        height = max_height;
      }
    }

    // resize the canvas and draw the image data into it
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);

    // preview.appendChild(canvas); // do the actual resized preview

    return canvas.toDataURL("image/jpeg", 1); // get the data from canvas as 70% JPG (can be also PNG, etc.)

  }

  /**
   * Taking a snapshot
   */
  snapshot = flag => {
    const that = this;
    this._chartWidget.loaded(false);
    let snapshotUrl = '';
    const beforeTime = new Date().getTime();
    const element = document.querySelector('.tfa-chart-wrapper');
    htmlToImage.toJpeg(element).then(dataUrl => {
      console.log('after', new Date().getTime() - beforeTime);
      var image;
      // Create a temporary image so that we can compute the height of the downscaled image.
      image = new Image();
      image.src = dataUrl;
      image.onload = function () {
        // have to wait till it's loaded
        var newDataUrl = that.resizeMe(image); // send it to canvas

        // return newDataUrl;
        Swal.fire({
          title: 'Screenshot of Chart',
          html: `<div class="tfa-modal screen-shot" style="padding: 10px">
          <div class="ui card">
            <div class="image">
              <img src="${newDataUrl}">
            </div>            
          </div>
          <div class="actions">
            <a download="chart.png" id="download"><div class="ui basic green button">Download</div></a>
            <div class="ui basic red button">Upload</div>
            <div class="ui basic grey button">Cancel</div>
          </div>
        </div>`,
          position: 'top',
          showCancelButton: false,
          showConfirmButton: false,
          // confirmButtonText: 'Upload',
          // cancelButtonText: 'Close',
          customClass: {
            popup: 'tfa-modal',
          },
          onOpen: (dialog) => {
            $(dialog).find('#download').attr('href', newDataUrl);

            $(dialog).find('.ui.red.button').click(() => {
              $.ajax({
                type: 'POST',
                url: that._chartWidget.options().hostUrl + that._chartWidget.options().screenshotUrl,
                // url: 'http://localhost:1337/api/livecharts/uploadimage',
                data: {
                  imageData: newDataUrl
                },
                beforeSend: function (xhr) {
                  xhr.setRequestHeader("Authorization", that._chartWidget.options().token);
                },
                success: res => {
                  if (res.success) {
                    snapshotUrl = res.url;
                    Swal.fire({
                      title: 'Screenshot Url',
                      html: `<div class="screen-shot" style="padding: 10px">
                      <div class="ui card">
                        <div class="content">
                          <div class="description">
                            ${snapshotUrl}
                          </div>
                        </div>
                      </div>
                    </div>`,
                      position: 'top',
                      showCancelButton: true,
                      confirmButtonText: 'Copy',
                      cancelButtonText: 'Close',
                      customClass: {
                        popup: 'tfa-modal',
                      }
                    }).then(mresult => {
                      that._chartWidget.loaded(true);
                      if (mresult.value) {
                        navigator.clipboard.writeText(snapshotUrl).then(function () {
                          console.log('copy success to clipborad');
                        }, function (err) {
                          console.log('copy failed to clipborad')
                        });
                      }
                    });
                  } else {
                    that._chartWidget.loaded(true);
                    Swal.fire('Failed',
                      'Snapshot image uploading failed',
                      'error'
                    );
                  }
                },
                error: e => {
                  that._chartWidget.loaded(true);
                  Swal.fire('Failed',
                    'Snapshot image uploading failed',
                    'error'
                  );
                }
              });
            });

            $(dialog).find('.ui.grey.button').click(() => {
              that._chartWidget.loaded(true);
              Swal.close();
            });
          }
        });
      }
    });
  }

  takeSnapshotImage = (cb) => {
    const that = this;
    htmlToImage.toJpeg(this._element).then(dataUrl => {
      var image = new Image();
      image.src = dataUrl;
      image.onload = function () {
        // have to wait till it's loaded
        var newDataUrl = that.resizeMe(image); // send it to canvas
        if (cb) cb(newDataUrl);
      }
    });
  }

  _rangeChanging = e => {
    this._activeShape = null;
    if (this._stopRange) {
      return;
    }
    this._whileZooming = true;
    for (var i = 0; i < this._pans.length; i++) {
      this._pans[i].startRenderShapes();
    }
  }

  renderNewData = (offsetX = 0) => {
    if (offsetX > 0) {
      this._chart.navigator.data[0].set('dataPoints', this._mainPoints.map(bar => ({
        x: bar.x,
        y: bar.y.length > 0 ? bar.y[3] : null
      })), false);
      const minVal = this._mainPoints[this._mainPoints.length - offsetX].x;
      this._chart.navigator.axisX[0].set('scaleBreaks', {
        customBreaks: this._option.customBreaks,
        spacing: 0,
        lineThickness: 0
      });
      this._chart.navigator.slider.set('minimum', minVal);
    }

    this.renderChartWithCustomStyle();
  }

  _rangeChanged = e => {
    if (this._stopRange) {
      return;
    }
    this._maxViewport = e.maximum;
    this._minViewport = e.minimum;
    this._viewport.x = [this._minViewport, this._maxViewport]
    if (e.type === 'reset') {
      const primaryPan = this._pans[0];
      const panButton = $(primaryPan._component.container).find(`.canvasjs-chart-toolbar button:first-child`)
      if ($(panButton).attr('state') === 'pan') {
        $(panButton).click()
      }
      return;
    }
    const that = this;

    if (this._minViewport < this._mainPoints[50].x.getTime() && !this._gettingFlag) {
      this._gettingFlag = true;
      const minBars = this._mainPoints.filter(bar => (bar.x.getTime() <= e.minimum));
      const offsetX = this._mainPoints.length - minBars.length;
      this._gettingDataPoints(true, () => {
        this.renderNewData(offsetX);
        this._gettingFlag = false;
      });
    }

    if (this._pans[0]._component.get("zoomType") === 'xy') {
      const minVal = this._pans[0]._component.axisY2[0].convertValueToPixel(this._pans[0]._component.axisY2[0].viewportMinimum) + 150;
      const maxVal = this._pans[0]._component.axisY2[0].convertValueToPixel(this._pans[0]._component.axisY2[0].viewportMaximum) - 150;
      this._pans[0]._component.axisY2[0].set('minimum', this._pans[0]._component.axisY2[0].convertPixelToValue(minVal), false);
      this._pans[0]._component.axisY2[0].set('maximum', this._pans[0]._component.axisY2[0].convertPixelToValue(maxVal));
    }
    for (var i = 0; i < this._pans.length; i++) {
      this._pans[i].stopRenderShapes();
    }
    this.printPrice();
  };

  printPrice = () => {
    return;
    if (this._pans.length <= 0) return;
    const primary_chart = this._chart.charts[0];
    if (primary_chart) {
      const val = primary_chart.axisX[0].get('viewportMaximum');
      var dataPoints = this._mainPoints;
      // const objectType = flag? 'final-price': 'price';
      var priceOption = {
        color: '#ff0000',
        showOnTop: true,
        labelFontColor: "white",
        labelAlign: 'near',
        labelBackgroundColor: '#ff0000',
        labelFontSize: 12,
        lineDashType: 'dot',
        thickness: 0,
        label: '',
        objectType: 'price',
        labelWrap: false
      };

      var finalPriceOption = JSON.parse(JSON.stringify(priceOption));
      finalPriceOption.objectType = 'final-price';

      let prices = primary_chart.options.axisY2.stripLines;
      const priceIndex = prices.findIndex(o => (o.objectType === 'price'));
      const finalPriceIndex = prices.findIndex(o => (o.objectType === 'final-price'));
      // const powVal = Math.pow(10, this._chartWidget._options.topToolbar.currency.precision);
      let finalFlag = false;
      // const labelWidth = this._pans[0]._xMargin;
      const options = this._chartWidget.options();
      const theme = options.pan[options.pan.theme];
      for (var i = dataPoints.length - 1; i >= 0; i--) {
        if (dataPoints[i].x <= val && dataPoints[i].y.length > 0) {
          if (!this._finalColor) {
            this._finalColor = this._pivotStyle ? this._pivotStyle : (dataPoints[i].y[0] > dataPoints[i].y[3] ? theme.body.falling : theme.body.rising);
          }
          finalPriceOption.value = this._finalPrice;
          finalPriceOption.label = Number(finalPriceOption.value).toFixed(this._chartWidget._options.topToolbar.currency.precision);
          // finalPriceOption.label = finalPriceOption.value;
          finalPriceOption.labelPlacement = "outside";
          finalPriceOption.color = this._finalColor;
          finalPriceOption.labelBackgroundColor = this._finalColor;
          finalPriceOption.thickness = 1;
          finalPriceOption.labelWrap = false;
          // finalPriceOption.labelMaxWidth = labelWidth - 8;
          finalFlag = true;
          if (dataPoints[i].y && dataPoints[i].y.length > 0) {
            priceOption.value = dataPoints[i].y[3];
            // priceOption.label = priceOption.value;
            priceOption.label = Number(priceOption.value).toFixed(this._chartWidget._options.topToolbar.currency.precision);
            priceOption.labelPlacement = "outside";
            if (dataPoints[i].y[0] > dataPoints[i].y[3]) {
              priceOption.labelBackgroundColor = this._option[this._option.theme].body.falling;
            } else {
              priceOption.labelBackgroundColor = this._option[this._option.theme].body.rising;
            }
            finalPriceOption.labelBackgroundColor = 'transparent';
            finalPriceOption.labelFontColor = 'transparent';
            finalFlag = false;
          } else {
            priceOption.labelBackgroundColor = 'transparent';
            priceOption.labelFontColor = 'transparent';
          }

          break;
        }
      }

      if (finalPriceIndex >= 0) {
        prices[finalPriceIndex] = finalPriceOption;
      } else {
        prices.push(finalPriceOption);
      }

      if (priceIndex >= 0) {
        prices[priceIndex] = priceOption;
      } else {
        prices.push(priceOption);
      }

      primary_chart.options.axisY2.stripLines = prices;
      primary_chart.render();
    }
  };

  /** saving function */
  /** save as function */
  saveAs = () => {
    this.initPen();
    const that = this;
    var options = this._chartWidget.options();
    // options.pan.shape = this._shapes;
    const html = `<div class="modal-body duplicate-modal" style="padding: 10px">
      <div class="content scrolling mini-title">
        <div class="title">
          <h2>Duplicate Layout</h2>
          <div class="ui label close">
            <svg width="15" height="15" class="close" viewBox="0 0 15 15"  fill="#FCFCFC" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.00029 0.317885L7.50014 5.8172L13 0.334549C13.1083 0.224379 13.2382 0.137874 13.3817 0.0805049C13.5251 0.0231361 13.6789 -0.0038486 13.8333 0.00125733C14.1363 0.0208622 14.4218 0.150057 14.6364 0.364719C14.8511 0.579381 14.9803 0.864834 14.9999 1.16778C15.0014 1.31673 14.9727 1.46444 14.9154 1.60194C14.8581 1.73944 14.7734 1.86387 14.6666 1.96768L9.15009 7.50032L14.6666 13.033C14.8833 13.2429 15.0033 13.5329 14.9999 13.8329C14.9803 14.1358 14.8511 14.4213 14.6364 14.6359C14.4218 14.8506 14.1363 14.9798 13.8333 14.9994C13.6789 15.0045 13.5251 14.9775 13.3817 14.9201C13.2382 14.8628 13.1083 14.7763 13 14.6661L7.50014 9.18345L2.01695 14.6661C1.90867 14.7763 1.7787 14.8628 1.63526 14.9201C1.49182 14.9775 1.33804 15.0045 1.18364 14.9994C0.875017 14.9833 0.583284 14.8535 0.364758 14.635C0.146231 14.4165 0.0164056 14.1248 0.00034112 13.8162C-0.00116684 13.6673 0.0276004 13.5195 0.0848979 13.382C0.142195 13.2445 0.226829 13.1201 0.333665 13.0163L5.85018 7.50032L0.316999 1.96768C0.213171 1.86247 0.131618 1.73741 0.0772107 1.59997C0.0228039 1.46253 -0.00333999 1.31554 0.00034112 1.16778C0.0199479 0.864834 0.149156 0.579381 0.363839 0.364719C0.578521 0.150057 0.864002 0.0208622 1.16698 0.00125733C1.32018 -0.00601838 1.47323 0.0183407 1.6166 0.0728159C1.75997 0.127291 1.89058 0.210715 2.00029 0.317885Z" fill-opacity="0.8"/>
            </svg>
          </div>
        </div>
        <div class="header" style="padding: 18px;">
          <div class="ui label">Layout Name</div>
          <div class="ui input has-border" style="width: 100%">
            <input type="text" id="chart_name"/>
          </div>
        </div>
        <div class="header for-confirm" style="padding: 18px;">
          <h2>Do you want to rename <span class="org-name"></span> layout to <span class="new-name"></span>?</h2>
          <div class="ui label">
            There is already a layout with the same name.
          </div>
        </div>
      </div>
      <div class="actions" style="padding-top: 10px">
        <button class="ui button deny">Cancel</button>  
        <button class="ui button green ok">OK</button>        
      </div>
    </div>`;
    $(this._element).append(html);
    $('.modal-body').dialog({
      modal: true,
      title: 'Please enter name of the chart!',
      width: 350,
      resizable: false,
      classes: {
        'ui-dialog': 'tfa-modal'
      },
      open: event => {
        const modalEl = event.target;
        const chName = that._chartWidget._layout.name + (that._chartWidget._layout.nameIndex > 0 ? ` (${that._chartWidget._layout.nameIndex}) - Copy` : ' - Copy')
        $(modalEl).find('#chart_name').val(chName);

        $(modalEl).find('#chart_name').keyup(function (event) {
          var keycode = (event.keyCode ? event.keyCode : event.which);
          if (keycode == '13') {
            saveLayout();
          }
        });

        $(modalEl).find('.button.ok').click(function () {
          saveLayout();
        });

        function saveLayout() {
          const chartName = $(modalEl).find('#chart_name').val();
          if (chartName.length > 0) {
            const shapes = that._shapes.map(shape => {
              const temp = JSON.parse(JSON.stringify(shape));
              delete temp.points;
              delete temp.toolbar;
              return temp;
            })
            var layout = {
              name: chartName,
              ownerId: options.writerId,
              symbol: options.topToolbar.currency,
              interval: options.topToolbar.interval,
              theme: {
                mainType: options.pan.mainType,
                light: options.pan.light,
                dark: options.pan.dark,
                theme: options.pan.theme
              },
              shapes: {
                [options.topToolbar.currency.name]: shapes
              },
              domain: options.domain,
              timeRange: [that._chart.navigator.slider.get('minimum'), that._chart.navigator.slider.get('maximum')],
              collaborate: options.collaborate,
              isDefault: true,
              isFavorite: false
            };
            $.post({
              url: `${options.hostUrl}/api/layouts`,
              data: {
                data: JSON.stringify(layout)
              },
              dataType: "json",
              beforeSend: function (x) {
                x.setRequestHeader("Authorization", options.token);
                if (x && x.overrideMimeType) {
                  x.overrideMimeType("application/j-son;charset=UTF-8");
                }
              },
              success: res => {
                if (res.status.toLowerCase() === 'ok') {
                  that._chartWidget._options.name = res.layout.name;
                  that._chartWidget._layout_id = res.layout._id;
                  that._chartWidget._layout = res.layout;
                  const title = `${res.layout.name}` + (res.layout.nameIndex > 0 ? ` (${res.layout.nameIndex})` : '');
                  $(that._chartWidget._toptoolbar._element).find('.ui.label[key="layout"] .caption').html(title);
                  that.renderMsgTip('Layout Duplicated');
                  $(that._chartWidget._toptoolbar._element).find('.ui.label[key="layout"]').addClass('shared');
                  that._chartWidget._joinChartSocket();
                } else {
                  Swal.fire('Saving chart error!', 'Please check server response!', 'error');
                }
              }
            });
            if ($('.modal-body').dialog('isOpen')) {
              $('.modal-body').dialog('close');
            }
          } else {
            Swal.fire('Input Error', 'Please enter chart name', 'error');
          }
        }

        $(modalEl).find('.button.deny').click(function () {
          if ($('.modal-body').dialog('isOpen')) {
            $('.modal-body').dialog('close');
          }
        });

        $('.ui-widget-overlay').click(() => {
          if ($('.modal-body').dialog('isOpen')) {
            $('.modal-body').dialog('close');
          }
        });

        $(modalEl).find('.ui.label.close').click(() => {
          if ($('.modal-body').dialog('isOpen')) {
            $('.modal-body').dialog('close');
          }
        });
      },
      close: event => {
        $(event.target).remove();
      }
    });
  }

  updateShape = (shape, autoSave = false) => {
    var rOption = _.cloneDeep(this._pen.option);
    if (rOption) {
      _.merge(rOption, shape);
      this._pen.option = rOption;
      const curPan = this.getCurrentPan(rOption.containerId);
      curPan.draw();
      if (autoSave) {
        this.autoSave(rOption, 'update');
      }
    }
  };

  /** template module */
  setTemplate = (value) => {
    const that = this;
    const curPan = this.getCurrentPan(this._pen.option.containerId);
    const option = this._chartWidget.options();
    if (value === 'blank') return;
    if (value === 'save') {
      const html = `<div class="template-name-modal" style="padding: 10px">
        <div class="content scrolling">
          <div class="ui left icon input" style="width: 100%">
            <input type="text" id="name"/>
          </div>
        </div>
        <div class="actions" style="padding-top: 10px">
          <button class="ui right floated button green ok">OK</button>
          <button class="ui right floated button deny">Cancel</button>
        </div>
      </div>`;
      $(this._element).append(html);
      $('.template-name-modal').dialog({
        modal: true,
        title: 'Please enter name of the template!',
        width: 350,
        resizable: false,
        classes: {
          'ui-dialog': 'tfa-chart-setting-dialog'
        },
        open: event => {
          const modalEl = event.target;
          $(modalEl).find('.button.ok').click(function () {
            const name = $(modalEl).find('#name').val();
            that.saveTemplate(name);
            $(modalEl).dialog('close');
          });

          $(modalEl).find('.button.deny').click(function () {
            $(modalEl).dialog('close');
          });

          $('.ui-widget-overlay').click(() => {
            $(modalEl).dialog('close');
          });
        },
        close: event => {
          $(event.target).remove();
        }
      });
    } else if (value === 'default') {
      const dOption = defaultOptions[this._pen.objectType];
      const styleOption = _.cloneDeep(dOption);
      _.merge(styleOption, {
        id: that._pen.option.id,
        chartPoints: that._pen.option.chartPoints,
        points: that._pen.option.points
      });

      that._pen.option = {
        ...styleOption
      };
      curPan.updateShape(that._pen.option);
      that.autoSave(that._pen.option, 'update');
      curPan.draw()
      that.displayToolbar(true, false);
      that._initializeSetting();
    } else {
      if (this._delete_template_flag) return this.deleteTemplate(value, option.hostUrl);
      const sTemplate = this._templates[this._pen.option.key].find(item => (item.value === value));
      if (sTemplate && sTemplate.option) {
        delete sTemplate.option.timeRange;
      }
      _.merge(that._pen.option, sTemplate.option);
      that.displayToolbar(true, false);
      if (curPan) {
        curPan.draw();
        curPan._initializeSetting();
      }
      that.autoSave(that._pen.option, 'update');
    }
  };

  saveTemplate = (name, styleOption) => {
    const that = this;
    const option = this._chartWidget.options();
    if (!styleOption)
      styleOption = _.cloneDeep(this._pen.option);
    delete styleOption.id;
    delete styleOption.chartPoints;
    delete styleOption.points;
    delete styleOption.visible;
    delete styleOption.hoverover;
    delete styleOption.priceIndex;
    delete styleOption.priceOffset;
    delete styleOption.chartIndex;
    delete styleOption.zIndex;
    delete styleOption.toolbar;
    delete styleOption.chartData;
    delete styleOption.containerId;
    delete styleOption.timeRange;
    delete styleOption.curIndex;
    delete styleOption.isLocked;
    delete styleOption.comment;
    delete styleOption.commentFor;
    delete styleOption.ownerId;

    $.post({
      url: `${option.hostUrl}/api/shape-template`,
      data: {
        key: styleOption.indicator ? 'default' : 'template',
        shapeType: styleOption.key,
        owner: option.writerId,
        option: JSON.stringify(styleOption),
        name: name
      },
      dataType: "json",
      beforeSend: function (x) {
        x.setRequestHeader("Authorization", option.token);
        if (x && x.overrideMimeType) {
          x.overrideMimeType("application/j-son;charset=UTF-8");
        }
      },
      success: res => {
        if (res.status.toLowerCase() === 'ok') {
          if (res.data)
            that._templates = res.data;
          if (!styleOption.indicator) {
            that.makeTemplateMenus();
          }
        }
      }
    });
  }

  deleteTemplate = (id, host) => {
    const that = this;
    this._delete_template_flag = false;
    $.ajax({
      url: `${host}/api/shape-template/${id}`,
      type: 'DELETE',
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", that._chartWidget._options.token);
      },
      success: function (result) {
        if (result.status === 'ok') {
          that._templates = result.data;
          that.makeTemplateMenus();
        }
      }
    });
  }

  /** setting option */
  settingOption = (cb) => {
    const that = this;
    const colorWrappers = [
      'mainLine.lineColor', 'label.color', 'background.color',
      'levels[0].color', 'levels[4].color', 'levels[7].color',
      'levels[1].color', 'levels[5].color', 'levels[8].color',
      'levels[2].color', 'levels[6].color', 'levels[9].color',
      'levels[3].color', 'levelLine.color', 'levelLine.lineColor'
    ];
    const oldOption = _.cloneDeep(this._pen.option);
    const template = getTemplates(this._pen.option.templateName);
    $(this._element).append(template);
    if (this._pen.option.key.indexOf('fib') >= 0) {
      let levelHtml = '';
      this._pen.option.levels.forEach((option, index) => {
        const colHtml = `
        <div class="field one wide column label">
          <div class="ui checkbox mine" key="levels[${index}].visible">
            <input type="checkbox"/>
            <label></label>
          </div>
        </div>
        <div class="field four wide column">
          <div class="ui input">
            <input type="text" class="input-box" key="levels[${index}].value" style="padding-left: 5px; padding-right:5px; width: 100%"/>
          </div>
        </div>
        <div class="field two wide column color">
          <input type="text" style="display:none" class="color-wrapper" key="levels[${index}].color"/>
        </div>
        <div class="field one wide column"></div>
        `;
        if (index % 2 === 0) {
          levelHtml += '<div class="fields row">' + colHtml;
        } else {
          levelHtml += colHtml + '</div>';
        }

        if (colorWrappers.findIndex(oo => (oo === `levels[${index}].color`)) < 0) {
          colorWrappers.push(`levels[${index}].color`);
        }
      });
      $(this._element).find('.level-wrapper').replaceWith(levelHtml);
      $(this._element).find('.ui.tab.style').css('height', window.innerHeight * 0.7 - 200).css('overflow-y', 'auto');
    }
    $(this._element).find('.setting-modal.tfa-modal').dialog({
      modal: true,
      title: oldOption.title + '  Setting',
      width: that._pen.objectType.indexOf('fib') >= 0 ? 550 : 450,
      maxHeight: window.innerHeight * 0.7,
      resizable: false,
      classes: {
        'ui-dialog': 'tfa-chart-setting-dialog'
      },
      open: event => {
        const modalEl = event.target;
        that._setting_modal = modalEl;
        that._initializeSetting();
        const curPan = that.getCurrentPan(that._pen.option.containerId);
        $(modalEl).find('.tabular.menu .item').tab();
        $(modalEl).find('.ui.dropdown').dropdown({
          onChange: (value, text, $choice) => {
            var oKey = $($choice).closest('.ui.dropdown').attr('key');
            if (oKey === 'start.arrow' || oKey === 'end.arrow') {
              value = value === 'true'
            }
            _.set(that._pen.option, oKey, value);
            curPan.draw();
          }
        });

        let html = `<option value="blank">Templates</option>
          <option value="save">Save Drawing Template As...</option>
          <option value="default">Apply Default Drawing Template</option>`;
        if (that._templates[that._pen.objectType]) {
          that._templates[that._pen.objectType].forEach(item => {
            html += `<option value="${item.value}">${item.name}</option>`;
          });
        }

        $('#template').html(html);
        $("#template").selectmenu({
          select: (event, ui) => {
            const val = $(event.target).val();
            that.setTemplate(val);
          }
        }).data("ui-selectmenu")._renderItem = (ul, item) => {
          var li = $("<li>"),
            wrapper = $("<div>", {
              text: item.label
            });

          if (item.disabled) {
            li.addClass("ui-state-disabled");
          }

          if (['blank', 'save', 'default'].indexOf(item.value) < 0) {
            $("<i>", {
              "class": "ui icon close"
            }).appendTo(wrapper);
          }
          $(wrapper).find('i').click(() => {
            that._delete_template_flag = true;
          });
          return li.append(wrapper).appendTo(ul);
        };

        $(modalEl).find('.input-box').change((e) => {
          var oKey = $(e.target).attr('key');
          _.set(that._pen.option, oKey, $(e.target).val());
          curPan.draw();
        });

        colorWrappers.forEach(oKey => {
          if (_.has(this._pen.option, oKey)) {
            const color = _.get(this._pen.option, oKey);
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
              palette: colorPalette,
              beforeShow: color => {
                color = _.get(that._pen.option, oKey);
                $(modalEl).find(`.color-wrapper[key="${oKey}"]`).spectrum('set', color);
              },
              change: color => {
                if (oKey === 'levelLine.color') {
                  const levelsColorKey = colorWrappers.filter(o => (o.indexOf('levels') >= 0));
                  _.set(that._pen.option, oKey, color.toRgbString());
                  levelsColorKey.forEach(kkey => {
                    _.set(that._pen.option, kkey, color.toRgbString());
                  });
                } else {
                  _.set(that._pen.option, oKey, color.toRgbString());
                }
                curPan.draw();
              }
            });
          }
        });

        $(modalEl).find(".ui.checkbox").checkbox({
          onChecked: function () {
            var oKey = $(this).parent(".ui.checkbox").attr("key");
            _.set(that._pen.option, oKey, true);
            curPan.draw();
          },
          onUnchecked: function () {
            var oKey = $(this).parent(".ui.checkbox").attr("key");
            _.set(that._pen.option, oKey, false);
            curPan.draw();
          }
        });

        if (_.has(that._pen.option, 'label.fontWeight')) {
          $(modalEl).find(`.ui.button[key="label.fontWeight"]`).click(() => {
            if (_.get(that._pen.option, 'label.fontWeight') === 'bold') {
              _.set(that._pen.option, 'label.fontWeight', 'normal');
              $(modalEl).find(`.ui.button[key="label.fontWeight"]`).removeClass('active');
            } else {
              _.set(that._pen.option, 'label.fontWeight', 'bold');
              $(modalEl).find(`.ui.button[key="label.fontWeight"]`).addClass('active');
            }
            curPan.draw();
          });
        }

        if (_.has(that._pen.option, 'label.fontStyle')) {
          $(modalEl).find(`.ui.button[key="label.fontStyle"]`).click(() => {
            if (_.get(that._pen.option, 'label.fontStyle') === 'italic') {
              _.set(that._pen.option, 'label.fontStyle', 'normal');
              $(modalEl).find(`.ui.button[key="label.fontStyle"]`).removeClass('active');
            } else {
              _.set(that._pen.option, 'label.fontStyle', 'italic');
              $(modalEl).find(`.ui.button[key="label.fontStyle"]`).addClass('active');
            }
            curPan.draw();
          });
        }

        $(modalEl).find(`.ui.buttons[key="label.align"] .ui.button`).click((e) => {
          $(modalEl).find('.ui.buttons[key="label.align"] .ui.button').removeClass('active');
          let obj = e.target;
          if (e.target.nodeName === 'I') {
            obj = $(e.target).closest('.ui.button');
          }
          $(obj).addClass('active');
          const value = $(obj).attr('data-value');
          _.set(that._pen.option, 'label.align', value);
          curPan.draw();
        });

        $(modalEl).find(`.ui.buttons[key="label.vAlign"] .ui.button`).click((e) => {
          $(modalEl).find('.ui.buttons[key="label.vAlign"] .ui.button').removeClass('active');
          let obj = e.target;
          if (e.target.nodeName === 'I') {
            obj = $(e.target).closest('.ui.button');
          }
          $(obj).addClass('active');
          const value = $(obj).attr('data-value');
          _.set(that._pen.option, 'label.vAlign', value);
          curPan.draw();
        });

        // actions part
        $(modalEl).find('.actions .ui.button.ok').click(() => {
          if (that._pen.option) {
            that.autoSave(that._pen.option, 'update');
          }
          $(modalEl).dialog('close');
        });

        $(modalEl).find('.actions .ui.button.cancel').click(() => {
          that._pen.option = oldOption;
          that._pen.points = oldOption.points;
          curPan.draw();
          that.autoSave(that._pen.option, 'update');
          $(modalEl).dialog('close');
        });

        $(modalEl).find('.ui.tab[data-tab="coordinate-tab"] input.price').on('blur', e => {
          const rIndex = $(e.target).attr('index');
          that._coords[parseInt(rIndex)].price = parseFloat($(e.target).val());
          that.updateCoords(that._coords);
        });

        $(modalEl).find('.ui.tab[data-tab="coordinate-tab"] input.bar').on('change', e => {
          const rIndex = $(e.target).attr('index');
          that._coords[parseInt(rIndex)].bar = parseInt($(e.target).val());
          that.updateCoords(that._coords);
        });

        // range setting
        $(modalEl).find(".ui.range[key='background.opacity']").range({
          min: 0,
          max: 1,
          step: 0.1,
          start: this._pen.option.background && this._pen.option.background.opacity || 0,
          smooth: true,
          onChange: function (value) {
            const rgb = hexToRGB(that._pen.option.background.color);
            if (rgb) {
              const bColor = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', ' + value + ')';
              $(modalEl).find(`.color-wrapper[key="background.color"]`).css('backgroundColor', bColor);
              $(`.tv-floating-toolbar__widget-wrapper.toolbar .tv-floating-toolbar__widget[key="backgroundColor"] .colorpicker-widget`).css('backgroundColor', bColor);
              _.set(that._pen.option, 'background.opacity', value);
              curPan.draw();
            }
          }
        });

        $('.ui-widget-overlay').click(() => {
          $(modalEl).dialog('close');
        });

      },
      close: event => {
        $(event.target).remove();
        that._setting_modal = null;
        colorWrappers.forEach(item => {
          const id = _.replace(_.replace(_.replace(_.clone(item), '[', '_'), '.', '_'), ']', '_');
          $('#' + id).remove();
        });
        this.displayToolbar();
        if (cb) cb();
      }
    });
  }

  _initializeSetting = () => {
    const that = this;
    const modalEl = that._setting_modal;
    const key = this._pen.option.key;
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
      this._pen.option.levels.forEach((option, index) => {
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
      if (_.has(this._pen.option, oKey)) {
        const color = _.get(this._pen.option, oKey);
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
    const curPan = this.getCurrentPan(this._pen.option.containerId);
    const chart = curPan._component;
    const precision = this._chartWidget._options.topToolbar.currency.precision;
    this._pen.option.chartPoints.forEach((point, index) => {
      var bar = 0;
      // var valX = chart.axisX[0].convertPixelToValue(point.x);
      for (var i = 0; i < this._mainPoints.length; i++) {
        if (this._mainPoints[i].x >= point.x) {
          bar = i;
          break;
        }
      }

      if (key == "rect") {
        if (index == 0 || index == 2) {
          points.push({
            price: Math.round(point.y * Math.pow(10, precision)) / Math.pow(10, precision),
            bar: bar
          });
        }
      } else {
        points.push({
          price: Math.round(point.y * Math.pow(10, precision)) / Math.pow(10, precision),
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

  updateCoords = points => {
    const precision = this._chartWidget._options.topToolbar.currency.precision;
    const pan = this.getCurrentPan(this._pen.option.containerId);
    const chart = pan._component;
    var YMAX = chart.axisY2[0].get('viewportMaximum');
    var YMIN = chart.axisY2[0].get('viewportMinimum');
    var results = [];
    points.forEach(pp => {
      if (pp.bar < 0) pp.bar = 0;
      else if (pp.bar > chart.options.data[0].dataPoints.length - 1) pp.bar = chart.options.data[0].dataPoints.length - 1;

      if (pp.price < YMIN) pp.price = YMIN;
      else if (pp.price > YMAX) pp.price = YMAX;

      results.push({
        x: chart.axisX[0].convertValueToPixel(this._mainPoints[pp.bar].x),
        y: Math.round(chart.axisY2[0].convertValueToPixel(parseFloat(pp.price)) * Math.pow(10, precision)) / Math.pow(10, precision)
      });
    });
    // this._pen.option.points = results;
    this._pen.points = results;
    pan.draw();
  }

  getCurrentPan = (containerId) => {
    if (!containerId) return this._pans[0];
    for (var i = 0; i < this._pans.length; i++) {
      const curPan = this._pans[i];
      if (curPan._containerId === containerId) return curPan;
    }
    return null;
  }

  cloneShape = (option) => {
    if (!option) option = this._pen.option;
    if (option) {
      var newOption = this.getShape(option.key, true);
      var points = option.points.map(point => ({
        x: point.x,
        y: point.y + 10
      }));
      newOption.points = _.cloneDeep(points);
      const curPan = this.getCurrentPan(option.containerId);
      curPan.updateShape(newOption);
      this._pen.points = _.cloneDeep(points);
      this._pen.option = _.cloneDeep(newOption);
      this._pen.selected = true;
      this._pen.pointIndex = -1;
      this._pen.objectType = newOption.key;
      this._pen.pointsNum = newOption.pointsNum;
      curPan.draw();
      this.autoSave(newOption, 'update');
      this.rerenderOrderOptions();
      this.displayToolbar(this._pen.selected);
    }
  }

  rerenderOrderOptions = () => {
    $('.tv-floating-toolbar__widget[key="order"] .item.inactive').removeClass('inactive');
    const zIndex = this._pen.option.zIndex;
    if (this._shapes.length > 1) {
      var maxIndex = this._shapes.length - 1;
      if (zIndex >= maxIndex) $('.tv-floating-toolbar__widget[key="order"] .item:nth-child(1)').addClass('inactive');
      if (zIndex <= 0) $('.tv-floating-toolbar__widget[key="order"] .item:nth-child(2)').addClass('inactive');
      if (zIndex >= maxIndex - 1) $('.tv-floating-toolbar__widget[key="order"] .item:nth-child(3)').addClass('inactive');
      if (zIndex <= 1) $('.tv-floating-toolbar__widget[key="order"] .item:nth-child(4)').addClass('inactive');
    } else {
      $('.tv-floating-toolbar__widget[key="order"] .item').addClass('inactive');
    }
  }

  deleteShape = (id, flag = true) => {
    if (!id) {
      if (this._pen && this._pen.option)
        id = this._pen.option.id;
      else {
        return;
      }
    }
    const option = this._shapes.find(o => (o.id === id));
    if (option) {
      const curPan = this.getCurrentPan(option.containerId);
      if (option.extra) {
        this._shapes = this._shapes.filter(shape => (shape.containerId !== curPan._containerId));
        this._chartWidget._options.pan.shape = this._shapes;
        this._render();
      } else {
        var shapes = curPan._shapes.filter(o => (o.id !== id));
        curPan._shapes = shapes;
        this.initPen();
        curPan.draw();
        this._chartWidget._options.pan.shape = this._chartWidget._options.pan.shape.filter(o => (o.id !== id));
      }

      this._shapes = this._chartWidget._options.pan.shape;
      if (flag && this._auto_save && (option && !option.commentFor)) {
        this.autoSave(option, 'delete');
      }
    }
  }

  orderShape = (value, id) => {
    const that = this;
    if (!id) id = this._pen.option.id;
    const oIndex = _.findIndex(this._shapes, o => (o.id === id));
    if (oIndex < 0) return false;
    const option = this._shapes[oIndex];
    var flag = false;
    if (this._shapes.length > 0) {
      var maxIndex = this._shapes.length - 1;
      if (value == 'front') flag = option.zIndex < maxIndex;
      else if (value == 'back') flag = option.zIndex > 0;
      else if (value == 'forward') flag = option.zIndex < maxIndex - 1;
      else if (value == 'backward') flag = option.zIndex > 1;
    }
    if (flag) {
      if (value === "front") {
        const nIndex = _.findIndex(this._shapes, o => (o.zIndex === option.zIndex + 1));
        if (nIndex < 0) return false;
        this._shapes[oIndex].zIndex++;
        this._shapes[nIndex].zIndex--;
      } else if (value === 'back') {
        const pIndex = _.findIndex(this._shapes, o => (parseInt(o.zIndex) === parseInt(option.zIndex) - 1));
        if (pIndex < 0) return false;
        this._shapes[oIndex].zIndex--;
        this._shapes[pIndex].zIndex++;
      } else if (value === 'forward') {
        var newOptions = this._shapes.map(o => {
          if (o.id === option.id) {
            o.zIndex = this._shapes.length - 1;
          } else if (o.zIndex > option.zIndex) {
            o.zIndex--;
          }
          return o;
        })
        this._shapes = _.cloneDeep(newOptions);
      } else {
        var newOptions = this._shapes.map(o => {
          if (o.id === option.id) {
            o.zIndex = 0;
          } else if (o.zIndex < option.zIndex) {
            o.zIndex++;
          }
          return o;
        })
        this._shapes = _.cloneDeep(newOptions);
      }
      if (this._pen.option) {
        this._pen.option.zIndex = option.zIndex;
        this.rerenderOrderOptions();
      }
      this._chartWidget._options.pan.shape = [...this._shapes];

      this._pans.forEach(pan => {
        // if (pan._containerId !== option.containerId) {
        pan._shapes = that._shapes.filter(o => (o.containerId === pan._containerId && !o.extra));
        pan.draw();
        // }
      });
    }
    return flag;
  }

  _addEvent = () => {
    const that = this;
    let ctrlDown = false;
    const ctrlKey = 17,
      cmdKey = 91,
      vKey = 86,
      cKey = 67,
      escKey = 27;
    $(document).keydown(event => {
        if (that._pen.selected) {
          if (event.keyCode === 46) {
            if (that._pen.option) {
              that.deleteShape(that._pen.option.id, true);
            }
          } else if (event.keyCode === escKey) {
            if (that._pen.option) {
              const curPan = that.getCurrentPan(that._pen.option.containerId);
              that.initPen();
              curPan.draw();
            }
          } else if (event.keyCode === cKey && ctrlDown) {
            that._copy_option = that._pen.option;
          }
        }

        if (event.keyCode === vKey && ctrlDown && that._copy_option) {
          that.cloneShape(that._copy_option);
        } else if (event.keyCode === ctrlKey || event.keyCode === cmdKey) {
          ctrlDown = true;
        }
      })
      .keyup(event => {
        if (event.keyCode === ctrlKey || event.keyCode === cmdKey) {
          ctrlDown = false;
        }
      })
  }

  deleteAll = (flag = true) => {
    this.initPen();
    if (this._shapes.length <= 0) {
      return;
    }
    let ids = [];
    let options = [];
    if (this._chartWidget._options.controlling.deleteAll) {
      ids = this._shapes.filter(shape => {
        return shape.kind && shape.kind == 'normal';
      }).map(shape => ({
        id: shape.id
      }));
      $(this._element).find('.ui.rating.analyze').remove();
    } else {
      this._shapes.forEach(shape => {
        if (['trade', 'analysis', 'signal'].indexOf(shape.key) < 0) {
          ids.push(shape.id);
        } else {
          shape.zIndex = options.length;
          options.push(shape);
        }
      });
    }

    this.initPen();
    this._activeShape = null;
    this._chartWidget._options.pan.shape = options;
    this._shapes = this._chartWidget._options.pan.shape;
    // this._pans.forEach(pan => {
    //   pan._shapes = options.filter(shape => (shape.containerId == pan._containerId && !shape.extra));
    //   pan.draw();
    // })
    this._render();
    // const stripLines = this._pans[0]._component.options.axisY2.stripLines.filter(o => o.objectType === 'price');
    // this._pans[0]._component.options.axisY2.stripLines = stripLines;
    // this._pans[0]._component.render();
    // this._pans.forEach(pan => {
    //   if (pan._containerId !== 'primary_chart')
    //     pan.destroy();
    // });
    // this._pans = this._pans.slice(0, 1);
    // this._chartWidget._options.pan.shape = this._shapes;
    // this._pans[0]._shapes = options;
    // this._pans[0]._resize({
    //   width: this._width - 5,
    //   height: this._height
    // });

    $(this._element).find('.indicator-panel').remove();

    // 
    if (this._is_editor && flag) {
      this.autoSave(ids, 'deleteAll');
    }
  }

  autoSave = (shape, verb) => {
    const options = this._chartWidget.options();
    this._chartWidget._options.pan.shape = this._shapes;
    if (this._chartWidget._layout.shapes) {
      this._chartWidget._layout.shapes[options.topToolbar.currency.name] = this._shapes;
    } else {
      this._chartWidget._layout.shapes = {
        [options.topToolbar.currency.name]: this._shapes
      };
    }

    // if (options.controlling.overideEnable) return;
    const shapeData = _.cloneDeep(shape);
    if (verb == 'deleteAll') {
      if (shape.length < 1) {
        return;
      }
    } else if (verb == 'delete') {
      const flag = shape.kind && shape.kind == 'normal';
      if (!flag) {
        return;
      }
    } else if (shape.kind && shape.kind != 'normal') {
      return;
    }
    console.log('auto saved', shape);
    if (this._chartWidget._socket !== null && this._global_autosave_flag) {
      delete shapeData.points;
      delete shapeData.toolbar;
      const data = {
        chartId: options._id,
        symbol: options.topToolbar.currency.name,
        layoutId: this._chartWidget._layout._id,
        shape: shapeData,
        verb,
        editor: options.writerId,
        transactionId: this._chartWidget._socket_transaction_id,
        field: 'shape'
      }

      _.merge(this._chartWidget._layout.shape, {
        [data.symbol]: JSON.parse(JSON.stringify(this._shapes))
      });
      this._chartWidget._socket.emit("rtTfaChart:Updating", data);
    }
  }

  // object tree manage
  openObjectTree = (flag = false, cb = null, checked = []) => {
    this.closeAnalyzeTool(false);
    const that = this;
    this._sel_shapes = [];
    const gOptions = this._chartWidget._options;
    let options = this._shapes;
    // options = options.filter(o => !o.comment || o.ownerId === gOptions.writerId);
    options = options.filter(o => {
      let flag = o.ownerId === gOptions.writerId
      if (o.comment) {
        flag = flag && o.commentFor
      }
      return flag
    })
    options.sort((a, b) => (b.zIndex - a.zIndex));
    let html = `<div class="ui object-tree-modal tfa-modal" style="border: 1px solid #ccc; box-shadow: 2px 2px #ddd;"><div class="normal-object-tree">
    <ul style="padding: 10px; margin-top: 0px">`;
    html += this._makeObjectLists(options, flag, checked);
    html += '</ul></div><div class="actions" style="padding-top: 10px"><button class="ui green right floated button close">Close</button></div></div>';

    $(this._element).append(html);
    $(this._element).find('.object-tree-modal.tfa-modal').dialog({
      modal: true,
      title: 'Object Tree',
      width: 450,
      resizable: false,
      classes: {
        'ui-dialog': 'tfa-chart-object-tree-dialog'
      },
      open: event => {
        const modalEl = event.target;
        that._object_tree = modalEl;
        $(modalEl).find('.option-levels').addClass('collapse').transition('fade');

        that._makeSortable(modalEl);
        that._sortableEvent(modalEl, cb);
        checked.forEach(check => {
          const subs = check.split(':');
          if (subs.length > 1) {
            subs.slice(1).forEach(sIndex => {
              $(modalEl).find(`.ui.checkbox[key="${subs[0]}:${sIndex}"]`).checkbox('set checked');
            })
          } else {
            $(modalEl).find(`.ui.checkbox[key="${subs[0]}"]`).checkbox('set checked');
          }
        })

        $('.ui-widget-overlay').click(() => {
          $(modalEl).dialog('close');
        });
      },
      close: event => {
        // that.hideAllComments();
        $(event.target).find('ul').sortable('destroy');
        $(event.target).remove();
        that._object_tree = null;
      }
    });
  }

  _makeObjectLists = (items, flag) => {
    let html = '';
    const options = this._chartWidget.options();
    items.forEach(option => {
      let accordion = false;
      let content = `<div class="content" style="width: 90%; padding: 7px"><label>${option.title}</label>`;
      if (flag && ['fibonacci', 'fib-extend', 'trade', 'analysis'].indexOf(option.key) >= 0) {
        const levels = option.levels || option.signals;
        const filteredLevels = option.key.indexOf('fib') >= 0 ? levels.filter(o => (o.visible)) : levels;
        if (filteredLevels.length > 0) {

          accordion = true;
          content += '<div class="ui list option-levels collapse">';
          filteredLevels.forEach((level, index) => {
            const myIndex = option.key.indexOf('fib') >= 0 ? level.value : index;
            accordion = true;
            content += `<div class="item sub-level" key="${option.id}:${myIndex}">`;
            content += `<div class="content"><div class="ui checkbox" key="${option.id}:${myIndex}">`;
            content += `<input type="checkbox"/><label>${level.title || level.value + ' Lines'}</label></div></div></div>`;
          });
          content += '</div>';
        }
      }
      content += '</div>';
      const customClass = option.indicator && option.extra ? 'disable-sort-item' : '';
      const checkbox = flag ? `<div class="ui checkbox" key="${option.id}"><input type="checkbox"/><label></label></div>` : '';
      html += `      
        <li class="ui aligned object-tree-item"  option-id="${option.id}" style="text-align: left; text-decoration: none; width: 100%; display: inline-flex; border-bottom: 1px solid #ccc">
          <div class="ui avatar image tv-floating-toolbar__drag js-drag ui-draggable-handle" style="padding-top: 10px">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6 24">
              <path fill-rule="evenodd" d="M0 0h2v2H0V0zm4 0h2v2H4V0zM0 5h2v2H0V5zm4 0h2v2H4V5zm-4 5h2v2H0v-2zm4 0h2v2H4v-2z"></path>
            </svg>
          </div>
          ${checkbox + content}
        
      `;
      if (!options.suggestor) {
        html += `
          <div class="right floated content" style="padding-top: 6px">
            <div class="ui icon buttons fly-buttons active">
              ${accordion ? '<div class="ui button icon active" status="down" key="collapse"><i class="icon small caret down"></i></div>' : ''}
              ${option.extra ? '' : '<div class="ui button icon active" key="lock"><i class="icon small lock"></i></div>'}
              ${option.extra ? '' : '<div class="ui button icon active" key="eye"><i class="icon small eye"></i></div>'}
              <div class="ui button icon active" key="setting"><i class="icon small setting"></i></div>
              <div class="ui button icon active" key="delete"><i class="icon small delete"></i></div>
            </div>
          </div>`;
      } else {
        const color = option.visible ? 'orange' : 'grey';
        html += `
          <div class="right floated content" style="padding-top: 6px">
            <i class="${color} check icon"></i>
          </div>`;
      }
      html += '</li>';

    });
    return html;
  }

  _makeSortable = container => {
    const that = this;
    let changeFlag = false;
    $(container).find('ul').sortable({
      handle: '> .ui-draggable-handle',
      cancel: '.disable-sort-item',
      items: 'li:not(.disable-sort-item)',
      update: function (e, ui) {
        changeFlag = true;
      },
      stop: function (e, ui) {
        const lis = $(container).find('li');
        for (let i = 0; i < lis.length; i++) {
          const id = $(lis[i]).attr('option-id');
          const option = that._shapes.find(o => (o.id === id));
          option.zIndex = lis.length - 1 - i;
        }
        that._pans.forEach(pan => {
          pan._shapes = that._shapes.filter(o => (o.containerId === pan._containerId));
          pan.draw();
        })
        that._chartWidget._options.pan.shape = that._shapes;
        changeFlag = false;
      }
    });
  }

  _sortableEvent = (container, cb) => {
    const that = this;
    // hover over functions
    $(container).find('.option-levels .item').on('pointerenter', e => {
      e.preventDefault();
      var obj = e.target;
      if (!$(e.target).hasClass('item')) {
        obj = $(e.target).closest('.item');
      }
      const id = $(obj).attr('key');
      that.hoveroverShape(id);
    }).on('pointerleave', e => {
      e.preventDefault();
      var obj = e.target;
      if (!$(e.target).hasClass('item')) {
        obj = $(e.target).closest('.item');
      }
      const id = $(obj).attr('key');
      that.hoveroutShape(id);
    });

    $(container).find('li').on('pointerenter', e => {
      var obj = e.target;
      if (e.target.tagName !== 'LI') {
        obj = $(e.target).closest('li');
      }
      const id = $(obj).attr('option-id');
      that.hoveroverShape(id);
    });

    $(container).find('li').on('pointerleave', e => {
      var obj = e.target;
      if (e.target.tagName !== 'LI') {
        obj = $(e.target).closest('li');
      }
      const id = $(obj).attr('option-id');
      that.hoveroutShape(id);
    });

    // toolbars
    $(container).find('.object-tree-item .ui.button').click(e => {
      var obj = e.target;
      if (e.target.tagName === 'I') {
        obj = $(e.target).closest('.ui.button');
      }
      const key = $(obj).attr('key');
      const id = $(obj).closest('li').attr('option-id');
      let option = that._shapes.find(o => (o.id === id));
      const curPan = this.getCurrentPan(option.containerId);
      if (key === 'collapse') {
        const status = $(obj).attr('status');
        const newStatus = status === 'down' ? 'up' : 'down';
        $(obj).attr('status', newStatus);
        $(obj).closest('li').find('.option-levels').transition({
          animation: `slide down`,
          // duration: '1s'
        });
        $(obj).find('i').removeClass(status).addClass(newStatus);
        return;
      } else if (key === 'lock') {
        that.initPen();
        option.isLocked = !option.isLocked;
        if (option.isLocked) $(obj).find('i').removeClass('lock').addClass('unlock');
        else $(obj).find('i').removeClass('unlock').addClass('lock');
        curPan.updateShape(option);
        that.autoSave(option, 'update');
      } else if (key === 'eye') {
        that.initPen();
        option.visible = !option.visible;
        if (!option.visible) $(obj).find('i').removeClass('eye').addClass('low vision');
        else $(obj).find('i').removeClass('low').removeClass('vision').addClass('eye');
        curPan.updateShape(option);
        that.autoSave(option, 'update');
      } else if (key === 'setting') {
        if (option.indicator) {
          const curPan = this.getCurrentPan(option.containerId);
          curPan._indicatorSetting(option.id);
        } else {
          const precision = that._chartWidget._options.topToolbar.currency.precision;
          const seed = Math.pow(10, precision);
          let pen = that.initPen();
          option.hoverover = false;
          pen.option = option;
          pen.points = option.chartPoints.map(point => {
            const xPoint = that._mainPoints.find(mm => (mm.x >= point.x));
            let xIndex = 0;
            if (xPoint) {
              const offsetTime = xPoint.x - point.x;
              const pro = offsetTime / that._interval.intervalVal;
              const offset = pro * curPan._component.get('dataPointWidth');
              xIndex = xPoint.x - offset;
            }
            const xVal = Math.round(curPan._component.axisX[0].convertValueToPixel(xIndex) * seed) / seed;
            return {
              x: xVal,
              y: curPan._component.axisY2[0].convertValueToPixel(point.y)
            }
          });
          pen.objectType = option.key;
          pen.pointsNum = option.pointsNum;
          pen.selected = true;
          this._pen = pen;
          that.settingOption();
        }
      } else if (key === 'delete') {
        $(container).find('ul').sortable('destroy');
        // that.initPen();
        that.deleteShape(id);
        let options = JSON.parse(JSON.stringify(that._shapes));
        options.sort((a, b) => (b.zIndex - a.zIndex));
        const newHtml = that._makeObjectLists(options);
        $(container).find('ul').html(newHtml);
        that._makeSortable(container);
        that._sortableEvent(container);
        $(that._element).find(`.indicator-panel .ui.buttons[key="${id}"]`).remove();
        that.autoSave(option, 'delete');
      }
      curPan.draw();
    });

    $(container).find('.ui.checkbox').checkbox({
      onChecked: function () {
        var oKey = $(this).parent(".ui.checkbox").attr("key");
        let oKeys = oKey.split(':');
        if (oKeys.length < 2) {
          that._sel_shapes.forEach(key => {
            if (key.indexOf(oKey) === 0 && key !== oKeys) {
              $(container).find(`.ui.checkbox[key="${key}"]`).checkbox('set unchecked');
            }
          })
          _.remove(that._sel_shapes, o => (o.indexOf(oKey) === 0));
        }
        that._sel_shapes.push(oKey);
        that._sel_shapes = _.uniq(that._sel_shapes);
      },
      onUnchecked: function () {
        var oKey = $(this).parent(".ui.checkbox").attr("key");
        // let keys = [];
        // that._sel_shapes.forEach(key => {
        //   if (key.indexOf(oKey) === 0 && key !== oKey) {
        //     $(container).find(`.ui.checkbox[key="${key}"]`).checkbox('set unchecked');
        //   } else {
        //     keys.push(key);
        //   }
        // });
        _.remove(that._sel_shapes, o => (o.indexOf(oKey) === 0));
      }
    });

    $(container).find('.actions .button').click((e) => {
      const options = that._shapes;
      if (options.suggestor) {
        const key = $(e.target).attr('key');
        if (key === 'overwrite') {
          that._chartWidget.saveChart(null, () => {
            if (options.callFn.suggest && typeof options.callFn.suggest === 'function') {
              const tradeOption = options.pan.shape.filter(oo => (oo.key === 'trade' && oo.visible));
              if (tradeOption.length > 0) {
                const obj = {
                  entry: tradeOption[0].signals[0].value.y,
                  sl: tradeOption[0].signals[0].value.y + tradeOption[0].signals[1].value.y,
                  tp: tradeOption[0].signals[0].value.y + tradeOption[0].signals[2].value.y
                }
                options.callFn.suggest(obj);
              } else {
                options.callFn.suggest({});
              }
            }
          });
        } else {
          if (that._temp_options) {
            const temp = _.cloneDeep(that._temp_options);
            that._shapePan.setOptions(temp);
          }
        }
        // if (that._setting_modal)
        //   $(that._setting_modal).dialog('close');
      } else {
        if (cb) {
          cb(that._sel_shapes);
        }
        // if (that._setting_modal)
        //   $(that._setting_modal).dialog('close');        
      }
      if (that._object_tree)
        $(that._object_tree).dialog('close');
    });

    $(container).find('.compare-tree li').click((event) => {
      let obj = event.target;
      if (obj.tagName !== 'LI') {
        obj = $(event.target).closest('li');
      }

      const orgOptions = that._chartWidget.options();
      const optionId = $(obj).attr('option-id');
      let option = that._shapes.find(o => (o.id === optionId));
      const curPan = this.getCurrentPan(option.containerId);
      option.visible = !option.visible;
      option.comment = !option.visible;
      if (option.key === 'trade') {
        const candidator = option.ownerId === orgOptions.ownerId ? orgOptions.suggestor : orgOptions.ownerId;
        const candidateOption = that._shapePan._options.filter(oo => {
          if (oo.ownerId === candidator && oo.key === 'trade') return true;
          else return false;
        });
        if (candidateOption.length > 0) {
          candidateOption[0].visible = !option.visible;
          candidateOption[0].comment = option.visible;
          curPan.updateShape(candidateOption[0]);
          $(obj).closest('.tfa-modal').find(`li[option-id="${candidateOption[0].id}"] .check.icon`).removeClass('orange grey').addClass(candidateOption[0].visible ? 'orange' : 'grey');
        }
      }
      curPan.updateShape(option);
      curPan.draw();
      $(obj).find('.check.icon').removeClass('orange grey').addClass(option.visible ? 'orange' : 'grey');
    });
  }

  hoveroverShape = ids => {
    const that = this;
    const id = ids.split(':');
    var option = this._shapes.find(o => (o.id === id[0]));
    if (!option) return;
    option.hoverover = true;
    option.sub_hovers = id.slice(1);
    const containers = this._pans.map(pan => (pan._containerId));
    if (containers.indexOf(option.containerId) >= 0) {
      const curPan = this.getCurrentPan(option.containerId);
      curPan.updateShape(option);
      if (option.extra) {
        const chart = curPan._component;
        if (chart) {
          var chartObject = chart.options.data[chart.options.data.length - 1];
          chartObject.markerType = "circle";
          chartObject.color = "#f1fb54";
          chartObject.lineColor = "#f1fb54";
          chartObject.lineThickness = 2;
          chartObject.markerBorderColor = "#f1fb54";
          chartObject.markerColor = "#f1fb54";
          chart.render();
        }
      } else {
        curPan.draw();
      }
    } else if (option.containerId !== 'primary_chart') {
      let mainShape = option;
      if (!option.extra) {
        mainShape = that._shapes.find(shape => (shape.containerId === option.containerId && shape.extra));
        if (!mainShape) return;
      }
      that.addPan(mainShape);
      that.hoveroverShape(ids);
    }
  }

  hoveroutShape = ids => {
    const that = this;
    const id = ids.split(':');
    var option = this._shapes.find(o => (o.id === id[0]));
    if (!option) return;
    option.hoverover = false;
    option.sub_hovers = [];
    const curPan = this.getCurrentPan(option.containerId);
    if (!curPan) return;
    curPan.updateShape(option);
    if (option.extra) {
      if (option.comment && !option.commentFor) {
        curPan.destroy();
        this._pans = this._pans.filter(pan => (pan._containerId !== curPan._containerId));
        const height = this._pans[0]._height + curPan._height;
        this._pans[0]._resize({
          width: curPan._width,
          height: height
        });
        return;
      }
      const chart = curPan._component;
      if (chart) {
        var chartObject = chart.options.data[chart.options.data.length - 1];
        var color = "yellow";
        var lineThickness = 1;
        if (option.key.indexOf("ma") >= 0 && option.key != "macd") {
          color = option.mainLine.lineColor;
          lineThickness = option.mainLine.lineThickness;
        } else if (option.key.indexOf("ichimoku") >= 0) {
          color = option.chikou.lineColor;
          lineThickness = option.chikou.lineThickness;
        } else if (option.key == "stochastic") {
          color = option.kLine.lineColor;
          lineThickness = option.kLine.lineThickness;
        } else if (option.key == "macd") {
          color = option.macd.color;
          lineThickness = option.macd.lineThickness;
        }
        chartObject.markerType = 'none';
        chartObject.color = color;
        chartObject.lineColor = color;
        chartObject.lineThickness = lineThickness;
        chartObject.markerBorderColor = color;
        chartObject.markerColor = color;
        chart.render();
      }
    } else {
      curPan.draw();
    }
  }

  // analysis tools

  _drawAnalyzeTool = (option) => {
    const that = this;
    const wrapper = document.createElement('div');
    $(wrapper).addClass(`trade-handler ${option.key}`).css('left', '250px');
    let columns = option.signals.length;
    let width = option.signals.length > 7 ? 'nine' : 'eight';
    if (option.key === 'trade') {
      if (option.advanced) {
        width = 'eight';
        columns = 8;
      } else {
        width = 'three';
        columns = 3;
      }
    } else {
      columns = 9;
      width = 'nine';
    }

    let html = `<div style="text-align: left; position: relative; display: inline-flex; padding: 5px;height: ${option.key === 'trade' ? '35px' : '30px'}; width: ${40 * columns}px; background: white;" class="ui gripped"></div>`;

    if (columns < 4) {
      html += `<div class="actions">
        <button class="ui compact icon mini button circular inverted green"><i class="save large icon"></i></button>
        <button class="ui compact icon mini button circular inverted red"><i class="close large icon"></i></button>
      </div>`;
      html += `<div style="text-align: center;margin-top: -2px; padding: 5px;height: 35px; width: ${40 * columns}px; background: white;">
          <div class="ui buttons mini sell-buy">
            <button class="ui button ${!option.selFlag ? 'red basic' : ''}" key="buy">Buy</button>
            <button class="ui button ${option.selFlag ? 'green basic' : ''}" key="sell">Sell</button>
          </div>
        </div>
      `;

      html += `<div style="text-align: center; padding: 5px;height: 35px; width: ${40 * columns}px; background: white;">
        <div class="ui buttons mini advance-basic">
          <button class="ui button ${!option.advanced ? 'teal basic' : ''}" key="basic">Basic</button>
          <button class="ui button ${option.advanced ? 'orange basic' : ''}" key="advanced">Adv</button>
        </div> 
      </div>`;
    } else {
      if (option.key === 'trade') {
        html += `<div style="background: white; margin-top: -2px; padding: 5px; text-align: center;">
        <div class="ui buttons mini sell-buy">
          <button class="ui button ${!option.selFlag ? 'red basic' : ''}" key="buy">Buy</button>
          <button class="ui button ${option.selFlag ? 'green basic' : ''}" key="sell">Sell</button>
        </div>
        <div class="ui buttons mini advance-basic">
          <button class="ui button ${!option.advanced ? 'teal basic' : ''}" key="basic">Basic</button>
          <button class="ui button ${option.advanced ? 'orange basic' : ''}" key="advanced">Adv</button>
        </div>`;
      }
      html += `<div class="actions">
        <button class="ui compact icon mini button circular inverted green"><i class="save large icon"></i></button>
        <button class="ui compact icon mini button circular inverted red"><i class="close large icon"></i></button>
      </div></div>`;
    }
    html += `<div style="width: ${40 * columns}px; height: ${columns < 4 ? 'calc(100% - 70px)' : 'calc(100% - 40px)'}; margin: 0px;" class="ui ${width} column grid handler-wrapper">`;
    html += this.makeTradeColumn(option);
    html += `</div>`;
    $(wrapper).html(html);
    $(wrapper).appendTo($(this._chartWidget._element).find('.my-pusher'));

    const curPan = this._pans[0];
    $(wrapper).find('.actions .ui.button.green').click(() => {
      let option = that.closeAnalyzeTool(false);
      if (!option) option = this._shapes.find(shape => (shape.key === 'analysis' && shape.ownerId === this._chartWidget._options.writerId));

      if (option) {
        var res = option.signals.map(o => ({
          value: o.value.y,
          rate: o.rate
        }));

        that._chartWidget._options.analyze.type = option.key;
        that._chartWidget._options.analyze.values = res;
        if (that._chartWidget._options.controlling.narrowDisable) {
          if (that._chartWidget._options.callFn.toggleChat) {
            that._chartWidget._options.callFn.toggleChat(true, option)
          }
        } else {
          that._chartWidget._chat.toggleChat(true, option);
        }
      }
    });

    $(wrapper).find('.actions .ui.button.red').click(() => {
      const stripeLines = curPan._component.axisY2[0].get('stripLines');
      const tempStripLines = _.filter(stripeLines, o => (o.options.objectType !== 'trade'));
      curPan._component.axisY2[0].set("stripLines", tempStripLines);
      that.closeAnalyzeTool(false);
    });

    $(wrapper).find('.ui.gripped').on('pointerdown', (e) => {
      $(document).on('mousemove', event => {
        $(wrapper).position({
          my: "center",
          of: event,
          collision: "fit",
          within: that._element
        });
      })
    });

    $(wrapper).on('pointerup', () => {
      $(document).off('mousemove');
    });

    $(wrapper).find('.advance-basic .button').click((e) => {
      const key = $(e.target).attr('key');
      const flag = key === 'advanced';
      var pen = that._pen;
      if (!pen.option) pen.option = that.getShape('trade');
      if (pen.option) {
        pen.option.advanced = flag
        curPan.updateShape(pen.option);
        curPan.draw();
        $(wrapper).remove();
        that._drawAnalyzeTool(pen.option);
        that.displayAnalyzeTool(option.key, true);
        that._chartWidget._chat.advanced(flag);
        that.autoSave(pen.option, 'update');
      }
    });

    $(wrapper).find('.sell-buy .button').click((e) => {
      var pen = that._pen;
      const key = $(e.target).attr('key');
      const flag = key === 'sell';
      if (!pen.option) pen.option = that.getShape('trade');
      if (pen.option) {
        pen.option.selFlag = flag;
        for (let i = 0; i < 7; i++) {
          pen.option.signals[i].value = {
            x: 0,
            y: 0
          };
        }
        pen.option.selected = -1;
        curPan.updateShape(pen.option);
        curPan.draw();
        $(wrapper).remove();
        that._drawAnalyzeTool(pen.option);
        that.displayAnalyzeTool(option.key, true);
        that._chartWidget._chat.changeStatus(flag);
      }
    });

  }

  updateTradeStatus = (flag) => {
    $(this._chartWidget._element).find('.trade-handler .ui.checkbox.selflag').checkbox(flag ? 'set checked' : 'set unchecked');
    $(this._chartWidget._element).find('.trade-handler .ui.checkbox.selflag label').html(flag ? 'SELL' : 'BUY');
  }

  makeTradeColumn = (option) => {
    let html = '';
    if (option && option.signals.length > 0) {
      option.signals.forEach((signal, index) => {
        if (option.key === 'trade' && !option.advanced && index > 2) return;
        html += `<div key="${index}" class="column normal" style="background: ${signal.color}">
          <div class="close-wrap"><i class="icon close"></i></div>
          <div class="handler"><div class="title-pane ng-binding">${signal.title}</div></div>`;
        // if (option.key === 'analysis') {
        html += `<div data-rating="0" key="${index}" class="ui star rating"><i class="icon"></i><i class="icon"></i><i class="icon"></i></div>`;
        // }
        html += `</div>`;
      })
    }
    return html;
  }

  displayAnalyzeTool = (key, open) => {
    const that = this;
    if (open) {
      const orgOptions = that._chartWidget.options();
      const writerId = parseInt(orgOptions.writerId);
      // const ownerId = parseInt(orgOptions.ownerId);
      let option = null;
      for (let i = 0; i < this._shapes.length; i++) {
        if (this._shapes[i].key === key) {
          if (this._shapes[i].ownerId && this._shapes[i].ownerId === writerId) {
            option = this._shapes[i];
            break;
          }
        }
      }
      if (!option) {
        option = this.getShape(key, true);
        option.ownerId = orgOptions.writerId;
      }
      option.containerId = 'primary_chart';
      const curPan = this._pans[0];

      if (_.has(orgOptions, 'analyze') && key === 'analyze') {
        for (let i = 0; i < 8; i++) {
          if (orgOptions.analyze.values[i].value > 0) option.signals[i].value.y = orgOptions.analyze.values[i].value;
        }
      }
      that._analyzeOption = _.cloneDeep(option);
      // option = this._initSignals(option);
      $('.trade-handler .ui.rating')
        .rating({
          initialRating: 0,
          maxRating: 3,
          onRate: function (value) {
            var keyIndex = parseInt($(this).attr("key"));
            option.signals[keyIndex].rate = value;
            that._pen.option = option;
            curPan.updateShape(option);
            that.autoSave(option, 'update');
            if (option.signals[keyIndex].visible)
              curPan.draw();
          }
        });

      $('.trade-handler .column.normal').removeClass('active').removeClass('inactive');
      let points = [];
      option.signals.forEach((oo, index) => {
        $(".trade-handler .ui.rating[key='" + index + "']")
          .rating('set rating', oo.rate);
        if (!oo.visible)
          $(".trade-handler .column.normal[key='" + index + "']").addClass('inactive');
        if (index === option.selected)
          $(".trade-handler .column.normal[key='" + index + "']").addClass('active');

        points.push({
          x: curPan._component.axisX[0].convertValueToPixel(oo.value.x),
          y: curPan._component.axisY2[0].convertValueToPixel(oo.value.y)
        })
      });

      option.points = points;
      curPan.updateShape(option);
      this._pen.points = points;
      this._pen.option = option;
      this._pen.pointsNum = 9;
      this._pen.objectType = key;

      $('.trade-handler .column.normal').click(e => {
        if ((e.target.tagName === 'I' && $(e.target.parentElement).hasClass('close-wrap')) || $(e.target).hasClass('close-wrap')) {
          var sobj = $(e.target).closest('.column');
          var keyIndex = $(sobj).attr('key');
          $(sobj).removeClass('active').addClass('inactive');
          that._pen.option.signals[parseInt(keyIndex)].visible = false;
          that._pen.option.select = -1;
          that._pen.finished = false;
          that._pen.enabled = false;
          that._pen.pointIndex = -1;
          that._pen.dragged = false;
          curPan.draw();
          return;
        }
        if (e.target.tagName === 'I') return;
        let obj = e.target;
        if (!$(obj).hasClass('.column')) {
          obj = $(e.target).closest('.column.normal');
        }

        if (!that._pen.finished && that._pen.enabled) {
          e.preventDefault();
          return false;
        }

        if (that._pans && that._pans.length > 0) {
          const mainChart = that._pans[0]._component;
          mainChart.options.axisY2.crosshair.enabled = false;
          mainChart.render();
        }
        that._pen.pointsNum = 8;
        that._pen.objectType = key;
        if (!that._pen.option) {
          that._pen.option = that.getShape(option.key);
          // return that.displayAnalyzeTool('analysis', true);
        } else {
          $(".trade-handler .column.normal.active").removeClass("active");
        }

        var keyIndex = $(obj).attr('key');
        that._pen.option.signals[parseInt(keyIndex)].visible = true;

        if (that._pen.option.signals[parseInt(keyIndex)].visible) {
          $(obj).addClass('active').removeClass('inactive');
          that._pen.option.selected = parseInt(keyIndex);
          that._pen.option.active = true;
          that._pen.finished = false;
          that._pen.enabled = true;
          that._pen.pointIndex = parseInt(keyIndex);
          that._pen.dragged = true;
        } else {
          return;
        }
      });
    }
  }

  _initSignals = option => {
    var signals = option.signals;
    if (option.key === 'analysis') {
      option.signals[2].visible = (signals[0].value.y > 0 && signals[1].value.y > 0);
      option.signals[3].visible = (signals[0].value.y > 0);
      option.signals[5].visible = (signals[7].value.y > 0 && signals[6].value.y > 0);
      option.signals[4].visible = (signals[7].value.y > 0);
    }
    return option;
  }

  closeAnalyzeTool = cancelFlag => {
    let option = _.cloneDeep(this._pen.option);
    const curPan = this._pans[0];
    this.initPen();
    if (cancelFlag) {
      option = this._analyzeOption;
      curPan.updateShape(this._analyzeOption);
      this.autoSave(option, 'update');
    }
    $('.my-pusher .trade-handler').remove();
    curPan.draw();
    return option;
  }

  /**
   * drawing crosshair lines when hoverover comments
   */
  drawTimeLines = xTime => {
    if (this._pans.length <= 0 || !this._pans[0]._component) return;
    if (this._pans[0]._height <= 0) return;
    const now = new Date(xTime).getTime();
    var yval = 0;
    var curPoint = this._mainPoints.find(pp => {
      return pp.x.getTime() >= now;
    });

    if (!curPoint || curPoint.y.length <= 0) return;
    yval = Math.max(curPoint.y[0], curPoint.y[3]);
    var xCrossHairs = this._pans[0]._component.options.axisX.stripLines;
    var yCrossHairs = this._pans[0]._component.options.axisY2.stripLines;
    var xIndex = -1;
    var yIndex = -1;

    for (var i = xCrossHairs.length - 1; i >= 0; i--) {
      if (xCrossHairs[i].objectType == "comment") {
        xIndex = i;
        break;
      }
    }

    for (var i = yCrossHairs.length - 1; i >= 0; i--) {
      if (yCrossHairs[i].objectType == "comment") {
        yIndex = i;
        break;
      }
    }

    var xStrip = {
      objectType: 'comment',
      color: 'yellow',
      showOnTop: true,
      labelFontColor: "transparent",
      labelAlign: 'near',
      labelBackgroundColor: 'transparent',
      orgColor: '#ff0000',
      orgFontColor: 'white',
      labelFontSize: 12,
      lineDashType: 'dot',
      labelPlacement: "outside",
      value: curPoint.x,
      opacity: 1
    };

    var yStrip = {
      objectType: 'comment',
      color: 'yellow',
      showOnTop: true,
      labelFontColor: "transparent",
      labelAlign: 'near',
      labelBackgroundColor: 'transparent',
      orgColor: '#ff0000',
      orgFontColor: 'white',
      labelFontSize: 12,
      lineDashType: 'dot',
      labelPlacement: "outside",
      value: yval,
      opacity: 1
    };

    if (xIndex >= 0) {
      this._pans[0]._component.options.axisX.stripLines[xIndex] = xStrip;
    } else {
      this._pans[0]._component.options.axisX.stripLines.push(xStrip);
    }

    if (yIndex >= 0) {
      this._pans[0]._component.options.axisY2.stripLines[yIndex] = yStrip;
    } else {
      this._pans[0]._component.options.axisY2.stripLines.push(yStrip);
    }
    this._pans[0]._component.render();
  }

  /**
   * hide crosshair lines when hoverour comments
   */
  hideTimeLines = () => {
    if (this._pans.length <= 0 || !this._pans[0]._component) return;
    const yCrosshairs = this._pans[0]._component.options.axisY2.stripLines;
    this._pans[0]._component.options.axisY2.stripLines = yCrosshairs.filter(xx => (xx.objectType !== 'comment'));
    const xCrosshairs = this._pans[0]._component.options.axisX.stripLines;
    this._pans[0]._component.options.axisX.stripLines = xCrosshairs.filter(xx => (xx.objectType !== 'comment'));
    this._pans[0]._component.render();
  }

  proceedUpdateFromSocket = data => {
    const that = this;
    const options = this._chartWidget.options();
    if (this._chartWidget._layout_id === data.layoutId && options.topToolbar.currency.name == data.symbol) {
      // this._chartWidget.renderShapes(data.shapes);
      if (data.verb == 'deleteAll') {
        const deletedIds = data.shape.map(item => (item.id));
        const shapes = this._shapes.filter(shape => (deletedIds.indexOf(shape.id) < 0));
        this.initPen();
        if (shapes.length > 0) {
          this.setShapes(shapes);
        } else {
          this.deleteAll(false);
        }
      } else if (data.verb !== 'delete') {
        this.initPen();
        const option = data.shape;
        if (this._activeShape && option.id == this._activeShape.id) {
          this._activeShape = null;
        }
        if (option.extra) {
          const panIndex = that._pans.findIndex(pan => (pan._containerId === option.containerId && pan._mainShape.id === option.id));
          if (panIndex >= 0) {
            const curPan = that.getCurrentPan(option.containerId);
            curPan.updateShape(option);
            curPan.draw();
          } else {
            const shapeIndex = that._shapes.findIndex(shape => (shape.id === option.id));
            if (shapeIndex >= 0) {
              that._shapes[shapeIndex] = option;
            } else {
              that._shapes.push(option);
            }
            that._chartWidget._options.pan.shape = that._shapes;
          }
        } else {
          const curPan = that.getCurrentPan(option.containerId);
          if (!option.points && option.chartPoints) {
            option.points = option.chartPoints.map(point => ({
              x: curPan._component.axisX[0].convertValueToPixel(point.x),
              y: curPan._component.axisY2[0].convertValueToPixel(point.y)
            }));
          }
          curPan.updateShape(option);
          curPan.draw();
        }
      } else {
        const option = that._shapes.find(o => (o.id === data.shape.id));
        if (option) {
          that.deleteShape(option.id, false);
        }
      }
    }
  }

  hideAllComments = () => {
    const that = this;
    this._pans.forEach(pan => {
      const shapes = that._shapes.filter(o => (o.containerId === pan._containerId)).map(o => {
        o.comment = false;
        o.commentFor = false;
        return o;
      });


      pan._shapes = shapes;
      pan.draw();
    });

    this._shapes = this._shapes.map(o => {
      o.comment = false;
      o.commentFor = false;
      return o;
    });

    this._chartWidget._options.pan.shapes = this._shapes;
  }

  setShapes = (newShapes) => {
    // const options = this._chartWidget._options;
    // this._chartWidget._options.pan.shape = [...newShapes];
    // const orgShapes = JSON.parse(JSON.stringify(this._shapes));

    this.initPen();
    this._activeShape = null;
    const that = this;
    // orgShapes.filter(o => (o.extra && !o.comment)).forEach(shape => {
    //   if (newShapes.findIndex(o => (o.id === shape.id)) < 0) {
    //     that.deleteShape(shape.id, false);
    //   }
    // });

    // orgShapes.filter(o => (o.indicator && !o.comment)).forEach(shape => {
    //   if (newShapes.findIndex(o => (o.id === shape.id)) < 0) {
    //     $(`.indicator-panel .ui.buttons[key="${shape.id}"]`).remove();
    //   }
    // });

    this._shapes = [];
    newShapes.forEach(shape => {
      if (['trade', 'analysis'].indexOf(shape.key) >= 0) {
        shape.containerId = 'primary_chart';
      }
      if (shape.indicator && shape.extra) {
        const sameIndicatorInd = this._shapes.findIndex(item => (shape.key == item.key));
        if (sameIndicatorInd > -1) {
          return;
        }
      }
      this._shapes.push(shape);
    });

    // this._shapes = newShapes.map(shape => {
    //   if (['trade', 'analysis'].indexOf(shape.key) >= 0) {
    //     shape.containerId = 'primary_chart';
    //   }
    //   return shape;
    // });
    // const shapes = _.groupBy(newShapes, 'containerId');
    // const containers = Object.keys(shapes);

    // containers.forEach(containerId => {
    //   let curPan = that._pans.find((pan) => (pan._containerId === containerId));
    //   if (curPan) {
    //     curPan._shapes = shapes[containerId].filter(o => (!o.extra));
    //     curPan.draw();
    //   } else {
    //     const shape = shapes[containerId].find(o => (o.extra && !o.comment));
    //     if (shape) {
    //       // curPan = new ChartPan({
    //       //   parent: that,
    //       //   containerId: containerId,
    //       //   width: that._width,
    //       //   height: that._height * 1 / 4,
    //       //   precision: options.topToolbar.currency.precision,
    //       //   mainShape: shape
    //       // });
    //       // that._pans.push(curPan);
    //       that.addPan(shape);
    //       that._pans[that._pans.length - 1]._shapes = shapes[containerId];
    //       that._render();
    //     }
    //   }
    // });

    // const pShapes = shapes['primary_chart'] || [];
    // let primaryPan = that._pans.find((pan) => (pan._containerId === 'primary_chart'));
    // if (primaryPan) {
    //   primaryPan._shapes = pShapes;
    //   primaryPan.draw();
    // }

    this._chartWidget._options.pan.shape = this._shapes;
    this._render();
  }

  hoveringShapes = (newShapes) => {
    const shapes = _.groupBy(newShapes, 'containerId');
    this._pans.forEach(pan => {
      let conShapes = shapes[pan._containerId];
      if (conShapes && conShapes.length > 0) {
        if (pan._containerId == 'primary_chart') {
          pan._shapes = conShapes;
        } else {
          conShapes = conShapes.filter(shape => (!shape.extra && !shape.indicator));
          if (conShapes.length > 0) {
            pan._shapes = conShapes;
          }
        }
      } else {
        pan._shapes = [];
      }
      pan.draw();
    });
  }

  setRange = (range) => {
    if (range) {
      this._defaultRangeFlag = true;
      if (range.x && range.x[0]) {
        this._viewport.x = range.x
      }

      if (range.y && range.y[0]) {
        this._viewport.y = range.y
      }

      const interval = this._chartWidget._options.topToolbar.interval;
      const intervalVal = interval ? interval.intervalVal : 3600;
      var visualNum = moment(this._viewport.x[1]).diff(this._viewport.x[0], 'seconds') / intervalVal;
      var stickWidth = Math.round(parseInt(this._width) / (visualNum * 2.5));
      if (stickWidth <= 0) stickWidth = 1;
      else if (stickWidth >= 30) stickWidth = 30;
      this._option.dataPointWidth = stickWidth;
      this._orgRange = [this._viewport.x[0], this._viewport.x[1]];
      this._chart.navigator.slider.set("minimum", this._viewport.x[0], false);
      this._chart.navigator.slider.set("maximum", this._viewport.x[1], true);
      this._pans.forEach(pan => {
        pan._component.set("dataPointWidth", stickWidth);
        pan.draw();
      });
    }
  }

  getRange = () => {
    return {
      x: [this._pans[0]._component.axisX[0].get('viewportMinimum'), this._pans[0]._component.axisX[0].get('viewportMaximum')],
      y: [this._pans[0]._component.axisY2[0].get('viewportMinimum'), this._pans[0]._component.axisY2[0].get('viewportMaximum')]
    }
  }

  updatePrice = (newPrice) => {
    // console.log('close value', newPrice);
    this._finalPrice = Number(newPrice);
    this.printPrice();
    // this._feedTimerInit();
    setTimeout(this._feedTimerInit, 1000);
  }

  shapeDrawingFinished = (shape) => {
    // if (this._chartWidget._options.controlling.overideEnable) {
    if (this._chartWidget._options.callFn.shapeDrawn) {
      this._chartWidget._options.callFn.shapeDrawn(shape)
    }
    // }
  }

  shapeSelected = (shape) => {
    if (this._chartWidget._options.callFn.shapeSelected) {
      this._chartWidget._options.callFn.shapeSelected(shape)
    }
  }

  activePan = (flag) => {
    this._interactivity = flag;
    this._chart.navigator.set('enabled', flag);
  }

  updateStripeLines = (containerId, spLines) => {
    const chartIndex = this._pans.findIndex(pan => (pan._containerId == containerId));
    if (chartIndex > -1) {
      this._chart.charts[chartIndex].options.axisY2.stripLines = spLines;
      this._chart.render();
    }
  }
}