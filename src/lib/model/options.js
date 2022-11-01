import * as _ from 'lodash';
const maOption = {
  key: 'ma',
  title: "Moving Average Indicator",
  templateName: 'ma',
  len: 9,
  source: 'close',
  offset: 0,
  mainLine: {
    "lineColor": "#3a85ad",
    "backgroundColor": "#3a85ad",
    "lineThickness": 2,
    "lineDashType": "solid",
    "visible": true
  },
  precision: 0,
  scale: 'left',
  visible: true,
  extra: false,
  indicator: true,
  chartIndex: 0,
  curIndex: 0,
  zIndex: 0,
  priceIndex: 0,
  priceOffset: 0
};

const emaOption = {
  key: 'ema',
  title: "Moving Average Exponential",
  templateName: 'ma',
  len: 34,
  source: 'close',
  offset: 0,
  mainLine: {
    "lineColor": "#3a85ad",
    "backgroundColor": "#3a85ad",
    "lineThickness": 2,
    "lineDashType": "solid",
    "visible": true
  },
  precision: 0,
  scale: 'left',
  visible: true,
  extra: false,
  indicator: true,
  chartIndex: 0,
  curIndex: 0,
  zIndex: 0,
  priceIndex: 0,
  priceOffset: 0
};

const wmaOption = {
  key: 'wma',
  title: "Moving Average Weighted",
  templateName: 'ma',
  len: 34,
  source: 'close',
  offset: 0,
  mainLine: {
    "lineColor": "#3a85ad",
    "backgroundColor": "#3a85ad",
    "lineThickness": 2,
    "lineDashType": "solid",
    "visible": true
  },
  precision: 0,
  scale: 'left',
  visible: true,
  extra: false,
  indicator: true,
  chartIndex: 0,
  curIndex: 0,
  zIndex: 0,
  priceIndex: 0,
  priceOffset: 0
};

const macdOption = {
  key: 'macd',
  title: "MACD Indicator",
  templateName: 'macd',
  fast_length: 12,
  slow_length: 26,
  signal_length: 9,
  sma_source: true,
  sma_signal: true,
  source: 'close',
  histogram: { visible: true, color: ['#26A69A', '#B2DFDB', '#FFCDD2', '#EF5350'], type: 'column' },
  macd: { visible: true, color: '#0094ff', type: 'spline', lineThickness: 1 },
  signal: { visible: true, color: '#ff6a00', type: 'spline', lineThickness: 1 },
  scale: 'left',
  precision: 0,
  visible: true,
  extra: true,
  indicator: true,
  chartIndex: 0,
  curIndex: 0,
  zIndex: 0,
  priceIndex: 0,
  priceOffset: 0
};

const rsiOption = {
  key: 'rsi',
  templateName: 'rsi',
  title: "RSI Indicator",
  len: 12,
  source: 'close',
  rsi: { "visible": true, "lineColor": "#8e1599", "lineThickness": 3, "lineDashType": "solid" },
  upperBand: { "visible": true, "lineColor": "#c0c0c0", "lineThickness": 1, "lineDashType": "dash", "value": 70 },
  lowBand: { "visible": true, "lineColor": "#c0c0c0", "lineThickness": 1, "lineDashType": "dash", "value": 30 },
  lagging: { "visible": true, "color": "#9915ff", "opacity": 0.1 },
  scale: 'left',
  precision: 0,
  visible: true,
  extra: true,
  indicator: true,
  chartIndex: 0,
  curIndex: 0,
  zIndex: 0,
  priceIndex: 0,
  priceOffset: 0
};

const atrOption = {
  key: 'atr',
  title: "ATR Indicator",
  templateName: 'atr',
  len: 14,
  source: 'sma',
  signal: { visible: true, color: '#ff6a00', type: 'spline', lineThickness: 1 },
  scale: 'left',
  precision: 0,
  visible: true,
  extra: true,
  indicator: true,
  chartIndex: 0,
  curIndex: 0,
  zIndex: 0,
  priceIndex: 0,
  priceOffset: 0
};

const ichimokuOption = {
  key: 'ichimoku2c',
  templateName: 'ichimoku',
  title: "Ichimoku Indicator",
  conversionPeriod: 9,
  basePeriod: 26,
  laggingSpanPeriod: 52,
  displacement: 26,
  scale: 'left',
  tenkan: {
    lineColor: '#ff0000',
    lineThickness: 1,
    lineType: 'line',
    visible: true
  },
  kijun: {
    lineColor: '#0000ff',
    lineThickness: 1,
    lineType: 'line',
    visible: true
  },
  senkouA: {
    lineColor: '#800080',
    lineThickness: 1,
    lineType: 'line',
    visible: true
  },
  senkouB: {
    lineColor: '#008000',
    lineThickness: 1,
    lineType: 'line',
    visible: true
  },
  mainLine: {
    lineColor: '#008080',
    lineThickness: 1,
    lineType: 'line',
    visible: true
  },
  lagging: {
    color: '#008000',
    visible: true,
    opacity: 0.2
  },
  visible: true,
  extra: false,
  indicator: true,
  chartIndex: 0,
  curIndex: 0,
  zIndex: 0,
  priceIndex: 0,
  priceOffset: 0
};

const stochasticOption = {
  key: 'stochastic',
  title: "Stochastic Indicator",
  templateName: 'stochastic',
  kPeriod: 14,
  dPeriod: 3,
  smooth: 3,
  objId: '',
  kLine: {
    lineColor: '#0094ff',
    lineThickness: 2,
    visible: true
  },
  dLine: {
    lineColor: '#ff6a00',
    lineThickness: 2,
    visible: true
  },
  upperBand: {
    lineColor: '#606060',
    lineThickness: 1,
    lineDashType: 'dash',
    visible: true,
    value: 80
  },
  lowBand: {
    lineColor: '#606060',
    lineThickness: 1,
    lineDashType: 'dash',
    visible: true,
    value: 20
  },
  lagging: {
    color: '#9915ff',
    visible: true,
    opacity: 0.2
  },
  scale: 'left',
  visible: true,
  extra: true,
  indicator: true,
  chartIndex: 0,
  curIndex: 0,
  zIndex: 0,
  priceIndex: 0,
  priceOffset: 0
};

const hRayOption = {
  key: 'h-ray',
  title: 'Horizontal Ray',
  templateName: 'line-setting',
  pointsNum: 1,
  mainLine: {
    "lineColor": "rgb(159, 197, 232)",
    "backgroundColor": "rgba(34, 34, 209, 0.43)",
    "lineThickness": "2",
    "lineDashType": "solid",
    "visible": true
  },
  background: {
    "visible": true,
    "color": "#ff0000"
  },
  levelLine: {
    lineThickness: 1,
    lineDashType: 'solid',
  },
  label: {
    "visible": false,
    "indexVisible": true,
    "text": "",
    "align": "right",
    "vAlign": "top",
    "fontStyle": "normal",
    "fontWeight": "bold",
    "fontSize": "16",
    "fontFamily": "calibri",
    "color": "rgb(255, 0, 0)",
    "extra": null
  },
  points: [],
  visible: true,
  hoverover: false,
  extra: false,
  indicator: false,
  chartIndex: 0,
  curIndex: 0,
  isLocked: false,
  toolbar: {
    template: { inited: true, active: false, expanded: true },
    lineColor: { inited: true, active: false, expanded: true },
    backgroundColor: { inited: false, active: false, expanded: false },
    lineThickness: { inited: true, active: false, expanded: true },
    lineStyle: { inited: true, active: false, expanded: true },
    setting: { inited: false, active: false, expanded: true },
    order: { inited: false, active: false, expanded: true },
    clone: { inited: false, active: false, expanded: true },
    lock: { inited: false, active: false, expanded: true },
    endArrow: { inited: false, active: false, expanded: false },
    startArrow: { inited: false, active: false, expanded: false },
    eye: { inited: false, active: false, expanded: true },
    delete: { inited: false, active: false, expanded: true }
  },
  zIndex: 0,
  priceIndex: 0,
  priceOffset: 0
};

const arrowOption = {
  key: 'arrow',
  title: 'Arrow',
  templateName: 'arrow-setting',
  pointsNum: 2,
  mainLine: {
    "lineColor": "rgb(159, 197, 232)",
    "backgroundColor": "rgba(34, 34, 209, 0.43)",
    "lineThickness": 3,
    "lineDashType": "solid",
    "visible": true
  },
  background: {
    "visible": true,
    "color": "#ff0000"
  },
  levelLine: {
    lineThickness: 1,
    lineDashType: 'solid',
  },
  points: [],
  start: {
    arrow: false,
    extend: false
  },
  end: {
    arrow: true,
    extend: false
  },
  label: {
    "visible": true,
    "indexVisible": true,
    "text": "",
    "align": "left",
    "vAlign": "top",
    "fontStyle": "normal",
    "fontWeight": "normal",
    "fontSize": 12,
    "fontFamily": "calibri",
    "color": "#02e3f7",
    "extra": {
      "price": false,
      "bars": false,
      "date": false,
      "distance": false,
      "angle": false
    }
  },
  visible: true,
  hoverover: false,
  extra: false,
  indicator: false,
  chartIndex: 0,
  curIndex: 0,
  isLocked: false,
  toolbar: {
    template: { inited: true, active: false, expanded: true },
    lineColor: { inited: true, active: false, expanded: true },
    backgroundColor: { inited: false, active: false, expanded: false },
    lineThickness: { inited: true, active: false, expanded: true },
    lineStyle: { inited: true, active: false, expanded: true },
    startArrow: { inited: true, active: false, expanded: true },
    endArrow: { inited: true, active: false, expanded: true },
    setting: { inited: false, active: false, expanded: true },
    order: { inited: false, active: false, expanded: true },
    clone: { inited: false, active: false, expanded: true },
    lock: { inited: false, active: false, expanded: true },
    eye: { inited: false, active: false, expanded: true },
    delete: { inited: false, active: false, expanded: true }
  },
  zIndex: 0,
  priceIndex: 0,
  priceOffset: 0
};

const tradeLineOption = {
  key: 't-line',
  title: 'Trade Line',
  templateName: 'arrow-setting',
  pointsNum: 2,
  mainLine: {
    "lineColor": "rgb(159, 197, 232)",
    "backgroundColor": "rgba(34, 34, 209, 0.43)",
    "lineThickness": "3",
    "lineDashType": "solid",
    "visible": true
  },
  background: {
    "visible": true,
    "color": "#ff0000"
  },
  levelLine: {
    lineThickness: 1,
    lineDashType: 'solid',
  },
  points: [],
  start: {
    arrow: false,
    extend: false
  },
  end: {
    arrow: false,
    extend: false
  },
  label: {
    "visible": true,
    "indexVisible": true,
    "text": "",
    "align": "left",
    "vAlign": "top",
    "fontStyle": "normal",
    "fontWeight": "normal",
    "fontSize": 12,
    "fontFamily": "calibri",
    "color": "#02e3f7",
    "extra": {
      "price": false,
      "bars": false,
      "date": false,
      "distance": false,
      "angle": false
    }
  },
  visible: true,
  hoverover: false,
  extra: false,
  indicator: false,
  chartIndex: 0,
  curIndex: 0,
  isLocked: false,
  toolbar: {
    template: { inited: true, active: false, expanded: true },
    lineColor: { inited: true, active: false, expanded: true },
    backgroundColor: { inited: false, active: false, expanded: false },
    lineThickness: { inited: true, active: false, expanded: true },
    lineStyle: { inited: true, active: false, expanded: true },
    startArrow: { inited: true, active: false, expanded: true },
    endArrow: { inited: true, active: false, expanded: true },
    setting: { inited: false, active: false, expanded: true },
    order: { inited: false, active: false, expanded: true },
    clone: { inited: false, active: false, expanded: true },
    lock: { inited: false, active: false, expanded: true },
    eye: { inited: false, active: false, expanded: true },
    delete: { inited: false, active: false, expanded: true }
  },
  zIndex: 0,
  priceIndex: 0,
  priceOffset: 0
};

const rayOption = {
  key: 'ray',
  title: 'Ray',
  templateName: 'arrow-setting',
  pointsNum: 2,
  mainLine: {
    "lineColor": "rgb(159, 197, 232)",
    "backgroundColor": "rgba(34, 34, 209, 0.43)",
    "lineThickness": "2",
    "lineDashType": "solid",
    "visible": true
  },
  background: {
    visible: true,
    color: '#ff0000'
  },
  levelLine: {
    lineThickness: 1,
    lineDashType: 'solid',
  },
  points: [],
  start: {
    arrow: false,
    extend: false
  },
  end: {
    arrow: true,
    extend: false
  },
  label: {
    "visible": false,
    "indexVisible": true,
    "text": "",
    "align": "right",
    "vAlign": "top",
    "fontStyle": "normal",
    "fontWeight": "bold",
    "fontSize": "16",
    "fontFamily": "calibri",
    "color": "rgb(255, 0, 0)",
    extra: {
      price: false,
      bars: false,
      date: false,
      distance: false,
      angle: false
    }
  },
  visible: true,
  hoverover: false,
  extra: false,
  indicator: false,
  chartIndex: 0,
  curIndex: 0,
  isLocked: false,
  toolbar: {
    template: { inited: true, active: false, expanded: true },
    lineColor: { inited: true, active: false, expanded: true },
    backgroundColor: { inited: false, active: false, expanded: false },
    lineThickness: { inited: true, active: false, expanded: true },
    lineStyle: { inited: true, active: false, expanded: true },
    startArrow: { inited: true, active: false, expanded: true },
    endArrow: { inited: true, active: false, expanded: true },
    setting: { inited: false, active: false, expanded: true },
    order: { inited: false, active: false, expanded: true },
    clone: { inited: false, active: false, expanded: true },
    lock: { inited: false, active: false, expanded: true },
    eye: { inited: false, active: false, expanded: true },
    delete: { inited: false, active: false, expanded: true }
  },
  zIndex: 0,
  priceIndex: 0,
  priceOffset: 0
};

const fibOption = {
  key: 'fibonacci',
  title: 'Fibonacci Retracement',
  templateName: 'fib-setting',
  pointsNum: 2,
  mainLine: {
    "lineColor": "rgb(204, 204, 204)",
    "backgroundColor": "rgba(34, 34, 209, 0.43)",
    "lineThickness": "1",
    "lineDashType": "dot",
    "visible": true
  },
  background: {
    "visible": false,
    "color": "#ff0000",
    "opacity": 0
  },
  levelLine: {
    "color": "#cacaca",
    "lineThickness": 1,
    "lineDashType": "dot"
  },
  points: [],
  levels: [
    { "visible": true, "value": 0, "color": "#cacaca" },
    { "visible": true, "value": 0.236, "color": "rgb(159, 197, 232)" },
    { "visible": true, "value": 0.382, "color": "rgb(159, 197, 232)" },
    { "visible": true, "value": 0.5, "color": "rgb(159, 197, 232)" },
    { "visible": true, "value": 0.618, "color": "rgb(191, 144, 0)" },
    { "visible": true, "value": 0.786, "color": "rgb(159, 197, 232)" },
    { "visible": true, "value": 1, "color": "rgb(204, 204, 204)" },
    { "visible": true, "value": 1.618, "color": "rgb(159, 197, 232)" },
    { "visible": true, "value": -0.272, "color": "rgb(159, 197, 232)" },
    { "visible": true, "value": 0.88, "color": "rgb(159, 197, 232)" },
    { "visible": true, "value": -0.618, "color": "rgb(159, 197, 232)" },
    { "visible": true, "value": 1.272, "color": "#c3e099" },
    { "visible": false, "value": 1.414, "color": "#df7f93" },
    { "visible": false, "value": 1.618, "color": "#c3e099" },
    { "visible": false, "value": 2.414, "color": "#91df99" },
    { "visible": false, "value": 2, "color": "#91dfc9" },
    { "visible": false, "value": 3, "color": "#8ec3e4" },
    { "visible": false, "value": 3.272, "color": "#b8babd" },
    { "visible": false, "value": 3.414, "color": "#8b91e4" },
    { "visible": false, "value": 4, "color": "#df7f93" },
    { "visible": false, "value": 4.272, "color": "#c48fe5" },
    { "visible": false, "value": 4.414, "color": "#df86c9" },
    { "visible": false, "value": 4.618, "color": "#c3e099" },
    { "visible": false, "value": 4.764, "color": "#91dfc9" }
  ],
  label: {
    "visible": true,
    "indexVisible": false,
    "text": "",
    "align": "left",
    "vAlign": "middle",
    "fontStyle": "normal",
    "fontWeight": "normal",
    "fontSize": 12,
    "fontFamily": "calibri",
    "color": "#ffffff",
    "extra": {
      "price": true,
      "levels": true,
      "percents": true
    }
  },
  extend: false,
  hoverover: false,
  revert: false,
  visible: true,
  extra: false,
  indicator: false,
  chartIndex: 0,
  curIndex: 0,
  isLocked: false,
  mainDraw: false,
  toolbar: {
    template: { inited: true, active: false, expanded: true },
    lineColor: { inited: true, active: false, expanded: true },
    backgroundColor: { inited: false, active: false, expanded: false },
    lineThickness: { inited: false, active: false, expanded: false },
    lineStyle: { inited: false, active: false, expanded: false },
    startArrow: { inited: false, active: false, expanded: false },
    endArrow: { inited: false, active: false, expanded: false },
    setting: { inited: false, active: false, expanded: true },
    order: { inited: false, active: false, expanded: true },
    clone: { inited: false, active: false, expanded: true },
    lock: { inited: false, active: false, expanded: true },
    eye: { inited: false, active: false, expanded: true },
    delete: { inited: false, active: false, expanded: true }
  },
  zIndex: 0,
  priceIndex: 0,
  priceOffset: 0
};

const algebraOption = {
  key: 'rect',
  title: 'Rectangle',
  templateName: 'rect-setting',
  pointsNum: 4,
  mainLine: {
    "lineColor": "rgb(191, 144, 0)",
    "backgroundColor": "rgba(255, 0, 0, 0.8)",
    "lineThickness": 1,
    "lineDashType": "solid",
    "visible": true
  },
  background: {
    "visible": true,
    "color": "rgba(191, 144, 0, 0.19)",
    "opacity": 0.2
  },
  levelLine: {
    lineThickness: 1,
    lineDashType: 'solid',
  },
  label: {
    "visible": true,
    "indexVisible": false,
    "text": "text",
    "align": "center",
    "vAlign": "middle",
    "fontStyle": "normal",
    "fontWeight": "normal",
    "fontSize": 12,
    "fontFamily": "calibri",
    "color": "#ffffff"
  },
  points: [],
  visible: true,
  hoverover: false,
  extra: false,
  indicator: false,
  chartIndex: 0,
  curIndex: 0,
  isLocked: false,
  mainDraw: true,
  toolbar: {
    template: { inited: true, active: false, expanded: true },
    lineColor: { inited: true, active: false, expanded: true },
    fontColor: { inited: false, active: false, expanded: false },
    fontSize: { inited: false, active: false, expanded: false },
    backgroundColor: { inited: true, active: false, expanded: true },
    lineThickness: { inited: true, active: false, expanded: true },
    lineStyle: { inited: false, active: false, expanded: false },
    setting: { inited: false, active: false, expanded: true },
    order: { inited: false, active: false, expanded: true },
    clone: { inited: false, active: false, expanded: true },
    lock: { inited: false, active: false, expanded: true },
    endArrow: { inited: false, active: false, expanded: false },
    startArrow: { inited: false, active: false, expanded: false },
    eye: { inited: false, active: false, expanded: true },
    delete: { inited: false, active: false, expanded: true }
  },
  zIndex: 0,
  priceIndex: 0,
  priceOffset: 0
};

const parallelChanelOption = {
  key: 'parallel',
  title: 'Parallel Channel',
  templateName: 'parallel-setting',
  pointsNum: 3,
  mainLine: {
    lineColor: '#2185d0',
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    lineThickness: 4,
    lineDashType: 'dash',
    visible: true
  },
  background: {
    visible: true,
    color: 'rgba(33, 133, 208, 0.2)',
    opacity: 0.2
  },
  levelLine: {
    lineColor: '#2185d0',
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    lineThickness: 1,
    lineDashType: 'dash',
    visible: true
  },
  start: {
    extend: false
  },
  end: {
    extend: false
  },
  label: {
    visible: true,
    indexVisible: false,
    text: 'text',
    align: 'center',
    vAlign: 'middle',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: 12,
    fontFamily: 'calibri',
    color: '#ffffff',
    extra: {}
  },
  points: [],
  visible: true,
  hoverover: false,
  extra: false,
  indicator: false,
  chartIndex: 0,
  curIndex: 0,
  isLocked: false,
  mainDraw: true,
  toolbar: {
    template: { inited: true, active: false, expanded: true },
    lineColor: { inited: true, active: false, expanded: true },
    fontColor: { inited: false, active: false, expanded: false },
    fontSize: { inited: false, active: false, expanded: false },
    backgroundColor: { inited: true, active: false, expanded: true },
    lineThickness: { inited: true, active: false, expanded: true },
    lineStyle: { inited: true, active: false, expanded: true },
    setting: { inited: false, active: false, expanded: true },
    order: { inited: false, active: false, expanded: true },
    clone: { inited: false, active: false, expanded: true },
    lock: { inited: false, active: false, expanded: true },
    endArrow: { inited: false, active: false, expanded: false },
    startArrow: { inited: false, active: false, expanded: false },
    eye: { inited: false, active: false, expanded: true },
    delete: { inited: false, active: false, expanded: true }
  },
  zIndex: 0,
  priceIndex: 0,
  priceOffset: 0
};

const fibExtendOption = {
  key: 'fib-extend',
  title: 'Fib Extension',
  templateName: 'fib-setting',
  pointsNum: 3,
  mainLine: {
    "lineColor": "rgb(204, 204, 204)",
    "backgroundColor": "rgba(34, 34, 209, 0.43)",
    "lineThickness": "1",
    "lineDashType": "dot",
    "visible": true
  },
  background: {
    "visible": false,
    "color": "#ff0000",
    "opacity": 0
  },
  levelLine: {
    "color": "#cacaca",
    "lineThickness": 1,
    "lineDashType": "dot"
  },
  points: [],
  levels: [
    { "visible": false, "value": 0, "color": "#cacaca" },
    { "visible": false, "value": 0.236, "color": "#cc2828" },
    { "visible": false, "value": 0.382, "color": "#95cc28" },
    { "visible": false, "value": 0.5, "color": "#28cc28" },
    { "visible": true, "value": 0.618, "color": "rgb(241, 194, 50)" },
    { "visible": true, "value": 0.786, "color": "rgb(159, 197, 232)" },
    { "visible": true, "value": 1, "color": "rgb(159, 197, 232)" },
    { "visible": true, "value": 1.618, "color": "rgb(159, 197, 232)" },
    { "visible": false, "value": 2.618, "color": "#cc2828" },
    { "visible": false, "value": 3.618, "color": "#9528cc" },
    { "visible": false, "value": 4.236, "color": "#cc2895" },
    { "visible": true, "value": 1.272, "color": "rgb(159, 197, 232)" },
    { "visible": false, "value": 1.414, "color": "#df7f93" },
    { "visible": false, "value": 2.272, "color": "#c3e099" },
    { "visible": false, "value": 2.414, "color": "#91df99" },
    { "visible": false, "value": 2, "color": "#91dfc9" },
    { "visible": false, "value": 3, "color": "#8ec3e4" },
    { "visible": false, "value": 3.272, "color": "#b8babd" },
    { "visible": false, "value": 3.414, "color": "#8b91e4" },
    { "visible": false, "value": 4, "color": "#df7f93" },
    { "visible": false, "value": 4.272, "color": "#c48fe5" },
    { "visible": false, "value": 4.414, "color": "#df86c9" },
    { "visible": false, "value": 4.618, "color": "#c3e099" },
    { "visible": false, "value": 4.764, "color": "#91dfc9" }
  ],
  label: {
    "visible": true,
    "indexVisible": false,
    "text": "",
    "align": "left",
    "vAlign": "middle",
    "fontStyle": "normal",
    "fontWeight": "normal",
    "fontSize": 12,
    "fontFamily": "calibri",
    "color": "#ffffff",
    "extra": {
      "price": true,
      "levels": false,
      "percents": true
    }
  },
  extend: false,
  hoverover: false,
  revert: false,
  visible: true,
  extra: false,
  indicator: false,
  chartIndex: 0,
  curIndex: 0,
  isLocked: false,
  mainDraw: true,
  toolbar: {
    template: { inited: true, active: false, expanded: true },
    lineColor: { inited: true, active: false, expanded: true },
    backgroundColor: { inited: false, active: false, expanded: false },
    lineThickness: { inited: false, active: false, expanded: false },
    lineStyle: { inited: false, active: false, expanded: false },
    startArrow: { inited: false, active: false, expanded: false },
    endArrow: { inited: false, active: false, expanded: false },
    setting: { inited: false, active: false, expanded: true },
    order: { inited: false, active: false, expanded: true },
    clone: { inited: false, active: false, expanded: true },
    lock: { inited: false, active: false, expanded: true },
    eye: { inited: false, active: false, expanded: true },
    delete: { inited: false, active: false, expanded: true }
  },
  zIndex: 0,
  priceIndex: 0,
  priceOffset: 0
};

const calloutOption = {
  key: 'callout',
  title: 'Callout',
  templateName: 'text-setting',
  pointsNum: 2,
  mainLine: {
    "lineColor": "rgb(191, 144, 0)",
    "backgroundColor": "rgba(255, 0, 0, 0.8)",
    "lineThickness": "2",
    "lineDashType": "solid",
    "visible": true
  },
  background: {
    "visible": true,
    "color": "rgba(191, 144, 0, 0.19)",
    "opacity": 0.2
  },
  levelLine: {
    lineThickness: 1,
    lineDashType: 'solid',
  },
  label: {
    "visible": true,
    "indexVisible": false,
    "text": "text",
    "align": "center",
    "vAlign": "middle",
    "fontStyle": "normal",
    "fontWeight": "normal",
    "fontSize": "16",
    "fontFamily": "calibri",
    "color": "rgb(255, 255, 255)"
  },
  points: [],
  visible: true,
  hoverover: false,
  extra: false,
  indicator: false,
  chartIndex: 0,
  curIndex: 0,
  isLocked: false,
  mainDraw: true,
  toolbar: {
    template: { inited: true, active: false, expanded: true },
    lineColor: { inited: true, active: false, expanded: true },
    fontColor: { inited: true, active: false, expanded: true },
    fontSize: { inited: true, active: false, expanded: true },
    backgroundColor: { inited: true, active: false, expanded: true },
    lineThickness: { inited: true, active: false, expanded: true },
    lineStyle: { inited: false, active: false, expanded: false },
    setting: { inited: false, active: false, expanded: true },
    order: { inited: false, active: false, expanded: true },
    clone: { inited: false, active: false, expanded: true },
    lock: { inited: false, active: false, expanded: true },
    endArrow: { inited: false, active: false, expanded: false },
    startArrow: { inited: false, active: false, expanded: false },
    eye: { inited: false, active: false, expanded: true },
    delete: { inited: false, active: false, expanded: true }
  },
  zIndex: 0,
  priceIndex: 0,
  priceOffset: 0
};

const tradeOption = {
  key: 'trade',
  title: "Trade Manager",
  selected: null,
  active: false,
  tradeType: 'Scalping',
  points: [],
  pointsNum: 7,
  advanced: false,
  selFlag: true,
  hoverover: false,
  holder: false,
  width: 40,
  signals: [
    { visible: true, value: { x: 0, y: 0 }, rate: 0, labelPos: { x: 0, y: 0 }, color: '#2185d0', usedColor: '#2185d0', used: false, title: 'Entry' },
    { visible: true, value: { x: 0, y: 0 }, rate: 0, labelPos: { x: 0, y: 0 }, color: '#db2828', usedColor: '#2185d0', used: false, title: 'Stop Loss' },
    { visible: true, value: { x: 0, y: 0 }, rate: 0, labelPos: { x: 0, y: 0 }, color: '#21ba45', usedColor: '#2185d0', used: false, title: 'Take Profit' },
    { visible: true, value: { x: 0, y: 0 }, rate: 0, labelPos: { x: 0, y: 0 }, color: '#fbbd08', usedColor: '#2185d0', used: false, title: 'Break Even' },
    { visible: true, value: { x: 0, y: 0 }, rate: 0, labelPos: { x: 0, y: 0 }, color: '#a333c8', usedColor: '#2185d0', used: false, title: 'Idea Invalidation' },
    { visible: true, value: { x: 0, y: 0 }, rate: 0, labelPos: { x: 0, y: 0 }, color: '#00b5ad', usedColor: '#2185d0', used: false, title: 'Partial Profit' },
    { visible: true, value: { x: 0, y: 0 }, rate: 0, labelPos: { x: 0, y: 0 }, color: '#e03997', usedColor: '#2185d0', used: false, title: 'Trailing Stop Loss' },
  ],
  signal: { visible: false, start: 0, end: 0, color: 'red' },
  visible: true,
  extra: false,
  indicator: false,
  chartIndex: 0,
  curIndex: 0,
  zIndex: 0,
  status: 'Pending',
  priceIndex: 0,
  priceOffset: 6,
  isTrade: true
};

const signalOption = {
  key: 'signal',
  title: "Signal View",
  selected: null,
  active: false,
  advanced: false,
  selFlag: true,
  width: 40,
  visible: false,
  extra: false,
  indicator: false,
  chartIndex: 0,
  curIndex: 0,
  zIndex: 0,
  priceIndex: 0,
  priceOffset: 0,
  pointsNum: 1,
};

const xabcdOption = {
  key: 'xabcd',
  title: 'XABCD Pattern',
  templateName: 'harmonic-setting',
  pointsNum: 5,
  mainLine: {
    "lineColor": "rgb(255, 153, 0)",
    "backgroundColor": "rgba(34, 34, 209, 0.43)",
    "lineThickness": "2",
    "lineDashType": "solid",
    "visible": true
  },
  background: {
    "visible": true,
    "color": "rgba(255, 153, 0, 0.08)",
    "opacity": 0.2
  },
  levelLine: {
    lineThickness: 1,
    lineDashType: 'solid',
  },
  points: [],
  label: {
    "visible": true,
    "indexVisible": true,
    "text": "",
    "align": "center",
    "vAlign": "normal",
    "fontStyle": "normal",
    "fontWeight": "normal",
    "fontSize": 16,
    "fontFamily": "calibri",
    "color": "rgb(0, 0, 0)",
    "lineColor": "rgb(255, 153, 0)"
  },
  visible: true,
  hoverover: false,
  extra: false,
  indicator: false,
  chartIndex: 0,
  curIndex: 0,
  isLocked: false,
  mainDraw: true,
  toolbar: {
    template: { inited: true, active: false, expanded: true },
    lineColor: { inited: true, active: false, expanded: true },
    backgroundColor: { inited: true, active: false, expanded: true },
    lineThickness: { inited: true, active: false, expanded: true },
    lineStyle: { inited: false, active: false, expanded: false },
    startArrow: { inited: false, active: false, expanded: false },
    endArrow: { inited: false, active: false, expanded: false },
    setting: { inited: false, active: false, expanded: true },
    order: { inited: false, active: false, expanded: true },
    clone: { inited: false, active: false, expanded: true },
    lock: { inited: false, active: false, expanded: true },
    eye: { inited: false, active: false, expanded: true },
    delete: { inited: false, active: false, expanded: true }
  },
  zIndex: 0,
  priceIndex: 0,
  priceOffset: 0
};

const cypherOption = {
  key: 'cypher',
  title: 'Cypher Pattern',
  templateName: 'harmonic-setting',
  pointsNum: 5,
  mainLine: {
    "lineColor": "rgb(255, 153, 0)",
    "backgroundColor": "rgba(34, 34, 209, 0.43)",
    "lineThickness": 1,
    "lineDashType": "solid",
    "visible": true
  },
  background: {
    "visible": true,
    "color": "rgba(255, 153, 0, 0.06)",
    "opacity": 0.2
  },
  levelLine: {
    lineThickness: 1,
    lineDashType: 'solid',
  },
  points: [],
  label: {
    "visible": true,
    "indexVisible": true,
    "text": "",
    "align": "center",
    "vAlign": "normal",
    "fontStyle": "normal",
    "fontWeight": "normal",
    "fontSize": 16,
    "fontFamily": "calibri",
    "color": "rgb(0, 0, 0)",
    "lineColor": "rgb(255, 153, 0)"
  },
  visible: true,
  hoverover: false,
  extra: false,
  indicator: false,
  chartIndex: 0,
  curIndex: 0,
  isLocked: false,
  mainDraw: true,
  toolbar: {
    template: { inited: true, active: false, expanded: true },
    lineColor: { inited: true, active: false, expanded: true },
    backgroundColor: { inited: true, active: false, expanded: true },
    lineThickness: { inited: true, active: false, expanded: true },
    lineStyle: { inited: false, active: false, expanded: false },
    startArrow: { inited: false, active: false, expanded: false },
    endArrow: { inited: false, active: false, expanded: false },
    setting: { inited: false, active: false, expanded: true },
    order: { inited: false, active: false, expanded: true },
    clone: { inited: false, active: false, expanded: true },
    lock: { inited: false, active: false, expanded: true },
    eye: { inited: false, active: false, expanded: true },
    delete: { inited: false, active: false, expanded: true }
  },
  zIndex: 0,
  priceIndex: 0,
  priceOffset: 0
};

const abcdOption = {
  key: 'abcd',
  title: 'ABCD Pattern',
  templateName: 'abcd-setting',
  pointsNum: 4,
  mainLine: {
    "lineColor": "rgb(255, 153, 0)",
    "backgroundColor": "rgba(34, 34, 209, 0.43)",
    "lineThickness": 1,
    "lineDashType": "solid",
    "visible": true
  },
  background: {
    "visible": true,
    "color": "rgba(204, 40, 150, 0.41)",
    "opacity": 0.2
  },
  levelLine: {
    lineThickness: 1,
    lineDashType: 'solid',
  },
  points: [],
  label: {
    "visible": true,
    "indexVisible": true,
    "text": "",
    "align": "center",
    "vAlign": "normal",
    "fontStyle": "normal",
    "fontWeight": "normal",
    "fontSize": 16,
    "fontFamily": "calibri",
    "color": "rgb(0, 0, 0)",
    "lineColor": "rgb(255, 153, 0)"
  },
  visible: true,
  hoverover: false,
  extra: false,
  indicator: false,
  chartIndex: 0,
  curIndex: 0,
  isLocked: false,
  mainDraw: true,
  toolbar: {
    template: { inited: true, active: false, expanded: true },
    lineColor: { inited: true, active: false, expanded: true },
    backgroundColor: { inited: false, active: false, expanded: false },
    lineThickness: { inited: true, active: false, expanded: true },
    lineStyle: { inited: false, active: false, expanded: false },
    startArrow: { inited: false, active: false, expanded: false },
    endArrow: { inited: false, active: false, expanded: false },
    setting: { inited: false, active: false, expanded: true },
    order: { inited: false, active: false, expanded: true },
    clone: { inited: false, active: false, expanded: true },
    lock: { inited: false, active: false, expanded: true },
    eye: { inited: false, active: false, expanded: true },
    delete: { inited: false, active: false, expanded: true }
  },
  zIndex: 0,
  priceIndex: 0,
  priceOffset: 0
};

const triPatternOption = {
  key: 'tri_pattern',
  title: 'Triangle Pattern',
  templateName: 'harmonic-setting',
  pointsNum: 4,
  mainLine: {
    "lineColor": "rgb(255, 153, 0)",
    "backgroundColor": "rgba(34, 34, 209, 0.43)",
    "lineThickness": 1,
    "lineDashType": "solid",
    "visible": true
  },
  background: {
    "visible": true,
    "color": "rgba(255, 153, 0, 0.08)",
    "opacity": 0.2
  },
  levelLine: {
    lineThickness: 1,
    lineDashType: 'solid',
  },
  points: [],
  label: {
    "visible": true,
    "indexVisible": true,
    "text": "",
    "align": "center",
    "vAlign": "normal",
    "fontStyle": "normal",
    "fontWeight": "normal",
    "fontSize": 16,
    "fontFamily": "calibri",
    "color": "rgb(0, 0, 0)",
    "lineColor": "rgb(255, 153, 0)"
  },
  visible: true,
  hoverover: false,
  extra: false,
  indicator: false,
  chartIndex: 0,
  curIndex: 0,
  isLocked: false,
  mainDraw: true,
  toolbar: {
    template: { inited: true, active: false, expanded: true },
    lineColor: { inited: true, active: false, expanded: true },
    backgroundColor: { inited: false, active: false, expanded: false },
    lineThickness: { inited: true, active: false, expanded: true },
    lineStyle: { inited: false, active: false, expanded: false },
    startArrow: { inited: false, active: false, expanded: false },
    endArrow: { inited: false, active: false, expanded: false },
    setting: { inited: false, active: false, expanded: true },
    order: { inited: false, active: false, expanded: true },
    clone: { inited: false, active: false, expanded: true },
    lock: { inited: false, active: false, expanded: true },
    eye: { inited: false, active: false, expanded: true },
    delete: { inited: false, active: false, expanded: true }
  },
  zIndex: 0,
  priceIndex: 0,
  priceOffset: 0
};

const threeOption = {
  key: 'three_pattern',
  title: 'Three Drives Pattern',
  templateName: 'abcd-setting',
  pointsNum: 7,
  mainLine: {
    "lineColor": "rgb(255, 153, 0)",
    "backgroundColor": "rgba(34, 34, 209, 0.43)",
    "lineThickness": 1,
    "lineDashType": "solid",
    "visible": true
  },
  background: {
    "visible": true,
    "color": "rgba(204, 40, 150, 0.41)",
    "opacity": 0.2
  },
  levelLine: {
    lineThickness: 1,
    lineDashType: 'solid',
  },
  points: [],
  label: {
    "visible": true,
    "indexVisible": true,
    "text": "",
    "align": "center",
    "vAlign": "normal",
    "fontStyle": "normal",
    "fontWeight": "normal",
    "fontSize": 16,
    "fontFamily": "calibri",
    "color": "rgb(0, 0, 0)",
    "lineColor": "rgb(255, 153, 0)"
  },
  visible: true,
  hoverover: false,
  extra: false,
  indicator: false,
  chartIndex: 0,
  curIndex: 0,
  isLocked: false,
  mainDraw: true,
  toolbar: {
    template: { inited: true, active: false, expanded: true },
    lineColor: { inited: true, active: false, expanded: true },
    backgroundColor: { inited: false, active: false, expanded: false },
    lineThickness: { inited: true, active: false, expanded: true },
    lineStyle: { inited: false, active: false, expanded: false },
    startArrow: { inited: false, active: false, expanded: false },
    endArrow: { inited: false, active: false, expanded: false },
    setting: { inited: false, active: false, expanded: true },
    order: { inited: false, active: false, expanded: true },
    clone: { inited: false, active: false, expanded: true },
    lock: { inited: false, active: false, expanded: true },
    eye: { inited: false, active: false, expanded: true },
    delete: { inited: false, active: false, expanded: true }
  },
  zIndex: 0,
  priceIndex: 0,
  priceOffset: 0
};

const headShoulderOption = {
  key: 'head_shoulder',
  title: 'Three Drives Pattern',
  templateName: 'harmonic-setting',
  pointsNum: 7,
  mainLine: {
    "lineColor": "rgb(255, 153, 0)",
    "backgroundColor": "rgba(34, 34, 209, 0.43)",
    "lineThickness": 1,
    "lineDashType": "solid",
    "visible": true
  },
  background: {
    "visible": true,
    "color": "rgba(255, 153, 0, 0)",
    "opacity": 0.2
  },
  levelLine: {
    lineThickness: 1,
    lineDashType: 'solid',
  },
  points: [],
  label: {
    "visible": true,
    "indexVisible": true,
    "text": "",
    "align": "center",
    "vAlign": "normal",
    "fontStyle": "normal",
    "fontWeight": "normal",
    "fontSize": 16,
    "fontFamily": "calibri",
    "color": "rgb(0, 0, 0)",
    "lineColor": "rgb(255, 153, 0)"
  },
  visible: true,
  hoverover: false,
  extra: false,
  indicator: false,
  chartIndex: 0,
  curIndex: 0,
  isLocked: false,
  mainDraw: true,
  toolbar: {
    template: { inited: true, active: false, expanded: true },
    lineColor: { inited: true, active: false, expanded: true },
    backgroundColor: { inited: true, active: false, expanded: true },
    lineThickness: { inited: true, active: false, expanded: true },
    lineStyle: { inited: false, active: false, expanded: false },
    startArrow: { inited: false, active: false, expanded: false },
    endArrow: { inited: false, active: false, expanded: false },
    setting: { inited: false, active: false, expanded: true },
    order: { inited: false, active: false, expanded: true },
    clone: { inited: false, active: false, expanded: true },
    lock: { inited: false, active: false, expanded: true },
    eye: { inited: false, active: false, expanded: true },
    delete: { inited: false, active: false, expanded: true }
  },
  zIndex: 0,
  priceIndex: 0,
  priceOffset: 6
};

const impulseOption = {
  key: 'impulse_wave',
  title: 'Elliott Impulse Wave(12345)',
  templateName: 'wave-setting',
  pointsNum: 6,
  mainLine: {
    "lineColor": "rgb(255, 153, 0)",
    "backgroundColor": "rgba(34, 34, 209, 0.43)",
    "lineThickness": 1,
    "lineDashType": "solid",
    "visible": true
  },
  background: {
    "visible": true,
    "color": "rgba(0, 153, 0, 0.6)"
  },
  levelLine: {
    lineThickness: 1,
    lineDashType: 'solid',
  },
  points: [],
  label: {
    "visible": true,
    "indexVisible": true,
    "text": "",
    "align": "center",
    "vAlign": "normal",
    "fontStyle": "normal",
    "fontWeight": "bold",
    "fontSize": 16,
    "fontFamily": "calibri",
    "color": "rgb(255, 153, 0)",
    "lineColor": "transparent"
  },
  visible: true,
  hoverover: false,
  extra: false,
  indicator: false,
  chartIndex: 0,
  curIndex: 0,
  isLocked: false,
  mainDraw: true,
  toolbar: {
    template: { inited: true, active: false, expanded: true },
    lineColor: { inited: true, active: false, expanded: true },
    backgroundColor: { inited: false, active: false, expanded: false },
    lineThickness: { inited: true, active: false, expanded: true },
    lineStyle: { inited: false, active: false, expanded: false },
    startArrow: { inited: false, active: false, expanded: false },
    endArrow: { inited: false, active: false, expanded: false },
    setting: { inited: false, active: false, expanded: true },
    order: { inited: false, active: false, expanded: true },
    clone: { inited: false, active: false, expanded: true },
    lock: { inited: false, active: false, expanded: true },
    eye: { inited: false, active: false, expanded: true },
    delete: { inited: false, active: false, expanded: true }
  },
  zIndex: 0,
  priceIndex: 0,
  priceOffset: 5
};

const triWaveOption = {
  key: 'triangle_wave',
  title: 'Elliott Triangle Wave (ABCDE)',
  templateName: 'wave-setting',
  pointsNum: 6,
  mainLine: {
    "lineColor": "rgb(255, 153, 0)",
    "backgroundColor": "rgba(34, 34, 209, 0.43)",
    "lineThickness": 1,
    "lineDashType": "solid",
    "visible": true
  },
  background: {
    visible: true,
    color: 'rgba(0, 153, 0, 0.6)'
  },
  levelLine: {
    lineThickness: 1,
    lineDashType: 'solid',
  },
  points: [],
  label: {
    "visible": true,
    "indexVisible": true,
    "text": "",
    "align": "center",
    "vAlign": "normal",
    "fontStyle": "normal",
    "fontWeight": "bold",
    "fontSize": 16,
    "fontFamily": "calibri",
    "color": "rgb(255, 153, 0)",
    "lineColor": "transparent"
  },
  visible: true,
  hoverover: false,
  extra: false,
  indicator: false,
  chartIndex: 0,
  curIndex: 0,
  isLocked: false,
  mainDraw: true,
  toolbar: {
    template: { inited: true, active: false, expanded: true },
    lineColor: { inited: true, active: false, expanded: true },
    backgroundColor: { inited: false, active: false, expanded: false },
    lineThickness: { inited: true, active: false, expanded: true },
    lineStyle: { inited: false, active: false, expanded: false },
    startArrow: { inited: false, active: false, expanded: false },
    endArrow: { inited: false, active: false, expanded: false },
    setting: { inited: false, active: false, expanded: true },
    order: { inited: false, active: false, expanded: true },
    clone: { inited: false, active: false, expanded: true },
    lock: { inited: false, active: false, expanded: true },
    eye: { inited: false, active: false, expanded: true },
    delete: { inited: false, active: false, expanded: true }
  },
  zIndex: 0,
  priceIndex: 0,
  priceOffset: 5
};

const tripleOption = {
  key: 'triple_wave',
  title: 'Elliott Triple Wave (WXYXZ)',
  templateName: 'wave-setting',
  pointsNum: 6,
  mainLine: {
    "lineColor": "rgb(255, 153, 0)",
    "backgroundColor": "rgba(34, 34, 209, 0.43)",
    "lineThickness": 1,
    "lineDashType": "solid",
    "visible": true
  },
  background: {
    visible: true,
    color: 'rgba(0, 153, 0, 0.6)'
  },
  levelLine: {
    lineThickness: 1,
    lineDashType: 'solid',
  },
  points: [],
  label: {
    "visible": true,
    "indexVisible": true,
    "text": "",
    "align": "center",
    "vAlign": "normal",
    "fontStyle": "normal",
    "fontWeight": "bold",
    "fontSize": 16,
    "fontFamily": "calibri",
    "color": "rgb(255, 153, 0)",
    "lineColor": "transparent"
  },
  visible: true,
  hoverover: false,
  extra: false,
  indicator: false,
  chartIndex: 0,
  curIndex: 0,
  isLocked: false,
  mainDraw: true,
  toolbar: {
    template: { inited: true, active: false, expanded: true },
    lineColor: { inited: true, active: false, expanded: true },
    backgroundColor: { inited: false, active: false, expanded: false },
    lineThickness: { inited: true, active: false, expanded: true },
    lineStyle: { inited: false, active: false, expanded: false },
    startArrow: { inited: false, active: false, expanded: false },
    endArrow: { inited: false, active: false, expanded: false },
    setting: { inited: false, active: false, expanded: true },
    order: { inited: false, active: false, expanded: true },
    clone: { inited: false, active: false, expanded: true },
    lock: { inited: false, active: false, expanded: true },
    eye: { inited: false, active: false, expanded: true },
    delete: { inited: false, active: false, expanded: true }
  },
  zIndex: 0,
  priceIndex: 0,
  priceOffset: 5
};

const correctionOption = {
  key: 'correction_wave',
  title: 'Elliott Correction Wave (ABC)',
  templateName: 'wave-setting',
  pointsNum: 4,
  mainLine: {
    "lineColor": "rgb(255, 153, 0)",
    "backgroundColor": "rgba(34, 34, 209, 0.43)",
    "lineThickness": 1,
    "lineDashType": "solid",
    "visible": true
  },
  background: {
    visible: true,
    color: 'rgba(0, 153, 0, 0.6)'
  },
  levelLine: {
    lineThickness: 1,
    lineDashType: 'solid',
  },
  points: [],
  label: {
    "visible": true,
    "indexVisible": true,
    "text": "",
    "align": "center",
    "vAlign": "normal",
    "fontStyle": "normal",
    "fontWeight": "bold",
    "fontSize": 16,
    "fontFamily": "calibri",
    "color": "rgb(255, 153, 0)",
    "lineColor": "transparent"
  },
  visible: true,
  hoverover: false,
  extra: false,
  indicator: false,
  chartIndex: 0,
  curIndex: 0,
  isLocked: false,
  mainDraw: true,
  toolbar: {
    template: { inited: true, active: false, expanded: true },
    lineColor: { inited: true, active: false, expanded: true },
    backgroundColor: { inited: false, active: false, expanded: false },
    lineThickness: { inited: true, active: false, expanded: true },
    lineStyle: { inited: false, active: false, expanded: false },
    startArrow: { inited: false, active: false, expanded: false },
    endArrow: { inited: false, active: false, expanded: false },
    setting: { inited: false, active: false, expanded: true },
    order: { inited: false, active: false, expanded: true },
    clone: { inited: false, active: false, expanded: true },
    lock: { inited: false, active: false, expanded: true },
    eye: { inited: false, active: false, expanded: true },
    delete: { inited: false, active: false, expanded: true }
  },
  zIndex: 0,
  priceIndex: 0,
  priceOffset: 3
};

const doubleOption = {
  key: 'double_wave',
  title: 'Elliott Double Combo Wave (WXY)',
  templateName: 'wave-setting',
  pointsNum: 4,
  mainLine: {
    "lineColor": "rgb(255, 153, 0)",
    "backgroundColor": "rgba(34, 34, 209, 0.43)",
    "lineThickness": 1,
    "lineDashType": "solid",
    "visible": true
  },
  background: {
    visible: true,
    color: 'rgba(0, 153, 0, 0.6)'
  },
  levelLine: {
    lineThickness: 1,
    lineDashType: 'solid',
  },
  points: [],
  label: {
    "visible": true,
    "indexVisible": true,
    "text": "",
    "align": "center",
    "vAlign": "normal",
    "fontStyle": "normal",
    "fontWeight": "bold",
    "fontSize": 16,
    "fontFamily": "calibri",
    "color": "rgb(255, 153, 0)",
    "lineColor": "transparent"
  },
  visible: true,
  hoverover: false,
  extra: false,
  indicator: false,
  chartIndex: 0,
  curIndex: 0,
  isLocked: false,
  mainDraw: true,
  toolbar: {
    template: { inited: true, active: false, expanded: true },
    lineColor: { inited: true, active: false, expanded: true },
    backgroundColor: { inited: false, active: false, expanded: false },
    lineThickness: { inited: true, active: false, expanded: true },
    lineStyle: { inited: false, active: false, expanded: false },
    startArrow: { inited: false, active: false, expanded: false },
    endArrow: { inited: false, active: false, expanded: false },
    setting: { inited: false, active: false, expanded: true },
    order: { inited: false, active: false, expanded: true },
    clone: { inited: false, active: false, expanded: true },
    lock: { inited: false, active: false, expanded: true },
    eye: { inited: false, active: false, expanded: true },
    delete: { inited: false, active: false, expanded: true }
  },
  zIndex: 0,
  priceIndex: 0,
  priceOffset: 3
};

var analysisOption = {
  key: 'analysis',
  title: "Analysis Manager",
  selected: null,
  active: false,
  points: [],
  pointsNum: 9,
  selFlag: true,
  hoverover: false,
  holder: false,
  width: 40,
  signals: [
    { visible: true, value: { x: 0, y: 0 }, labelPos: { x: 0, y: 0 }, color: '#21ba45', rate: 0, used: false, title: '1st Support' },
    { visible: true, value: { x: 0, y: 0 }, labelPos: { x: 0, y: 0 }, color: '#21ba45', rate: 0, used: false, title: '2nd Support' },
    { visible: true, value: { x: 0, y: 0 }, labelPos: { x: 0, y: 0 }, color: '#21ba45', rate: 0, used: false, title: 'Intermediate Support' },
    { visible: true, value: { x: 0, y: 0 }, labelPos: { x: 0, y: 0 }, color: '#21ba45', rate: 0, used: false, title: 'Downside Confirmation' },
    { visible: true, value: { x: 0, y: 0 }, labelPos: { x: 0, y: 0 }, color: '#db2828', rate: 0, used: false, title: 'Upside Confirmation' },
    { visible: true, value: { x: 0, y: 0 }, labelPos: { x: 0, y: 0 }, color: '#db2828', rate: 0, used: false, title: 'Intermediate Resistance' },
    { visible: true, value: { x: 0, y: 0 }, labelPos: { x: 0, y: 0 }, color: '#db2828', rate: 0, used: false, title: '2nd Resistance' },
    { visible: true, value: { x: 0, y: 0 }, labelPos: { x: 0, y: 0 }, color: '#db2828', rate: 0, used: false, title: '1st Resistance' },
    { visible: true, value: { x: 0, y: 0 }, labelPos: { x: 0, y: 0 }, color: '#5e5bd4', rate: 0, used: false, title: 'Pivot' }
  ],
  signal: { visible: false, start: 0, end: 0, color: 'red' },
  visible: true,
  extra: false,
  indicator: false,
  chartIndex: 0,
  curIndex: 0,
  zIndex: 0,
  priceIndex: 0,
  priceOffset: 7,
  isTrade: true
};

export const defaultOptions = {
  "ma": maOption,
  "ema": emaOption,
  "wma": wmaOption,
  "ichimoku": ichimokuOption,
  "ichimoku2c": ichimokuOption,
  "stochastic": stochasticOption,
  "macd": macdOption,
  "rsi": rsiOption,
  "atr": atrOption,
  "h-ray": hRayOption,
  "arrow": arrowOption,
  "ray": _.merge(_.cloneDeep(arrowOption), { start: { arrow: false, extend: false }, end: { arrow: false, extend: true } }),
  "t-line": _.merge(_.cloneDeep(arrowOption), { start: { arrow: false, extend: false }, end: { arrow: false, extend: false } }),
  "parallel": parallelChanelOption,
  "fibonacci": fibOption,
  "fib-extend": fibExtendOption,
  "rect": algebraOption,
  "callout": calloutOption,
  "trade": tradeOption,
  "signal": signalOption,
  "xabcd": xabcdOption,
  "cypher": cypherOption,
  "abcd": abcdOption,
  "tri_pattern": triPatternOption,
  "three_pattern": threeOption,
  "head_shoulder": headShoulderOption,
  "impulse_wave": impulseOption,
  "triangle_wave": triWaveOption,
  "triple_wave": tripleOption,
  "correction_wave": correctionOption,
  "double_wave": doubleOption,
  "analysis": analysisOption
};
