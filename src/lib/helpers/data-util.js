import * as _ from 'lodash';
import  * as moment from 'moment';
import { getMiddle } from './render';

const source = ['open', 'high', 'low', 'close'];
export function CreateUUID() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

export function getIndicatorPoints (dataPoints, option, flag = false) {
  var result = null;
  if (option.key == "ma" || option.key == "ema" || option.key == "wma") {
    var tempPoints = [];
    var subsum = 0;
    var totalWeight = 0;
    var result = 0;
    for (var i = option.len - 1; i < dataPoints.length; i++) {
      var xIndex = i + option.offset;
      if (xIndex < 0) xIndex = 0;
      if (xIndex > dataPoints.length - 1) xIndex = dataPoints.length - 1;
      subsum = 0;
      totalWeight = 0;
      result = 0;
      for( var j= i + 1 - option.len; j<= i; j++) {
        if (option.key == 'ma')
          subsum += dataPoints[j].y[source.indexOf(option.source)];
        else if (option.key == 'wma') {
          subsum += (option.len - (i - j)) * dataPoints[j].y[source.indexOf(option.source)];
          totalWeight += option.len - (i - j);
        } else if (option.key == 'ema' && j > 0) {
          subsum += dataPoints[j-1].y[source.indexOf(option.source)];
        }
      }
      
      if (option.key == 'ma') result = subsum / option.len;
      else if (option.key == 'wma') result = subsum / totalWeight;
      else if (option.key == 'ema') {
        var pema = subsum/option.len;
        if (i < option.len )
          pema = dataPoints[i-1].y[source.indexOf(option.source)];
        result = (dataPoints[i].y[source.indexOf(option.source)] - pema) * (2/(option.len + 1));
        result += pema;
      }
      tempPoints.push({
        x: dataPoints[xIndex].x,
        y: result,
        markerSize: (i + 1) % 12 == 0? 10: 0
      });
    }
    result = tempPoints;
  } else if (option.key.indexOf("stochastic") >= 0) {
    var kPoints = [];
    var dPoints = [];
    var hlValue = null;
    var dValue = null;
    var subsum = 0;
    var startIndex = Math.max(option.kPeriod, option.dPeriod);
    for (var i = startIndex; i < dataPoints.length; i++) {
      hlValue = getMiddle(dataPoints, i, option.kPeriod, false);
      // dValue = getMiddle(data, i, option.dPeriod, false);
      kPoints.push({
        x: dataPoints[i].x,
        y: 100 * (dataPoints[i].y[3] - hlValue.low)/(hlValue.high - hlValue.low)
      });

      for (var j = 0; j < option.dPeriod; j++) {
        if (kPoints.length >= option.dPeriod) {
          subsum += kPoints[kPoints.length - option.dPeriod + j].y;
        } else {
          dValue = getMiddle(dataPoints, i-j, option.kPeriod, false);
          subsum += 100 * (dataPoints[i-j].y[3] - dValue.low)/(dValue.high - dValue.low);
        }
      }
      
      dPoints.push({
        x: dataPoints[i].x,        
        y: subsum / option.dPeriod
      });
      subsum = 0;
    }

    var lagging = kPoints.map(pp => ({
      x: pp.x,
      y: [option.lowBand.value, option.upperBand.value]
    }));
    var upper = kPoints.map(pp => ({
      x: pp.x,
      y: option.upperBand.value
    }));
    var lower = kPoints.map(pp => ({
      x: pp.x,
      y: option.lowBand.value
    }));
    result = [dPoints, lagging, upper, lower, kPoints];
  } else if (option.key == "macd") {
    var fast_ma = getIndicatorPoints(dataPoints, {
      key: option.sma_source? 'ma': 'ema',
      offset: 0,
      len: option.fast_length,
      source: option.source
    });

    var slow_ma = getIndicatorPoints(dataPoints, {
      key: option.sma_source? 'ma': 'ema',
      offset: 0,
      len: option.slow_length,
      source: option.source
    });

    var macd_length = Math.min(fast_ma.length, slow_ma.length);
    var macd = [];
    var tempMacd = fast_ma.length - slow_ma.length > 0? slow_ma: fast_ma;
    var macdVals = [];
    var macdVal = 0;
    for (var i = 1; i <= macd_length; i++) {
      macdVal = fast_ma[fast_ma.length - i].y - slow_ma[slow_ma.length - i].y;
      if (!isNaN(macdVal))
        macdVals.push(fast_ma[fast_ma.length - i].y - slow_ma[slow_ma.length - i].y);
      macd.push({
        x: tempMacd[tempMacd.length - i].x,
        y: macdVal,
        markerSize: (i + 1) % 12 == 0? 5: 0
      });
    }

    macd.reverse();

    // calculating signal
    var signals = [];
    var subsum = 0;
    var result = 0;
    var signalVals = [];
    for (var i = option.signal_length - 1; i < macd.length; i++) {
      subsum = 0;
      totalWeight = 0;
      result = 0;
      for( var j= i + 1 - option.signal_length; j<= i; j++) {
        if (option.sma_signal) {
          subsum += macd[j].y;
        } else {
          if (j > 0)
            subsum += macd[j-1].y;
        }
      }
      
      if (option.sma_signal) result = subsum / option.signal_length;
      else {
        var pema = subsum/option.signal_length;
        if (i < option.signal_length )
          pema = macd[i-1].y;
        result = (macd[i].y - pema) * (2/(option.signal_length + 1));
        result += pema;
      }
      if (!isNaN(result))
        signalVals.push(result);
      signals.push({
        x: macd[i].x,
        y: result,
        markerSize: (i + 1) % 12 == 0? 10: 0
      });
    }
    // signals.reverse();
    var hist_length = Math.min(macd.length, signals.length);
    var tempHist = macd.length > signals.length? signals: macd;
    var hist = [];
    var histVal = 0;
    var color = '';
    for (var k = 1; k <= hist_length; k++) {
      histVal = macd[macd.length - k].y - signals[signals.length - k].y;
      color = histVal >= 0? option.histogram.color[0]: option.histogram.color[2];
      if (hist.length > 0) {
        color = histVal >= 0? (hist[hist.length - 1].y < histVal? option.histogram.color[0]: option.histogram.color[1]):(hist[hist.length - 1].y < histVal? option.histogram.color[2]: option.histogram.color[3]);
      }
      hist.push({
        x: tempHist[tempHist.length - k].x,
        y: isNaN(histVal)? null: histVal ,
        color: color
      });
    }

    hist.reverse();
    signals.reverse();
    macd.reverse();

    if (flag) {
      result= {
        minVal: Math.min(...macdVals, ...signalVals),
        maxVal: Math.max(...macdVals, ...signalVals),
        points: [hist, signals, macd]
      };
    } else {
      result = [hist, signals, macd];
    }
  } else if (option.key == "rsi") {
    var gain = [];
    var loss = [];
    var change = 0;
    var sourceIndex = source.indexOf(option.source);
    var dTemps = [];
    for(var i = 1; i < dataPoints.length; i++) {
      change = dataPoints[i].y[sourceIndex] - dataPoints[i-1].y[sourceIndex];
      gain.push(change >= 0? change: 0);
      loss.push(change <0? Math.abs(change): 0);
      dTemps.push(dataPoints[i].x);
    }

    var tempPoints = [];
    var gainSum = 0;
    var lossSum = 0;
    var result = 0;
    let upperPoints = [];
    let lowerPoints = [];
    let laggingPoints = [];
    for (var i = option.len - 1; i < gain.length; i++) {
      gainSum = 0;
      lossSum = 0;
      result = 0;
      for( var j= i + 1 - option.len; j<= i; j++) {
        gainSum += gain[j-1];
        lossSum += loss[j-1];
      }
      
      var gainPema = gainSum/option.len;
      var lossPema = lossSum/option.len;
      if (i < option.len ) {
        gainPema = gain[i-1];
        lossPema = loss[i-1];
      }
      
      var avgGain = (gain[i] - gainPema) * (2/ (option.len + 1)) + gainPema;
      var avgLoss = (loss[i] - lossPema) * (2/ (option.len + 1)) + lossPema;
      var rs = avgGain/avgLoss;
      var rsi = 100 - (100/(1 + rs));
      tempPoints.push({
        x: dTemps[i],
        y: rsi,
        markerSize: (i + 1) % 12 == 0? 10: 0
      });

      upperPoints.push({
        x: dTemps[i],
        y: option.upperBand.value
      });

      lowerPoints.push({
        x: dTemps[i],
        y: option.lowBand.value
      });

      laggingPoints.push({
        x: dTemps[i],
        y: [option.lowBand.value, option.upperBand.value]
      });      
    }
    
    const tPoints = JSON.parse(JSON.stringify(dataPoints));
    tPoints.reverse();
    const len = tPoints.findIndex(dd => (dd.y && dd.y.length > 0));
    tempPoints = tempPoints.slice(0, tempPoints.length - len);
    tempPoints = tempPoints.concat(dataPoints.slice(len));
    result = [upperPoints, lowerPoints, laggingPoints, tempPoints];
  } else if (option.key == 'atr') {
    var tempPoints = [];
    for (var i = option.len; i < dataPoints.length; i++) {
      subsum = 0;
      totalWeight = 0;
      var value = 0;
      if (dataPoints[i].y.length < 1) {
        tempPoints.push({
          x: dataPoints[i].x,
          y: null,
          markerSize: (i + 1) % option.len == 0? 10: 0
        });  
        continue;
      }
      for( var j= i + 1 - option.len; j<= i; j++) {
        if (dataPoints[j - 1].y.length < 1) continue;
        const high = dataPoints[j].y[1],
          low = dataPoints[j].y[2],
          Cp = dataPoints[j-1].y[3];
        subsum += Math.max(high - low, Math.abs(high - Cp), Math.abs(low - Cp));
        // if (option.key == 'ma')
        //   subsum += dataPoints[j].y[source.indexOf(option.source)];
        // else if (option.key == 'wma') {
        //   subsum += (option.len - (i - j)) * dataPoints[j].y[source.indexOf(option.source)];
        //   totalWeight += option.len - (i - j);
        // } else if (option.key == 'ema' && j > 0) {
        //   subsum += dataPoints[j-1].y[source.indexOf(option.source)];
        // }
      }
      value = subsum / option.len;
      tempPoints.push({
        x: dataPoints[i].x,
        y: value > 0? value: null,
        markerSize: (i + 1) % option.len == 0? 10: 0
      });
    }
    result = tempPoints;
  }

  return result;
}

export function MACDIndicator (dataPoints, option) {
  var result = getIndicatorPoints(dataPoints, option, true);

  var histOption = {
    type: option.histogram.type,
    axisYType: "secondary",
    objectType: 'macd-indicator',
    cursor: "pointer",
    lineThickness: 1,
    markerType: 'none',
    color: option.histogram.color[0],
    lineColor: option.histogram.color[0],
    parentIndex: 2,
    childIndex: [],
    labelIndex: [],
    dataPoints: result.points[0],
    toolTipContent: null,
    visible: option.histogram.visible,
    // xValueType: 'dateTime'
  };

  var signalOption = {
    type: option.signal.type,
    axisYType: "secondary",
    objectType: 'macd-indicator',
    objectSubType: 'signal',
    cursor: "pointer",
    lineThickness: option.signal.lineThickness,
    markerType: 'none',
    lineColor: option.signal.color,
    color: option.signal.color,
    parentIndex: 2,
    childIndex: [],
    labelIndex: [],
    dataPoints: result.points[1],
    toolTipContent: null,
    visible: option.signal.visible,
    // xValueType: 'dateTime'
  };

  var macdOption = {
    type: option.macd.type,
    axisYType: "secondary",
    objectType: 'macd-indicator',
    objectSubType: 'macd',
    cursor: "pointer",
    lineThickness: option.macd.lineThickness,
    markerType: 'none',
    lineColor: option.macd.color,
    color: option.macd.color,
    parentIndex: 2,
    childIndex: [0, 1],
    labelIndex: [],
    dataPoints: result.points[2],
    toolTipContent: null,
    visible: option.macd.visible,
    // xValueType: 'dateTime'
  };

  option.label = "MACD (" + option.fast_length + ", " + option.slow_length + ", " + option.source + ", " + option.signal_length + ")";
  option.chartData = [histOption, signalOption, macdOption];
  option.minimum = result.minVal;
  option.maximum = result.maxVal;
  return {option: option, charts: [histOption, signalOption, macdOption]};
};

export function RSIIndicator (dataPoints, option, flag = true) {
  var calcPoints = getIndicatorPoints(dataPoints, option);

  var rsiOption = {
    type: 'spline',
    axisYType: "secondary",
    objectType: 'rsi-indicator',
    objectSubType: 'rsi',
    cursor: "pointer",
    lineThickness: option.rsi.lineThickness,
    markerType: 'none',
    markerColor: '#ccc',
    markerBorderColor: '#888',
    markerBorderThickness: 1,
    lineColor: option.rsi.lineColor,
    parentIndex: 0,
    childIndex: [0, 1, 2],
    labelIndex: [],
    dataPoints: calcPoints[3],
    toolTipContent: null,
    visible: option.visible && option.rsi.visible,
    // xValueType: 'dateTime'
  };

  var upperOption = {
    type: 'line',
    axisYType: "secondary",
    objectType: 'rsi-indicator',
    objectSubType: 'upperBand',
    cursor: "pointer",
    lineThickness: option.upperBand.lineThickness,
    lineDashType: option.upperBand.lineDashType,
    markerType: 'none',
    markerColor: '#ccc',
    markerBorderColor: '#888',
    markerBorderThickness: 0,
    lineColor: option.upperBand.lineColor,
    parentIndex: 3,
    childIndex: [],
    labelIndex: [],
    dataPoints: calcPoints[0],
    toolTipContent: null,
    visible: option.visible && option.upperBand.visible,
    // xValueType: 'dateTime'
  };

  var lowerOption = {
    type: 'line',
    axisYType: "secondary",
    objectType: 'rsi-indicator',
    objectSubType: 'lowBand',
    cursor: "pointer",
    lineThickness: option.lowBand.lineThickness,
    lineDashType: option.lowBand.lineDashType,
    markerType: 'none',
    markerColor: '#ccc',
    markerBorderColor: '#888',
    markerBorderThickness: 0,
    lineColor: option.lowBand.lineColor,
    parentIndex: 3,
    childIndex: [],
    labelIndex: [],
    dataPoints: calcPoints[1],
    toolTipContent: null,
    visible: option.visible && option.lowBand.visible,
    // xValueType: 'dateTime'
  };

  var laggingOption = {
    type: 'rangeArea',
    axisYType: "secondary",
    objectType: 'rsi-indicator',
    objectSubType: 'lagging',
    cursor: "pointer",
    markerType: 'none',
    markerColor: '#ccc',
    markerBorderColor: '#888',
    markerBorderThickness: 0,
    color: option.lagging.color,
    lineColor: 'transparent',
    fillOpacity: option.lagging.opacity,
    parentIndex: 3,
    childIndex: [],
    labelIndex: [],
    dataPoints: calcPoints[2],
    toolTipContent: null,
    visible: option.visible && option.lagging.visible,
    // xValueType: 'dateTime'
  };

  option.label = "RSI (" + option.len + ", " + option.source + ")";
  return {option: option, charts: [upperOption, lowerOption, laggingOption, rsiOption]};    
};

export function ATRIndicator (dataPoints, option, flag = true) {
  var calcPoints = getIndicatorPoints(dataPoints, option);

  var atrOption = {
    type: 'spline',
    axisYType: "secondary",
    objectType: 'rsi-indicator',
    objectSubType: 'rsi',
    cursor: "pointer",
    lineThickness: option.signal.lineThickness,
    markerType: 'none',
    markerColor: '#ccc',
    markerBorderColor: '#888',
    markerBorderThickness: 1,
    lineColor: option.signal.color,
    parentIndex: 0,
    childIndex: [0, 1, 2],
    labelIndex: [],
    dataPoints: calcPoints,
    toolTipContent: null,
    visible: option.visible && option.signal.visible,
    // xValueType: 'dateTime'
  };

  option.label = "ATR (" + option.len + ", " + option.source + ")";
  return {option: option, charts: [atrOption]};    
};

/**
 * @function indicatorStochastic
 * @description draw stochastic indicator
 * @param: data, key, startIndex, flag 
 */
export function StochasticIndicator (data, setting, resolution, flag = true) {

  var kPoints = [];
  var dPoints = [];
  var hlValue = null;
  var dValue = null;
  var subsum = 0;
  for (var i = 0; i < data.length; i++) {
    hlValue = getMiddle(data, i, setting.kPeriod, false);
    kPoints.push({
      x: data[i].x,
      y: 100 * (data[i].y[3] - hlValue.low)/(hlValue.high - hlValue.low),
      markerSize: (i + 1)%12 == 0? 10: 0
    });

    for (var j = 0; j < setting.dPeriod; j++) {
      if (kPoints.length >= setting.dPeriod) {
        subsum += kPoints[kPoints.length - setting.dPeriod + j].y;
      } else {
        dValue = getMiddle(data, i-j, setting.kPeriod, false);
        if (data[i-j] && data[i-j].y.length > 0)
          subsum += 100 * (data[i-j].y[3] - dValue.low)/(dValue.high - dValue.low);
      }
    }
    
    dPoints.push({
      x: data[i].x,      
      y: subsum / setting.dPeriod
    });
    subsum = 0;
  }  

  // for (let i = 0; i < 110; i++) {
  //   kPoints.push({
  //     x: kPoints[kPoints.length - 1].x + resolution *1000,
  //     y: null
  //   });
  // }

  var kOption = {
    type: 'spline',
    axisYType: "secondary",
    objectType: 'stochastic-indicator',
    objectSubType: 'kLine',
    cursor: "pointer",
    lineThickness: setting.kLine.lineThickness,
    markerType: 'none',
    markerSize: 0,
    markerColor: '#ccc',
    markerBorderColor: '#888',
    markerBorderThickness: 1,
    lineColor: setting.kLine.lineColor,
    parentIndex: 0,
    childIndex: [],
    labelIndex: [],
    dataPoints: kPoints,
    toolTipContent: null,
    visible: setting.visible && setting.kLine.visible
  };

  var dOption = {
    type: 'spline',
    axisYType: "secondary",
    objectType: 'stochastic-indicator',
    objectSubType: 'dLine',
    cursor: "pointer",
    lineThickness: setting.dLine.lineThickness,
    markerType: 'none',
    markerSize: 1,
    markerColor: '#ccc',
    markerBorderColor: '#888',
    markerBorderThickness: 1,
    lineColor: setting.dLine.lineColor,
    parentIndex: 0,
    childIndex: [],
    labelIndex: [],
    dataPoints: dPoints,
    toolTipContent: null,
    visible: setting.visible && setting.dLine.visible,
    xValueType: 'number'
  };

  const upperLinePoints = kPoints.map(pp => ({
    x: pp.x,
    y: setting.upperBand.value
  }));
  var upperLineOption = {
    type: 'line',
    axisYType: "secondary",
    objectType: 'stochastic-indicator',
    objectSubType: 'upperBand',
    cursor: "pointer",
    lineThickness: setting.upperBand.lineThickness,
    markerType: 'none',
    markerSize: 1,
    markerColor: '#ccc',
    markerBorderColor: '#888',
    markerBorderThickness: 1,
    lineColor: setting.upperBand.lineColor,
    lineDashType: setting.upperBand.lineDashType,
    parentIndex: 0,
    childIndex: [],
    labelIndex: [],
    dataPoints: upperLinePoints,
    toolTipContent: null,
    visible: setting.visible && setting.upperBand.visible
  }

  const lagPoints = kPoints.map(pp => ({
    x: pp.x,
    y: [setting.lowBand.value, setting.upperBand.value]
  }));
  var lagOption = {
    type: 'rangeArea',
    axisYType: "secondary",
    objectType: 'stochastic-indicator',
    objectSubType: 'lagging',
    cursor: "pointer",
    color: setting.lagging.color,
    fillOpacity: setting.lagging.opacity,
    lineColor: 'transparent',
    parentIndex: 0,
    childIndex: [],
    labelIndex: [],
    dataPoints: lagPoints,
    visible: setting.visible && setting.lagging.visible
  }

  const lowLinePoints = kPoints.map(pp => ({
    x: pp.x,
    y: setting.lowBand.value
  }));
  var lowLineOption = {
    type: 'line',
    axisYType: "secondary",
    objectType: 'stochastic-indicator',
    objectSubType: 'lowBand',
    cursor: "pointer",
    lineThickness: setting.lowBand.lineThickness,
    markerType: 'none',
    markerSize: 1,
    markerColor: '#ccc',
    markerBorderColor: '#888',
    markerBorderThickness: 1,
    lineColor: setting.lowBand.lineColor,
    lineDashType: setting.lowBand.lineDashType,
    parentIndex: 0,
    childIndex: [],
    labelIndex: [],
    dataPoints: lowLinePoints,
    toolTipContent: null,
    visible: setting.visible && setting.lowBand.visible
  }

  setting.label = 'Stochastic ' + '( ' + setting.kPeriod + ', ' + setting.dPeriod + ', ' + setting.smooth +' )';
  setting.chartData = [dOption, lagOption, upperLineOption, lowLineOption, kOption];
  return {option: setting, charts: [dOption, lagOption, upperLineOption, lowLineOption, kOption]};
};

export function hexToRGB (hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
