import * as _ from 'lodash';
import Swal from 'sweetalert2';

const $ = window.$;
const tradeType = {
  'scalping': 'Scalping',
  'day-trade': 'Day',
  'swing': 'Swing'
};
export class ChatWidget {
  _element = null;
  _chart_widget = null;
  _option = false;
  _happenedEditor = null;
  _expectEditor = null;
  _currentVal = null;
  _orgOption = null;
  constructor(chartWidget) {
    this._chart_widget = chartWidget;
    const options = chartWidget.options();
    this._option = options.chat;
    this._element = document.createElement('div');
    $(this._element).addClass('innerSlide');
    $(this._element).css('width', 320).css('height', '100%').css('overflow-y', 'auto');
  }

  getElement = () => {
    return this._element;
  }

  toggleChat = (flag, option) => {
    if (flag !== this._option.toggle || false) {
      this._option.toggle = flag;
      this._chart_widget._options.chat.toggle = flag;
      if (this._option.toggle) {
        this._orgOption = this._chart_widget.options().analyze;
        this._initContent(option);
        setTimeout(() => {
          this._initValues(option);
        }, 100);
        $(this._element).addClass('active');
      } else {
        $(this._element).html('');
        $(this._element).removeClass('active');
      }
      this._chart_widget._pan.resizeWidth(flag ? -320 : 320);
    }
  };

  _initContent = option => {
    const html = this._makeContents(option);
    $(this._element).html(html);
    if (option.key === 'analysis')
      this._addAnalysisEvent();
    else
      this._addTradeEvent();
  };

  _addAnalysisEvent = () => {

    const that = this;
    const panWidget = that._chart_widget._pan;
    $(this._element).find('.ui.rating')
      .rating({
        initialRating: 0,
        maxRating: 3,
        onRate: function (value) {
          var key = $(this).closest('.field').attr('key');
          let analyzeOption = that._chart_widget._pan.getShape('analysis');
          if (key === 'confidence') {
            that._chart_widget._options.analyze.confidence = value
          } else {
            analyzeOption.signals[parseInt(key)].rate = value;
            panWidget._pans[0].updateShape(analyzeOption);
            panWidget._pans[0].draw();
            that._chart_widget._options.analyze.values[parseInt(key)].rate = value;
          }
        }
      });
    $(this._element).find('.field[key="confidence"] .ui.rating').rating('set rating', that._chart_widget._options.analyze.confidence || 0)

    $(this._element).find('.ui.button.cancel').click(() => {
      that.toggleChat(false);
    });

    $(this._element).find('.ui.button.ok').click(() => {
      that.toggleChat(false);
      const temp = document.createElement('div');
      $(temp).html(that._happenedEditor.element.innerHTML);
      const happened = $(temp).find('a');
      for (let i = 0; i < happened.length; i++) {
        const oIdStr = $(happened[i]).attr('href');
        $(happened[i]).replaceWith(`<a class="post-binding" style="color: orange; cursor: pointer" ng-mouseover="highLightWithDesc($event)"` +
          ` ng-mouseout="highOutWithDesc($event)" options="${oIdStr}">${$(happened[i]).html()}</a>`);
      }
      const happendHtml = $(temp).html();
      $(temp).html('');
      $(temp).html(that._expectEditor.element.innerHTML);
      const expect = $(temp).find('a');
      for (let i = 0; i < expect.length; i++) {
        const oIdStr = $(expect[i]).attr('href');
        $(expect[i]).replaceWith(`<a class="post-binding" style="color: orange; cursor: pointer" ng-mouseover="highLightWithDesc($event)"` +
          ` ng-mouseout="highOutWithDesc($event)" options="${oIdStr}">${$(expect[i]).html()}</a>`);
      }
      const expectHtml = $(temp).html();
      $(temp).html('');
      const res = {
        happened: {
          text: that._happenedEditor.element.innerText,
          html: happendHtml
        },
        expected: {
          text: that._expectEditor.element.innerText,
          html: expectHtml
        }
      }

      if (that._chart_widget._options.controlling.overideEnable) {
        that._chart_widget.updateAnalyze(res);
      } else {
        that._chart_widget.saveChart('analysis', () => {
          that._chart_widget.updateAnalyze(res);
        });
      }
    });

    $(this._element).find('.form.happened .ui.button').click(() => {
      that._addLink(false);
    });

    $(this._element).find('.form.expect .ui.button').click(() => {
      that._addLink(true);
    });

    // syncronyze with chat
    $(this._element).find('.column input').change((e) => {
      var key = $(e.target).closest('.field').attr('key');
      const index = Number(key);
      let value = Number(e.target.value);
      const res = that._validValues(index, value);
      if (res.msg.length > 0) {
        value = res.value;
        $(e.target).val(res.value);
        Swal.fire('Invalid Typing', res.msg, 'error');
      }
      let analyzeOption = panWidget.getShape('analysis');
      const precision = this._chart_widget._options.topToolbar.currency.precision
      const chart = this._chart_widget._pan._pans[0]._component;
      const between = chart.axisY2[0].convertPixelToValue(0) - chart.axisY2[0].convertPixelToValue(30);
      if (index === 3 && analyzeOption.signals[0].value.y === 0) {
        analyzeOption.signals[0].value.y = parseFloat(Number(value - between).toFixed(precision));
        $(this._element).find('.field[key="0"] input').val(analyzeOption.signals[0].value.y);
      } else if (index === 4 && analyzeOption.signals[7].value.y === 0) {
        analyzeOption.signals[7].value.y = parseFloat(Number(value - between).toFixed(precision));
        $(this._element).find('.field[key="7"] input').val(analyzeOption.signals[7].value.y);
      } else {
        if (index === 0 && value < analyzeOption.signals[1].value.y) {
          analyzeOption.signals[1].value.y = parseFloat(Number(value - Math.abs(analyzeOption.signals[0].value.y - analyzeOption.signals[1].value.y)).toFixed(precision))
          $(this._element).find('.field[key="1"] input').val(analyzeOption.signals[1].value.y);
        }

        if (index === 7 && value > analyzeOption.signals[6].value.y) {
          analyzeOption.signals[6].value.y = parseFloat(Number(value + Math.abs(analyzeOption.signals[6].value.y - analyzeOption.signals[7].value.y)).toFixed(precision))
          $(this._element).find('.field[key="6"] input').val(analyzeOption.signals[6].value.y);
        }
        analyzeOption.signals[index].value.y = value;
      }      
      analyzeOption.signals[index].visible = true;
      panWidget._pans[0].updateShape(analyzeOption);
      panWidget._pans[0].draw();
      analyzeOption.signals.forEach((signal, index) => {
        this._chart_widget._options.analyze.values[index].value = signal.value.y;
      })
    });

    $(this._element).find('.ui.selection.dropdown').dropdown({
      onChange: (value) => {
        that._chart_widget._options.analyze.direction = value
      }
    }).dropdown('set selected', that._chart_widget._options.analyze.direction || 'up')
  };

  _addTradeEvent = () => {
    const that = this;
    const panWidget = that._chart_widget._pan;
    $(this._element).find('.ui.rating')
      .rating({
        initialRating: 0,
        maxRating: 3,
        onRate: function (value) {
          var key = $(this).attr('key');
          const option = that._chart_widget.options();
          let convictions = option.analyze.convictions ? option.analyze.convictions : [0, 0, 0];
          convictions[parseInt(key)] = value;
          that._chart_widget._options.analyze.convictions = convictions;
          const analyzeOption = panWidget.getShape('trade');
          analyzeOption.signals[parseInt(key)].rate = value;
          panWidget._pans[0].updateShape(analyzeOption);
          panWidget._pans[0].draw();
        }
      });

    $(this._element).find('.ui.button.cancel').click(() => {
      that._chart_widget._options.analyze = that._orgOption;
      that.toggleChat(false);
    });

    $(this._element).find('.ui.button.yellow').popup({
      inline: true,
      hoverable: true,
      position: 'top right'
    });

    $(this._element).find('.ui.button.ok').click(() => {
      that.toggleChat(false);
      const temp = document.createElement('div');
      $(temp).html(that._expectEditor.element.innerHTML);
      const expect = $(temp).find('a');
      for (let i = 0; i < expect.length; i++) {
        const oIdStr = $(expect[i]).attr('href');
        $(expect[i]).replaceWith(`<a class="post-binding" style="color: orange; cursor: pointer" ng-mouseover="highLightWithDesc($event)"` +
          ` ng-mouseout="highOutWithDesc($event)" options="${oIdStr}">${$(expect[i]).html()}</a>`);
      }
      const expectHtml = $(temp).html();
      $(temp).html('');

      // getting values
      const option = that._chart_widget.options();
      that._chart_widget._options.analyze.desc = expectHtml;
      that._chart_widget._options.analyze.category = option.topToolbar.currency.exchange;
      that._chart_widget._options.analyze.pair = option.topToolbar.currency.name;
      that._chart_widget._options.topToolbar.enableCurrency = false;
      that._chart_widget._options.topToolbar.showCollaUrl = false;
      that._chart_widget._options.topToolbar.enableSave = false;
      that._chart_widget._options.topToolbar.collaborate = {
        visible: false,
        enable: true,
        role: [1, 0],
        viewers: [],
        editors: []
      };
      let tradeOption = panWidget.getShape('trade');
      tradeOption.signal.visible = true;
      tradeOption.signal.createdAt = new Date().getTime();
      panWidget._pans[0].updateShape(tradeOption);
      const res = tradeOption.signals.map((signal, index) => {
        if (index === 0) {
          return Number(Number(signal.value.y).toFixed(option.topToolbar.currency.precision));
        } else {
          if (signal.visible && signal.value.y !== 0) {
            return Number(Number(tradeOption.signals[0].value.y + signal.value.y).toFixed(option.topToolbar.currency.precision));
          } else {
            return 0;
          }
        }
      });
      that._chart_widget._options.analyze.values = res;
      if (that._chart_widget._options.controlling.overideEnable) {
        that._chart_widget.updateAnalyze();
      } else {
        that._chart_widget.saveChart('signal', () => {
          that._chart_widget.updateAnalyze();
        });
      }
    });

    $(this._element).find('.form.desc .ui.button').click(() => {
      that._addLink(true);
    });

    const seed = Math.pow(10, this._chart_widget._options.topToolbar.currency.precision);
    $(this._element).find('.ui.dropdown').dropdown({
      onChange: (value, text, $choice) => {
        const key = $($choice).closest('.ui.dropdown').attr('key');
        panWidget.initPen();
        panWidget.closeAnalyzeTool(false);
        let analyzeOption = panWidget.getShape('trade');
        let analyze = that._chart_widget._options.analyze;
        if (key === 'status') {
          $(that._element).find('input[key="0"]').attr('disabled', value === 'Open');
          $(this._element).find('.pending-status').css('display', value === 'Pending' ? 'flex' : 'none');
          if (value === 'Open') {
            const val = Math.round(that._chart_widget._pan._finalPrice * seed) / seed;
            analyzeOption.signals[0].value.y = val;
            $(that._element).find('input[key="0"]').val(val);
            panWidget._pans[0].updateShape(analyzeOption);
            analyzeOption.signals.forEach((signal, index) => {
              let value = index > 0 ? (signal.value.y === 0 ? 0 : signal.value.y + analyzeOption.signals[0].value.y) : signal.value.y;
              $(that._element).find(`.form .field[key="${index}"] input`).val(Number(value).toFixed(that._chart_widget._options.topToolbar.currency.precision));              
            })
          }
          var res = analyzeOption.signals.map((o, index) => {
            let val = o.value.y;
            if (index > 0) val += analyzeOption.signals[0].value.y;
            val = Math.round(val * seed) / seed;
            return {
              value: o.value.y
            }
          });
          analyze.values = res;
          analyze.status = value;
          analyze.discardOption = value === 'Pending' ? 3 : 1;
        } else if (key === 'selFlag') {
          analyze.bs = value;
          value = (value === 'SELL');
          panWidget.updateTradeStatus(value);
        } else {
          analyze.discardOption = value.toLowerCase();
        }
        analyzeOption[key] = value;
        panWidget._pans[0].updateShape(analyzeOption);
        const flag = that._validTradeValues();
        if (!flag) {
          panWidget._pans[0].draw();
        }
      }
    });

    $(this._element).find('.ui.checkbox.trade-type').checkbox({
      onChecked: () => {
        const key = $(this._element).find('.ui.checkbox.checked').attr('key');
        that._chart_widget._options.analyze.tradeType = tradeType[key];
        let analyzeOption = panWidget.getShape('trade');
        analyzeOption.tradeType = key;
        panWidget._pans[0].updateShape(analyzeOption);
      }
    });

    $(this._element).find('.ui.checkbox.signal-type').checkbox({
      onChecked: () => {
        that._chart_widget._options.analyze.signal_type = true;
      },
      onUnchecked: () => {
        that._chart_widget._options.analyze.signal_type = false;
      }
    });

    $(this._element).find('input').on('change', function (event) {
      const key = parseInt($(event.target).attr('key'));
      if (isNaN(key)) return;
      const curVal = Number($(event.target).val());
      if (isNaN(curVal)) {
        Swal.fire('Error', 'Plase type correct number.', 'error');
      }
      const baseVal = Number($(that._element).find('input[key="0"]').val());
      const flag = that._validTradeValues(key);
      if (!flag) {
        let tradeOption = panWidget.getShape('trade');
        if (key > 0) {
          const val = curVal - baseVal;
          tradeOption.signals[key].value.y = val;
        } else {
          tradeOption.signals[0].value.y = curVal;
          const sl = Number($(that._element).find('input[key="1"]').val());
          const tp = Number($(that._element).find('input[key="2"]').val());
          tradeOption.signals[1].value.y = Number(sl - curVal).toFixed(that._chart_widget._options.topToolbar.currency.precision);
          tradeOption.signals[2].value.y = Number(tp - curVal).toFixed(that._chart_widget._options.topToolbar.currency.precision);
        }
        if (panWidget._pen.option && panWidget._pen.option.key === 'trade') {
          panWidget._pen.option = tradeOption;
        }
        panWidget._pans[0].updateShape(tradeOption);
        panWidget._pans[0].draw();
        const res = tradeOption.signals.map((o, index) => {
          let val = o.value.y;
          if (index > 0) val += tradeOption.signals[0].value.y
          val = Math.round(val * seed) / seed;
          return {
            value: Number(val).toFixed(that._chart_widget._options.topToolbar.currency.precision)
          }
        });
        that._chart_widget._options.analyze.values = res;
      }
    });
  }

  _initValues = (option) => {
    if (option.key === 'analysis') {
      this._happenedEditor = document.querySelector('trix-editor[key="happened"]').editor;
      this._expectEditor = document.querySelector('trix-editor[key="expect"]').editor;
    } else {
      this._expectEditor = document.querySelector('trix-editor').editor;
    }

    const that = this;
    const options = this._chart_widget.options();
    const divider = Math.pow(10, options.topToolbar.currency.precision);
    let currentVal = {};
    const chart = this._chart_widget._pan._pans[0]._component;
    const dataPoints = chart.options.data[0].dataPoints;
    for (let i = dataPoints.length - 1; i > 0; i--) {
      if (dataPoints[i].y.length > 0) {
        currentVal.y = dataPoints[i].y[3];
        currentVal.x = dataPoints[i].x;
        break;
      }
    }
    const val = Number(that._chart_widget._pan._finalPrice).toFixed(options.topToolbar.currency.precision);
    this._currentVal = {
      x: currentVal.x,
      y: parseFloat(val)
    };
    // const baseVal = Math.round(divider * currentVal.y) / divider;
    // initialize value from setting

    if (options.analyze) {
      if (options.analyze.type === 'analysis') {
        for (let i = 0; i < 8; i++) {
          $(that._element).find(`.form .field[key="${i}"] input`).val(options.analyze.values[i].value);
          $(that._element).find(`.form .field[key="${i}"] .ui.rating`).rating('set rating', options.analyze.values[i].rate);
        }
      } else {
        option.signals.forEach((signal, index) => {
          let value = index > 0 ? (signal.value.y === 0 ? 0 : signal.value.y + option.signals[0].value.y) : signal.value.y;
          $(that._element).find(`.form .field[key="${index}"] input`).val(Number(value).toFixed(options.topToolbar.currency.precision));
          $(that._element).find(`.form .ui.rating[key="${index}"]`).rating('set rating', options.analyze.values[index].rate);
        })
        // const cmpVal = Math.round(divider * option.signals[0].value.y) / divider;
        // if (baseVal != cmpVal) {
        //   option.status = 'Pending';
        // } else {
        //   option.status = 'Open';
        // }
        $(that._element).find('.ui.dropdown[key="discardOption"]').dropdown('set selected', option.status === 'Pending' ? 3 : 1);
        this._chart_widget._pan._pans[0].updateShape(option);
      }
    }

    if (option.key === 'trade') {
      $(this._element).find('.ui.dropdown[key="selFlag"]').dropdown('set selected', option.selFlag ? 'SELL' : 'BUY');
      $(this._element).find('.ui.dropdown[key="status"]').dropdown('set selected', option.status);
      $(this._element).find('.ui.dropdown[key="discardOption"]').dropdown('set selected', option.discardOption);

      $(this._element).find('.pending-status').css('display', option.status === 'Pending' ? 'flex' : 'none');
      const key = Object.keys(tradeType).find(key => (tradeType[key] === option.tradeType))
      $(this._element).find(`.ui.checkbox[key="${key}"]`).checkbox('set checked');
    }

    if (options.chat) {
      if (option.key === 'analysis') {
        const maxLen = this._happenedEditor.element.innerText.length;
        this._happenedEditor.setSelectedRange([0, maxLen]);
        if (options.chat.happened.html.length > 0) {
          this._happenedEditor.insertHTML(this.addHref(options.chat.happened.html));
        } else {
          this._happenedEditor.insertString(options.chat.happened.text);
        }

        const maxLen1 = this._expectEditor.element.innerText.length;
        this._expectEditor.setSelectedRange([0, maxLen1]);
        if (options.chat.expected.html.length > 0) {
          this._expectEditor.insertHTML(this.addHref(options.chat.expected.html));
        } else {
          this._expectEditor.insertString(options.chat.expected.text);
        }
      } else {
        if (options.chat.expected.html.length > 0) {
          const maxLen1 = this._expectEditor.element.innerText.length;
          this._expectEditor.setSelectedRange([0, maxLen1]);
          this._expectEditor.insertHTML(this.addHref(options.chat.expected.html));
        }
      }
      setTimeout(that._addHoverEvent, 200);
    }
  }

  addHref = (content) => {
    var div = document.createElement('div');
    $(div).html(content);
    const expect = $(div).find('a');
    for (let i = 0; i < expect.length; i++) {
      const oIdStr = $(expect[i]).attr('options');
      $(expect[i]).replaceWith(`<a href="${oIdStr}">${$(expect[i]).html()}</a>`);
    }
    const expectHtml = $(div).html();
    return expectHtml;
  }

  _addLink = (flag, checked = []) => {
    const that = this;
    let editor = this._happenedEditor;
    if (flag) editor = this._expectEditor;
    if (!editor) return;
    const range = editor.getSelectedRange();
    if (range[1] - range[0] <= 0) {
      Swal.fire('Invalid Selection', 'Please highlight the text in comments that you want linked to a chart object.', 'error');
    } else {
      this._chart_widget._pan.openObjectTree(true, oIds => {
        let doc = editor.getDocument();
        const strs = doc.toString();
        const selectedStrs = strs.substr(range[0], range[1] - range[0]);
        let shapeIds = {};

        oIds.forEach(element => {
          const ems = element.split(':');
          const sub = ems[1] ? ems[1] : '';
          shapeIds[ems[0]] = shapeIds[ems[0]] && shapeIds[ems[0]].length > 0 ? shapeIds[ems[0]] + ':' + sub : sub;
        });

        const finalKeys = Object.keys(shapeIds).map(key => (shapeIds[key].length > 0 ? key + ":" + shapeIds[key] : key));
        if (oIds.length > 0) {
          const html = `<a href="${finalKeys.join(',')}" key="comment">${selectedStrs}</a>`;
          editor.setSelectedRange(range);
          editor.insertHTML(html);
          if (!flag) {
            that._chart_widget._options.chat.happened = {
              text: editor.element.innerText,
              html: editor.element.innerHTML
            };
          } else {
            that._chart_widget._options.chat.expected = {
              text: editor.element.innerText,
              html: editor.element.innerHTML
            }
          }
          setTimeout(that._addHoverEvent, 200);
        }
      }, checked);
    }
  }

  _addHoverEvent = () => {
    const that = this;
    $(this._element).find('a').on('pointerenter', (event) => {
      that._chart_widget._pan.initPen();
      const key = $(event.target).attr('href');
      if (key && key.length > 0) {
        const keys = key.split(',');
        keys.forEach(oKey => {
          that._chart_widget._pan.hoveroverShape(oKey);
        })
      }
    }).on('pointerleave', (event) => {
      const key = $(event.target).attr('href');
      if (key && key.length > 0) {
        const keys = key.split(',');
        keys.forEach(oKey => {
          that._chart_widget._pan.hoveroutShape(oKey);
        });
      }
    }).on('click', (event) => {
      const key = $(event.target).attr('href');
      if (key && key.length > 0 && key !== "undefined") {
        const keys = key.split(',');
        const editorKey = $(event.target).closest('trix-editor').attr('key');
        const flag = editorKey === 'expect';
        const editor = flag? this._expectEditor: this._happenedEditor;
        // const htmls = editor.element.innerHTML;
        const text = editor.getDocument().toString();
        const seed = $(event.target).html();
        editor.setSelectedRange([text.indexOf(seed), text.indexOf(seed) + seed.length]);
        this._addLink(flag, keys);
      }
    })
  }

  _validValues = (key, value) => {
    let analyzeOption = this._chart_widget._pan.getShape('analysis');
    const options = this._chart_widget.options().analyze;
    if (isNaN(value)) return {
      value: options[key].value,
      msg: 'Invalid Value!'
    };

    if (key === 0 && value > this._currentVal.y) return {
      value: this._currentVal.y,
      msg: 'The 1st Support can not be greater than current value'
    };
    if (key === 7 && value < this._currentVal.y) return {
      value: this._currentVal.y,
      msg: 'The 1st Resistance can not be less than current value'
    };

    if (key === 1 && value > analyzeOption.signals[0].value.y) return {
      value: analyzeOption.signals[0].value.y,
      msg: 'The 2nd Support can not be greater than 1st support'
    }
    if (key === 6 && value < analyzeOption.signals[7].value.y) return {
      value: analyzeOption.signals[7].value.y,
      msg: 'The 2nd Resistance can not be less than 1st Resistance'
    }

    if (key === 2 && (value > this._currentVal.y)) return {
      value: Number(this._currentVal.y).toFixed(this._chart_widget.options().topToolbar.currency.precision),
      msg: 'The Intermediate Support have to be less than current price'
    }
    if (key === 5 && (value < this._currentVal.y)) return {
      value: Number(this._currentVal.y).toFixed(this._chart_widget.options().topToolbar.currency.precision),
      msg: 'The Intermediate Resistance have to be greater than current price'
    }

    if (key === 3) {
      if (value > this._currentVal.y) {
        return {
          value: this._currentVal.y,
          msg: 'The Downside Confirmation can not be greater than current value'
        }
      } else if (value < analyzeOption.signals[0].value.y) {
        return {
          value: analyzeOption.signals[0].value.y,
          msg: 'The Downside Confirmation can not be less than 1st Support'
        }
      }
    }
    if (key === 4) {
      if (value < this._currentVal.y) {
        return {
          value: this._currentVal.y,
          msg: 'The Upside Confirmation can not be less than current value'
        }
      } else if (value > analyzeOption.signals[7].value.y) {
        return {
          value: analyzeOption.signals[7].value.y,
          msg: 'The Upside Confirmation can not be greater than 1st Resistance'
        }
      }
    }

    // this._chart_widget._options.analyze[key] = value;

    return {
      value: 0,
      msg: ''
    };
  }

  _wrapText = obj => {
    const oIdStr = $(obj).attr('href');
    const oIds = oIdStr.split(',');
    $(obj).replaceWith(`<a class="post-binding" style="color: orange; cursor: pointer" ng-mouseover="highLightWithDesc($event)"` +
      ` ng-mouseout="highOutWithDesc($event)">${$(obj).html()}</a>`);
    return oIds;
  }

  _makeContents = (option) => {
    let html = `<div class="slideDiv ${option.key}">`;
    html += `<div class="add-idea-modal" id="add-idea" style="height:100%; overflow-y:scroll; overflow-x:hidden">
        <div class="signal-wrapper ui grid middle aligned ${option.advanced? 'advance-trade': 'basic-trade'}" style="padding: 5px; color: white; margin: 0px;">
          <div class="ui equal width center aligned row">
            <div class="column">
              <div class="ui form">
                <div class="field">
                  <button class="ui red labeled icon button cancel""><i class="close icon"></i>  Cancel</button>
                </div>
              </div>
            </div>
            <div class="column">
              <div class="field">
                <button class="ui green labeled icon button ok"><i class="checkmark icon"> </i> Save</button>
              </div>
            </div>
          </div>`;
    if (option.key === 'analysis') {
      html += `
          <div class="ui equal width row inverted">
            <div class="column">
              <div class="field" key="direction">
                <label for="" style="color: green">Direction:</label>
                <div class="ui floating labeled selection dropdown" style="min-width: 100%;">
                  <span class="text">Direction:</span>
                  <div class="menu">
                    <div class="item" data-value="up">
                      <i class="icon green long arrow alternate up" style="transform: scaleX(2) scaleY(0.8);"></i>
                      Up
                    </div>
                    <div class="item" data-value="neutral">
                      <i class="icon minus circle"></i>
                      Neutral
                    </div>
                    <div class="item" data-value="down">
                      <i class="icon red long arrow alternate down" style="transform: scaleX(2) scaleY(0.8);"></i>
                      Down
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="column">
              <div class="field" key="confidence">
                <label for=""  style="color: red">Confidence:</label>
                <div class="ui star rating" key="confidence" data-max-rating="3"></div>
              </div>
            </div>
          </div>
          <div class="ui equal width row inverted form support">
            <div class="column">
              <div class="field" key="0">
                <label for="" style="color: green">1st Support:</label>
                <input placeholder="Enter value" type="text" value="Support">
                <div class="ui star rating"></div>
              </div>
            </div>
            <div class="column">
              <div class="field" key="7">
                <label for=""  style="color: red">1st Resistance:</label>
                <input placeholder="Enter value" type="text" value="Resistance">
                <div class="ui star rating"></div>
              </div>
            </div>
          </div>
          <div class="ui equal width row inverted form support">
            <div class="column">
              <div class="field" key="1">
                <label for=""  style="color: green">2nd Support:</label>
                <input placeholder="Enter value" type="text" value="Support">
                <div class="ui star rating"></div>
              </div>
            </div>
            <div class="column">
              <div class="field" key="6">
                <label for=""  style="color: red">2nd Resistance:</label>
                <input placeholder="Enter value" type="text" value="Resistance">
                <div class="ui star rating"></div>
              </div>
            </div>
          </div>
          <div class="ui equal width row inverted form support">
            <div class="column">
              <div class="field" key="2">
                <label for="" style="color: green">Intermediate Support:</label>
                <input placeholder="Enter value" type="text" value="Support">
                <div class="ui star rating"></div>
              </div>
            </div>
            <div class="column">
              <div class="field" key="5">
                <label for="" style="color: red">Inter Resistance:</label>
                <input placeholder="Enter value" type="text" value="Resistance">
                <div class="ui star rating"></div>
              </div>
            </div>
          </div>
          <div class="ui equal width row inverted form support">
            <div class="column">
              <div class="field" key="3">
                <label for="" style="color: green">Down Confirmation:</label>
                <input placeholder="Enter value" type="text" value="Support">
                <div class="ui star rating"></div>
              </div>
            </div>
            <div class="column">
              <div class="field" key="4">
                <label for="" style="color: red">Upside Confirmation:</label>
                <input placeholder="Enter value" type="text" value="Resistance">
                <div class="ui star rating"></div>
              </div>
            </div>
          </div>
          <div class="ui equal width row inverted form happened">
            <div class="column">
              <div class="ui form">
                <div class="field">
                  <label style="color: #f2711c">What happened Previously?</label>
                  <trix-editor key="happened"></trix-editor>
                  <button class="ui yellow icon right floated button"  data-content="Highlight text and click to select chart object"><i class="linkify icon"></i></button>
                </div>                    
              </div>
            </div>
          </div>          
          <div class="ui equal width row inverted form expect">
            <div class="column">
              <div class="ui form">
                <div class="field">
                  <label style="color: #f2711c">What we can expect?</label>
                  <trix-editor key="expect"></trix-editor>
                  <button class="ui yellow icon right floated button"  data-content="Highlight text and click to select chart object"><i class="linkify icon"></i></button>
                </div>
              </div>
            </div>
          </div>
          `;
    } else {
      html += `
        <div class="ui equal width row">
          <div class="column">
            <label class="yellow">Trade Type?</label>
          </div>
        </div>
        <div class="ui equal width row">
          <div class="column">
            <div class="ui form">
              <div class="field">
                <div class="ui radio checkbox trade-type" key="scalping">
                  <input id="trade" type="radio" name="choices"/>
                  <label class="white">Scalping</label>
                </div>
              </div>
            </div>
          </div>
          <div class="column">
            <div class="ui form">
              <div class="field">
                <div class="ui radio checkbox trade-type" key="day-trade">
                  <input id="trade" type="radio" name="choices"/>
                  <label class="white">Day</label>
                </div>
              </div>
            </div>
          </div>
          <div class="column">
            <div class="ui form">
              <div class="field">
                <div class="ui radio checkbox trade-type" key="swing">
                  <input id="trade" type="radio" name="choices"/>
                  <label class="white">Swing</label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="ui equal width row">                       
          <div class="column">
            <div class="ui form">
              <div class="field">
                <label class="yellow">Buy/Sell?</label>
                <div class="ui selection dropdown" key="selFlag" style="min-width: 0px">
                  <input type="hidden" name="buysell" value=""/><i class="dropdown icon"></i>
                  <div class="default text">Buy/Sell</div>
                  <div class="menu">
                    <div class="item" data-value="BUY">BUY</div>
                    <div class="item" data-value="SELL">SELL</div>
                    <div class="item" data-value="Neutral">Neutral</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="column">
            <div class="ui form">
              <div class="field">
                <label class="yellow">Idea Status?</label>
                <div class="ui compact selection dropdown open-pending" key="status">
                  <input id="ideaStatus" type="hidden" name="status"/><i class="dropdown icon"></i>
                  <div class="default text">Status</div>
                  <div class="menu">
                    <div class="item" data-value="Open">Open</div>
                    <div class="item" data-value="Pending">Pending</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="ui equal width row pending-status">
          <div class="column">
            <div class="ui form">
              <div class="field">
                <label class="yellow">Discard Options</label>
                <div class="ui compact selection dropdown discard-option" key="discardOption">
                  <input id="discardOption" type="hidden" name="discardOption"/><i class="dropdown icon"></i>
                  <div class="default text"></div>
                  <div class="menu">
                    <div class="item" data-value="1">End of day (US market closes)</div>
                    <div class="item" data-value="2">End of 24 hours</div>
                    <div class="item" data-value="3">End of 3 days</div>
                    <div class="item" data-value="4">Manually discard</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>        
      `
      option.signals.forEach((signal, index) => {
        const flag = index > 2;
        html += `<div class="ui equal width row inverted form ${flag? 'advance': 'basic'}">
          <div class="column">
            <div class="field" key="${index}">
              <label class="yellow">${signal.title}</label>
              <input type="text" placeholder="${signal.title}" key="${index}"/>                
            </div>
          </div>
          <div class="column">
            <div class="field">
              <div class="ui star rating" key="${index}"></div>
            </div>
          </div>
        </div>`
      });
      html += `<div class="ui equal width row inverted form desc">
        <div class="column">
          <div class="ui form">
            <div class="field">
              <label style="color: #f2711c">Signal Description</label>
              <trix-editor key="desc"></trix-editor>
              <button class="ui yellow icon right floated button" data-content="Highlight text and click to select chart object"><i class="linkify icon"></i></button>
            </div>
          </div>
        </div>
      </div>`
    }
    html += '</div></div></div>';
    return html;
  }

  _validTradeValues = (key) => {
    if (key && key >= 0) {
      const curVal = parseFloat($(this._element).find(`input[key="${key}"]`).val());

      let option = this._chart_widget._pan.getShape('trade');
      let valY = JSON.parse(JSON.stringify(curVal));
      if (option.selFlag) {
        if (key == 1 && valY < option.signals[0].value.y) valY = option.signals[0].value.y;
        else if (key == 2 && valY > option.signals[0].value.y) valY = option.signals[0].value.y;
        else if (key == 3 || key == 5 || key == 6) {
          if (valY < option.signals[0].value.y + option.signals[2].value.y) valY = option.signals[0].value.y + option.signals[2].value.y;
          else if (valY > option.signals[0].value.y) valY = option.signals[0].value.y;
        } else if (key == 4) {
          if (valY < option.signals[0].value.y) valY = option.signals[0].value.y;
          else if (valY > option.signals[0].value.y + option.signals[1].value.y) valY = option.signals[0].value.y + option.signals[1].value.y;
        }
      } else {
        if (key == 1 && valY > option.signals[0].value.y) valY = option.signals[0].value.y;
        else if (key == 2 && valY < option.signals[0].value.y) valY = option.signals[0].value.y;
        else if (key == 3 || key == 5 || key == 6) {
          if (valY > option.signals[0].value.y + option.signals[2].value.y) valY = option.signals[0].value.y + option.signals[2].value.y;
          else if (valY < option.signals[0].value.y) valY = option.signals[0].value.y;
        } else if (key == 4) {
          if (valY > option.signals[0].value.y) valY = option.signals[0].value.y;
          else if (valY < option.signals[0].value.y + option.signals[1].value.y) valY = option.signals[0].value.y + option.signals[1].value.y;
        }
      }
      const flag = curVal != valY
      if (flag) {
        option.signals[key].value.y = key > 0 ? valY - option.signals[0].value.y : valY;
        if (this._chart_widget._pan._pen.option && this._chart_widget._pan._pen.option.key === 'trade') {
          this._chart_widget._pan._pen.option = option;
        }
        this._chart_widget._pan._pans[0].updateShape(option);
        this._chart_widget._pan._pans[0].draw();
        Swal.fire('Invalid Values', '', 'error');
        $(this._element).find(`input[key="${key}"]`).val(0)
      }
      return flag;
    } else {
      const entry = parseFloat($(this._element).find('input[key="0"]').val());
      const sl = parseFloat($(this._element).find('input[key="1"]').val());
      const tp = parseFloat($(this._element).find('input[key="2"]').val());
      let analyzeOption = this._chart_widget._pan.getShape('trade');
      const option = this._chart_widget.options();
      let flag = false;
      const divider = Math.pow(10, option.topToolbar.currency.precision);
      if (analyzeOption.selFlag) {
        if (sl < entry) {
          $(this._element).find('input[key="1"]').val(entry);
          flag = true;
          analyzeOption.signals[1].value.y = 0;
          analyzeOption.signals[4].value.y = 0;
        }
        if (tp > entry) {
          $(this._element).find('input[key="2"]').val(entry);
          flag = true;
          analyzeOption.signals[2].value.y = 0;
          analyzeOption.signals[3].value.y = 0;
          analyzeOption.signals[5].value.y = 0;
          analyzeOption.signals[6].value.y = 0;
        }
      } else {
        if (sl > entry) {
          $(this._element).find('input[key="1"]').val(entry);
          flag = true;
          analyzeOption.signals[1].value.y = 0;
          analyzeOption.signals[4].value.y = 0;
        }
        if (tp < entry) {
          $(this._element).find('input[key="2"]').val(entry);
          flag = true;
          analyzeOption.signals[2].value.y = 0;
          analyzeOption.signals[3].value.y = 0;
          analyzeOption.signals[5].value.y = 0;
          analyzeOption.signals[6].value.y = 0;
        }
      }

      if (flag) {
        if (this._chart_widget._pan._pen.option && this._chart_widget._pan._pen.option.key === 'trade') {
          this._chart_widget._pan._pen.option = analyzeOption;
        }
        this._chart_widget._pan._pans[0].updateShape(analyzeOption);
        this._chart_widget._pan._pans[0].draw();
        Swal.fire('Invalid Values', '', 'error');
        const that = this;
        analyzeOption.signals.forEach((signal, index) => {
          if (index > 0) {
            $(that._element).find(`input[key="${index}"]`).val(0);
          }
        })
      }
      return flag;
    }

  }

  updateValues = (values, key) => {
    const precision = this._chart_widget._options.topToolbar.currency.precision;
    if (key === 'trade') {
      values.forEach((signal, index) => {
        const value = index > 0 ? (signal.value.y === 0 ? 0 : signal.value.y + values[0].value.y) : signal.value.y;
        $(this._element).find(`input[key="${index}"]`).val(Number(value).toFixed(precision));
      });
      if (this._currentVal && this._currentVal.y) {
        const tradeOption = this._chart_widget._pan.getShape('trade');
        tradeOption.status = values[0].value.y != this._currentVal.y? 'Pending': 'Open';
        this._chart_widget._pan._pans[0].updateShape(tradeOption);
        $(this._element).find('.ui.dropdown[key="status"]').dropdown('set selected', tradeOption.status);
      }
    } else {
      values.forEach((item, index) => {
        $(this._element).find(`.field[key="${index}"] input`).val(Number(item.value.y).toFixed(precision));
      });
    }
  }

  changeStatus = (flag) => {
    $(this._element).find('.ui.dropdown[key="selFlag"]').dropdown('set selected', flag ? 'SELL' : 'BUY');
  }

  advanced = (flag) => {
    $(this._element).find('.signal-wrapper').removeClass('advance-trade basic-trade');
    $(this._element).find('.signal-wrapper').addClass(flag ? 'advance-trade' : 'basic-trade');
  }
}