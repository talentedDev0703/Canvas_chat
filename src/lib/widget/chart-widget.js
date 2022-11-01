import * as _ from 'lodash';
import Swal from 'sweetalert2';
import {
  ChartModel
} from '../model/chart-model';
import {
  SidebarWidget
} from './left-sidebar';
import {
  TopToolbarWidget
} from './top-toolbar';
import {
  PanWidget
} from './pan-widget';
import {
  ChatWidget
} from './chat-widget';
import {
  colorPalette,
  leftTools,
  CIntervals
} from '../model/constants';
import {
  CreateUUID
} from '../helpers/data-util';
import '../assets/colorPicker/js/colorpicker';
import '../assets/colorPicker/js/eye';


const $ = window.$;
export class ChartWidget {
  _options = null;
  // _model = null;
  _element = null;
  _overlayer = null;
  _sidebar = null;
  _toptoolbar = null;
  _pan = null;
  _loaded = false;
  _loadTimer = null;
  _colorPickers = [];
  _chat = null;
  _socket = null;
  _priceSocket = null;
  _room_id = null;
  _favorites = [];
  _firstLoading = false;
  _layout_id = null;
  _layout = null;
  _socket_transaction_id = null;
  constructor(container, options) {
    this._options = options;
    // render text style div
    const textDiv = document.createElement('div');
    $(textDiv).attr('id', 'get_font_width').appendTo($('body'));
    // render html elements
    this._element = $(container).find('.tfa-wrapper').length > 0 ? $(container).find('.tfa-wrapper') : document.createElement('div');
    $(this._element).addClass('tfa-wrapper');
    const spinner = document.createElement('div');
    $(spinner).addClass('spinner');
    this._overlayer = document.createElement('div');
    $(this._overlayer).addClass('tfa-chart-overlay').append(spinner).appendTo(this._element);
    $(this._element).appendTo(container);
    let width = options.width;
    let height = options.height;

    if (width === 0) {
      const containerRect = container.getBoundingClientRect();
      width = containerRect.width;
    }
    if (height === 0) {
      const containerRect = container.getBoundingClientRect();
      height = containerRect.height;
    }

    width = Math.max(70, width);
    height = Math.max(350, height);

    this.resize(height, width);
    this._socket_transaction_id = CreateUUID();
    const that = this;
    this._layout = {
      id: null,
      name: that._options.topToolbar.currency.name + ' ' + that._options.ownerName,
      ownerId: that._options.writerId,
      symbol: that._options.topToolbar.currency,
      interval: that._options.topToolbar.interval,
      theme: {
        mainType: that._options.pan.mainType,
        light: that._options.pan.light,
        dark: that._options.pan.dark,
        theme: that._options.pan.theme
      },
      domain: this._options.domain,
      shapes: {},
      collaborate: that._options.collaborate,
      isDefault: false,
      isFavorite: false
    };
    if (this._options.writerId && parseInt(this._options.writerId) > 0) {
      // this.loaded(false);
      $.get({
        url: `${options.hostUrl}/api/layouts/default?userId=${options.writerId}&theme=${options.defaultTheme}&domainName=${options.domain}`,
        dataType: "json",
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", options.token);
        },
        success: res => {
          if (res.error) {
            _.merge(that._options, {
              _id: null
            });
            that._initialize();
          } else if (res.status.toLowerCase() === 'ok' && res.layout) {
            that._layout_id = res.layout._id;
            // that._options.topToolbar.currency = res.layout.symbol;
            that._options.topToolbar.interval = res.layout.interval;
            that._options.name = res.layout.name;
            that._options.collaborate = res.layout.collaborate;
            that._layout = res.layout;
            if (!that._layout.shapes) {
              that._layout.shapes = {};
            }
            const layoutShapes = res.layout.shapes && res.layout.shapes[that._options.topToolbar.currency.name];
            _.merge(that._options.pan, {
              ...res.layout.theme,
              shape: layoutShapes || [],
              // viewport: {
              //   x: res.layout.timeRange,
              //   y: that._options.pan.viewport.y
              // }
            });

            if (!that._options.topToolbar.interval) {
              if (that._options.topToolbar.intervals.length > 0) {
                that._options.topToolbar.interval = CIntervals.find(interval => (interval.label === that._options.topToolbar.intervals[0]));
              } else {
                that._options.topToolbar.interval = CIntervals[4];
              }
            }
            const shapes = _.cloneDeep(that._options.defaultShapes);
            if (that._options.controlling.defaultShape && shapes.length > 0) {
              that._options.pan.shape = shapes;
            }
            const viewport = _.cloneDeep(that._options.defaultViewports);
            if (that._options.controlling.defaultViewport) {
              let tempViewport = {
                x: [],
                y: []
              }
              if (viewport && viewport.x && viewport.x[0]) {
                tempViewport.x = viewport.x
              }

              if (viewport && viewport.y && viewport.y[0]) {
                tempViewport.y = viewport.y
              }
              that._options.pan.viewport = tempViewport;
            }
            that._initialize();
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
    } else {
      this._initialize();
    }
  }

  _initialize = () => {
    this._firstLoading = true;
    // this._loaded = false;
    this.controlOptions();
    this._chat = new ChatWidget(this);
    $(this._element).append(this._chat.getElement());

    this._sidebar = new SidebarWidget(this);

    const wrapper = document.createElement('div');
    $(wrapper).css('position', 'relative');
    $(wrapper).append(this._sidebar.getElement());

    this._toptoolbar = new TopToolbarWidget(this);
    const panWrapper = document.createElement('div');
    $(panWrapper).addClass('my-pusher'); //.css('width', width - 62);
    $(panWrapper).append(this._toptoolbar.getElement());

    this._pan = new PanWidget(this);
    $(panWrapper).append(this._pan.getElement());

    $(wrapper).append(panWrapper);
    $(wrapper).appendTo(this._element);

    // this._pan.loadData();
    this._drawToolbars();

    this._priceSocket = this._options.priceSocket || null;
    // this._priceSocketInit();
    if (this._options.socket.enable) {
      if (!this._socket) {
        this._socket = this._options.socket.instance;
        this._socketInit();
      }
      this._joinChartSocket();
    }

    $(this._sidebar._element).find('.item').popup({
      position: 'left center',
      className: {
        popup: 'ui popup custom-popup'
      }
    });

    if (this._pan) {
      this._pan.getTemplates();
    }

    $('.tfa-chart-wrapper').removeClass('tfa-cursor-crosshair tfa-cursor-arrow tfa-cursor-dot');
    $('.tfa-chart-wrapper').addClass(`tfa-cursor-${this._sidebar._gSidebars[0].selectedKey}`);
  }

  renderChart = () => {

  }

  options = () => {
    return this._options;
  }

  destroy = () => {
    this._pan.destroy();
    if (this._pan) {
      delete this._pan;
    }

    $(this._element).remove();
    $('.tfa-chart-setting-dialog').remove();
  }

  resize = (height, width) => {
    const offsetW = width - this._options.width;
    const offsetH = height - this._options.height;
    this._options.width = width;
    this._options.height = height;
    $(this._element).css('height', height);
    $(this._element).css('width', width);
    $(this._overlayer).css('width', width).css('height', height);

    if (this._pan) {
      this._pan._pans.forEach(pan => {
        if (pan._containerId == 'primary_chart') {
          pan._height = pan._height + offsetH;
        }
      });
      this._pan.resizeWidth(offsetW);
    }
  }

  loaded = (flag, change = true) => {
    this._loaded = flag;
    if (change) {
      $(this._element).find('.tfa-chart-overlay').css('display', flag ? 'none' : 'block');
    }
    // if (this._loaded && this._options.callFn && this._options.callFn.loaded) {
    //   this._options.callFn.loaded(this._options._id);
    // }
    if (!this._loaded && this._pan) {
      this._pan._feedEnable = false;
    }
  }

  loadChart = (chartOption) => {
    this._firstLoading = true
    // const shapes = _.cloneDeep(this._options.defaultShapes);
    // delete this._options.pan;
    this._options = _.merge(this._options, chartOption);
    // this._options = chartOption;
    if (!chartOption.pan.shape || chartOption.pan.shape.length < 1) {
      this._options.pan.shape = [];
    }

    if (!this._options.topToolbar.interval) {
      if (this._options.topToolbar.intervals.length > 0) {
        this._options.topToolbar.interval = CIntervals.find(interval => (interval.label === this._options.topToolbar.intervals[0]));
      } else {
        this._options.topToolbar.interval = CIntervals[4];
      }
    }
    // if (this._options.controlling.defaultShape && shapes.length > 0) {
    //   this._options.pan.shape = shapes;
    // }
    this.controlOptions();
    if (this._options.socket.enable) {
      // if (!this._socket) {
      this._socket = this._options.socket.instance;
      this._socketInit();
      // }
      this._joinChartSocket();
    }
    this._pan.destroy();
    this._toptoolbar.reload(false);
    this._pan._init(true);
  }

  saveChart = (type, cb) => {
    this.loaded(false);
    const that = this;
    const option = this.options();
    var reqOptions = _.cloneDeep(option);
    delete reqOptions.hostUrl;
    delete reqOptions.candidators;
    delete reqOptions.chat;
    delete reqOptions.enableNewChart;
    delete reqOptions.orgDomain;
    if (reqOptions.pan && reqOptions.pan.customBreaks) {
      delete reqOptions.pan.customBreaks
    }

    const minViewport = this._pan._pans[0]._component.axisX[0].get('viewportMinimum');
    const maxViewport = this._pan._pans[0]._component.axisX[0].get('viewportMaximum');
    const minViewportY = this._pan._pans[0]._component.axisY2[0].get('viewportMinimum');
    const maxViewportY = this._pan._pans[0]._component.axisY2[0].get('viewportMaximum');
    reqOptions.pan.viewport = {
      x: [parseInt(minViewport), parseInt(maxViewport)],
      y: [minViewportY, maxViewportY],
    }
    this._pan._viewport = reqOptions.pan.viewport;
    const shapes = option.pan.shape.map(shape => {
      if (['trade', 'analysis'].indexOf(shape.key) >= 0) {
        shape.comment = shape.ownerId.toString() !== option.ownerId.toString();
      }
      return shape;
    });
    reqOptions.pan.shape = shapes;
    if (reqOptions.name.length <= 0)
      reqOptions.name = `${option.topToolbar.currency.name}_${option.ownerName}`;

    if (type) reqOptions.type = type;

    if (type === 'signal') {
      this._pan.takeSnapshotImage((imageUrl) => {
        postSave({
          data: JSON.stringify(reqOptions),
          imageUrl: imageUrl
        });
      }, true);
    } else {
      postSave({
        data: JSON.stringify(reqOptions)
      });
    }


    function postSave(data) {
      $.post({
        url: option.hostUrl + option.chartUrl + (option._id ? '/' + option._id : ''),
        data: data,
        dataType: "json",
        beforeSend: function (x) {
          x.setRequestHeader("Authorization", option.token);
          if (x && x.overrideMimeType) {
            x.overrideMimeType("application/j-son;charset=UTF-8");
          }
        },
        success: res => {
          that.loaded(true);
          if (res.status.toLowerCase() === 'ok') {
            _.merge(that._options, {
              _id: res.chart._id,
              image_url: res.chart.image_url,
              name: reqOptions.name,
              topToolbar: {
                enableCurrency: false
              }
            });

            if (type) {
              _.merge(that._options, {
                type: type
              });
            }
            that._toptoolbar.reload();
            if (cb) cb();
          } else {
            Swal.fire('Saving chart error!', 'Please check server response!', 'error');
          }
        }
      });
    }

  }

  _drawToolbars = () => {
    const that = this;

    const favoriteToolbar = document.createElement('div');
    $(favoriteToolbar).addClass('tv-floating-toolbar__widget-wrapper favorite-toolbar');
    $(favoriteToolbar).css('visibility', 'hidden');
    $(favoriteToolbar).appendTo($(that._element).find('.my-pusher'));
    this.drawFavoriteToolbar(this._favorites);

    const toolbar = document.createElement('div');
    $(toolbar).addClass('tv-floating-toolbar__widget-wrapper toolbar');
    $(toolbar).css('visibility', 'hidden');
    const html = `
      <div class="tv-floating-toolbar__drag js-drag ui-draggable-handle" style="width: 20px">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6 12">
          <path fill-rule="evenodd" d="M0 0h2v2H0V0zm4 0h2v2H4V0zM0 5h2v2H0V5zm4 0h2v2H4V5zm-4 5h2v2H0v-2zm4 0h2v2H4v-2z"></path>
        </svg>
      </div>
      <div key="template" class="tv-floating-toolbar__widget template" data-content="Shape Template" data-variation="mini">
        <div class="ui selection dropdown">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
            <path d="M2 0a2 2 0 0 0-2 2v14h14a2 2 0 0 0 2-2H2zm2 0v2h3V0zm5 0v2h3V0zm5 0v2h2a2 2 0 0 0-2-2zm0 4v3h2V4zm0 5v3h2V9z"></path>
          </svg>
          <i class="dropdown icon"></i>
          <div class="menu">
            <div class="item" data-value="save">Save Drawing Teamplate As...<i class="ui icon close"></i></div>
            <div class="item" data-value="default">Apply Default Drawing Template<i class="ui icon close"></i></div>
          </div>
        </div>
      </div>
      <div key="fontSize" class="tv-floating-toolbar__widget font-size" data-content="Font Size" data-variation="mini">
        <div class="ui selection labeled dropdown">
          <div class="text value">12</div>
          <i class="dropdown icon"></i>
          <div class="menu">
            <div class="item" data-value="10">10</div>
            <div class="item" data-value="11">11</div>
            <div class="item" data-value="12">12</div>
            <div class="item" data-value="13">13</div>
            <div class="item" data-value="14">14</div>
            <div class="item" data-value="20">20</div>
            <div class="item" data-value="24">24</div>
            <div class="item" data-value="28">28</div>
            <div class="item" data-value="32">32</div>
            <div class="item" data-value="40">40</div>
          </div>
        </div>
      </div>
      <div key="fontColor" color="#4e9aa9" class="tv-floating-toolbar__widget font-color color-picker"  data-content="Font Color" data-variation="mini">
        <span class="tvcolorpicker-container tv-linetool-properties-toolbar__color-picker apply-common-tooltip">
          <div class="tvcolorpicker-transparency"></div>
          <input class="colorpicker-widget tvcolorpicker-widget" autocomplete="off" readonly="readonly" style="background-color: #4e9aa9; color: #4e9aa9; border-color: #4e9aa9;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 38">
            <path d="M0 0v38h38V0H0zm7 29h24v4H7v-4z" class="bg"></path>
            <path d="M23.094 25.5L22 22.17h-5.904l-1.17 3.33H12.5l6.446-16h.574l5.98 16h-2.405zM19.13 13.637l-2.46 6.95h4.712l-2.252-6.95z" class="icon"></path>
          </svg>
        </span>
      </div>
      <div key="backgroundColor" color="#4e9aa9" class="tv-floating-toolbar__widget background-color color-picker" data-content="Background Color" data-variation="mini">
        <span class="tvcolorpicker-container tv-linetool-properties-toolbar__color-picker apply-common-tooltip">
          <div class="tvcolorpicker-transparency"></div>
          <input class="colorpicker-widget tvcolorpicker-widget" autocomplete="off" readonly="readonly" style="background-color: #4e9aa9; color: #4e9aa9; border-color: #4e9aa9;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 38">
            <path d="M0 0v38h38V0H0zm7 29h24v4H7v-4z" class="bg"></path>
            <path d="M24.06 17.94L15.123 9l-1.41 1.41 2.38 2.38-5.15 5.15a1.49 1.49 0 0 0 0 2.12l5.5 5.5c.29.29.68.44 1.06.44s.77-.15 1.06-.44l5.5-5.5c.59-.58.59-1.53 0-2.12zM12.713 19l4.79-4.79L22.29 19h-9.58zM26.5 20.5s-2 2.17-2 3.5c0 1.1.9 2 2 2s2-.9 2-2c0-1.33-2-3.5-2-3.5z" class="icon"></path>
          </svg>
        </span>
      </div>
      <div key="lineColor" color="#4e9aa9" class="tv-floating-toolbar__widget line-color color-picker" data-content="Line Color" data-variation="mini">
        <span class="tvcolorpicker-container tv-linetool-properties-toolbar__color-picker apply-common-tooltip">
          <div class="tvcolorpicker-transparency"></div>
          <input class="colorpicker-widget tvcolorpicker-widget" autocomplete="off" readonly="readonly" style="background-color: #4e9aa9; color: #4e9aa9; border-color: #4e9aa9;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 38">
            <path d="M0 0v38h38V0H0zm7 29h24v4H7v-4z" class="bg"></path>
            <path d="M24.748 16l-3.75-3.748-9.998 10V26h3.75l9.998-10zm2.96-2.96a.996.996 0 0 0 0-1.408l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.96 1.96 3.75 3.75 1.96-1.96z" class="icon"></path>
          </svg>
        </span>
      </div>
      <div key="lineThickness" class="tv-floating-toolbar__widget line-thickness" data-content="Line Thickness" data-variation="mini">
        <span key="lineThickness" style="padding: 8px" data-position="bottom left" class="popup-handler tvcolorpicker-container tv-linetool-properties-toolbar__color-picker apply-common-tooltip">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 6" width="22" height="6">
            <path d="M1.5 2a.5.5 0 0 0 0 1h19a.5.5 0 0 0 0-1h-19z"></path>
          </svg>
        </span>
      </div>
      `;
    $(toolbar).html(html);
    $(toolbar).append(`<div key="lineStyle" class="tv-floating-toolbar__widget line-style"  data-content="Line Style" data-variation="mini">
      <span key="lineStyle" data-position="bottom left" style="padding: 8px" class="popup-handler tvcolorpicker-container tv-linetool-properties-toolbar__color-picker apply-common-tooltip">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 6" width="22" height="6">
          <path d="M1.5 2a.5.5 0 0 0 0 1h19a.5.5 0 0 0 0-1h-19z"></path>
        </svg>
      </span>
    </div>`);
    $(toolbar).append(
      `<div key="startArrow" class="tv-floating-toolbar__widget start-arrow"  data-content="Start Arrow Style" data-variation="mini">
        <span key="startArrow" data-position="bottom left" style="padding: 8px" class="popup-handler tvcolorpicker-container tv-linetool-properties-toolbar__color-picker apply-common-tooltip">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 6" width="22" height="6">
            <path d="M20 2.5a.5.5 0 1 1 1 0 .5.5 0 1 1-1 0zm-19 0a2 2 0 1 1 4 0 2 2 0 1 1-4 0z"></path>
            <path d="M20.5 3H3V2h17.5z"></path>
          </svg>
        </span>
      </div>`
    );
    $(toolbar).append(
      `<div key="endArrow" class="tv-floating-toolbar__widget end-arrow"  data-content="End Arrow Style" data-variation="mini">
        <span key="endArrow" data-position="bottom left" style="padding: 8px" class="popup-handler tvcolorpicker-container tv-linetool-properties-toolbar__color-picker apply-common-tooltip">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 6" width="22" height="6">
            <path d="M20 2.5a.5.5 0 1 1 1 0 .5.5 0 1 1-1 0zm-19 0a2 2 0 1 1 4 0 2 2 0 1 1-4 0z"></path>
            <path d="M20.5 3H3V2h17.5z"></path>
          </svg>
        </span>
      </div>`
    );
    $(toolbar).append(
      `<div key="setting" class="tv-floating-toolbar__widget setting-wrapper" data-content="Setting" data-variation="mini">
      <div class="tv-linetool-properties-toolbar__button apply-common-tooltip">
        <div class="tv-linetool-properties-toolbar__icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 16">
            <path d="M15.09 6.857s-.571 0-.724-.533c-.114-.457-.305-.876-.533-1.295-.229-.495.152-.876.152-.876l.571-.571c.229-.229.229-.61 0-.876l-.762-.762c-.229-.229-.61-.229-.876 0l-.571.571s-.381.381-.876.152c-.419-.229-.838-.419-1.295-.533-.533-.152-.533-.724-.533-.724v-.8a.602.602 0 0 0-.61-.61H7.966a.602.602 0 0 0-.61.61v.8s0 .571-.533.724c-.457.114-.876.305-1.295.533-.495.229-.876-.152-.876-.152l-.571-.571c-.229-.229-.61-.229-.876 0l-.762.762c-.229.229-.229.61 0 .876l.571.571s.381.381.152.876c-.229.419-.419.838-.533 1.295-.152.495-.724.533-.724.533h-.8a.602.602 0 0 0-.61.61v1.067c0 .343.267.61.61.61h.8s.571 0 .724.533c.114.457.305.876.533 1.295.229.495-.152.876-.152.876l-.571.571c-.229.229-.229.61 0 .876l.762.762c.229.229.61.229.876 0l.571-.571s.381-.381.876-.152c.419.229.838.419 1.295.533.495.152.533.724.533.724v.8c0 .343.267.61.61.61h1.067c.343 0 .61-.267.61-.61v-.8s0-.571.533-.724c.457-.114.876-.305 1.295-.533.495-.229.876.152.876.152l.571.571c.229.229.61.229.876 0l.762-.762c.229-.229.229-.61 0-.876l-.571-.571s-.381-.381-.152-.876c.229-.419.419-.838.533-1.295.152-.495.724-.533.724-.533h.8c.343 0 .61-.267.61-.61V7.467a.602.602 0 0 0-.61-.61h-.8zM8.5 11.555a3.541 3.541 0 0 1-3.556-3.556A3.541 3.541 0 0 1 8.5 4.443a3.541 3.541 0 0 1 3.556 3.556A3.561 3.561 0 0 1 8.5 11.555z"></path>
          </svg>
        </div>
      </div>
    </div>`
    );
    $(toolbar).append(
      `<div key="order" class="tv-floating-toolbar__widget order" data-content="Arrange" data-variation="mini">
        <div class="ui selection dropdown">
          <div class="value">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M1.5 2H0v12c0 .825.675 1.5 1.5 1.5h12V14h-12V2zm13.056-2H4.445c-.794 0-1.444.65-1.444 1.444v10.111c0 .794.65 1.444 1.444 1.444h10.111c.794 0 1.444-.65 1.444-1.444V1.444C16 .65 15.35 0 14.556 0z"></path>
            </svg>
          </div>
          <i class="dropdown icon"></i>
          <div class="menu">
            <div class="item" data-value="front">Brint to Front</div>
            <div class="item" data-value="back">Send to Back</div>
            <div class="item" data-value="forward">Bring Forward</div>
            <div class="item" data-value="backward">Send Backward</div>
          </div>
        </div>
      </div>`
    );

    $(toolbar).append(
      `<div key="clone" class="tv-floating-toolbar__widget clone" data-content="Clone" data-variation="mini">
        <div class="ui selection dropdown">
          <div class="value">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 15"><path d="M1 0C.45 0 0 .45 0 1v11h1V1h9V0H1zm2.467 2C2.66 2 2 2.65 2 3.444v10.111c0 .794.66 1.444 1.467 1.444h8.067c.807 0 1.467-.65 1.467-1.444V3.444c0-.794-.66-1.444-1.467-1.444H3.467zM3 3h9v11H3V3z"></path></svg>
          </div>
          <i class="dropdown icon"></i>
          <div class="menu">
            <div class="item" data-value="clone">Clone</div>
            <!-- <div class="item" data-value="copy">Copy</div> -->
          </div>
        </div>
      </div>`
    );

    $(toolbar).append(
      `<div key="lock" class="tv-floating-toolbar__widget lock" data-content="Lock" data-variation="mini">
        <div class="tv-linetool-properties-toolbar__button i-active apply-common-tooltip">
          <div class="tv-linetool-properties-toolbar__icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 16" width="12px" height="16px"><path fill-rule="evenodd" d="M10.5 5.333h-.75V3.81C9.75 1.707 8.07 0 6 0 3.93 0 2.25 1.707 2.25 3.81v1.523H1.5c-.825 0-1.5.686-1.5 1.524v7.62C0 15.313.675 16 1.5 16h9c.825 0 1.5-.686 1.5-1.524V6.857c0-.838-.675-1.524-1.5-1.524zM6 12c-.825 0-1.5-.675-1.5-1.5S5.175 9 6 9s1.5.675 1.5 1.5S6.825 12 6 12zm2.325-6.75h-4.65v-1.5A2.326 2.326 0 0 1 6 1.425 2.326 2.326 0 0 1 8.325 3.75v1.5z"></path></svg>
          </div>
        </div>
      </div>`
    );

    $(toolbar).append(
      `<div key="eye" class="tv-floating-toolbar__widget eye" data-content="Visibility" data-variation="mini">
        <div class="tv-linetool-properties-toolbar__button i-active apply-common-tooltip">
          <div class="tv-linetool-properties-toolbar__icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 12"><path d="M8.25 0C4.5 0 1.297 2.332 0 5.625c1.297 3.292 4.5 5.625 8.25 5.625s6.953-2.333 8.25-5.625C15.203 2.332 12 0 8.25 0zm0 9.375c-2.07 0-3.75-1.68-3.75-3.75 0-2.07 1.68-3.75 3.75-3.75 2.07 0 3.75 1.68 3.75 3.75 0 2.07-1.68 3.75-3.75 3.75zm0-6C7.005 3.375 6 4.38 6 5.625s1.005 2.25 2.25 2.25 2.25-1.005 2.25-2.25-1.005-2.25-2.25-2.25z"></path></svg>
          </div>
        </div>
      </div>`
    );

    $(toolbar).append(
      `<div key="delete" class="tv-floating-toolbar__widget delete" data-content="Delete" data-variation="mini">
        <div class="tv-linetool-properties-toolbar__button apply-common-tooltip">
          <div class="tv-linetool-properties-toolbar__icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 13"><path d="M1 11.571C1 12.357 1.6 13 2.333 13h5.333c.733 0 1.333-.643 1.333-1.429V3h-8v8.571zM8.5 1L6.786 0H3.215L1.501 1h-1.5v1h10V1h-1.5z"></path></svg>
          </div>
        </div>
      </div>`
    );

    $(toolbar).appendTo($(this._element).find('.my-pusher'));

    $(toolbar).find('.ui-draggable-handle').on('pointerdown', e => {
      $(document).on('mousemove', (event) => {
        $(toolbar).position({
          my: "left-5",
          of: event,
          collision: "fit",
          within: that._pan._element
        });
      });
    });

    $(toolbar).find('.tv-floating-toolbar__widget').popup({
      position: 'top center'
    })

    $(toolbar).find('.ui-draggable-handle').on('pointerup', () => {
      $(document).off('mousemove');
    })

    $(toolbar).find('.ui.dropdown').dropdown({
      onChange: (value, text, $choice) => {
        if ($($choice[0]).hasClass('inactive')) return;
        var parent = $($choice[0]).closest('.tv-floating-toolbar__widget');
        var key = $(parent).attr('key');
        if (key === 'order') {
          this._pan.orderShape(value);
        } else if (key === 'clone') {
          this._pan.cloneShape();
        } else if (key === 'template') {
          this._pan.setTemplate(value);
        } else if (key === 'fontSize') {
          let pen = this._pan.getPen();
          _.set(pen, 'option.label.fontSize', value);
          this._pan.draw(pen);
        }
      }
    });

    // color picker
    const colorWrappers = ['lineColor', 'backgroundColor', 'fontColor'];
    colorWrappers.forEach(wrapper => {
      $(toolbar).find(`.color-picker[key="${wrapper}"]`).spectrum({
        // coloe: color,
        showPaletteOnly: true,
        togglePaletteOnly: true,
        togglePaletteMoreText: '+',
        togglePaletteLessText: '-',
        showAlpha: true,
        palette: colorPalette,
        beforeShow: function (color) {
          color = that._pan._pen.option.mainLine.lineColor;
          if (wrapper == 'backgroundColor') {
            color = that._pan._pen.option.background.color;
          } else if (wrapper == 'fontColor') {
            color = that._pan._pen.option.label.color;
          }
          $(toolbar).find(`.color-picker[key="${wrapper}"]`).spectrum('set', color);
        },
        change: color => {
          const rgbColor = color.toRgbString();
          const el = $(toolbar).find(`.color-picker[key="${wrapper}"]`);
          $(el).find('.colorpicker-widget').css('backgroundColor', rgbColor).css('color', rgbColor);

          var option = {};
          if (wrapper == 'backgroundColor') {
            option = {
              background: {
                color: rgbColor
              }
            };
          } else if (wrapper == 'fontColor') {
            option = {
              label: {
                color: rgbColor
              }
            };
          } else if (wrapper == 'lineColor') {
            option = {
              mainLine: {
                lineColor: rgbColor
              }
            }
            if (that._pan._pen.objectType.indexOf('fib') >= 0) {
              _.merge(option, {
                levelLine: {
                  color: rgbColor
                }
              });
              for (let i = 0; i < 10; i++) {
                _.set(option, `levels[${i}].color`, rgbColor);
              }
            }
          }
          that._pan.updateShape(option, true);
        }
      });
    })

    $(toolbar).find('.popup-handler[key="lineStyle"]')
      .popup({
        on: 'click',
        onVisible: function () {
          $('.my-popup.line-style .ui.button').click(function (e) {
            var val = $(e.target).closest('.ui.button').attr('key');
            var ls = ['solid', 'dot', 'dash'];
            var option = {
              mainLine: {
                lineDashType: ls[parseInt(val)]
              }
            };
            that._pan.updateShape(option, true);
            var lineStyle = [
              '<path d="M1.5 2a.5.5 0 0 0 0 1h19a.5.5 0 0 0 0-1h-19z"></path>',
              '<path d="M1.5 2a.5.5 0 0 0 0 1H3V2H1.5zM4 2v1h2V2H4zm3 0v1h2V2H7zm3 0v1h2V2h-2zm3 0v1h2V2h-2zm3 0v1h2V2h-2zm3 0v1h1.5a.5.5 0 0 0 0-1H19z"></path>',
              '<path d="M1.5 2a.5.5 0 0 0 0 1H5V2zM7 2v1h3V2zm5 0v1h3V2zm5 0v1h3.5a.5.5 0 0 0 0-1z"></path>'
            ]
            $(toolbar).find('.popup-handler[key="lineStyle"] svg').html(lineStyle[parseInt(val)]);
            $(toolbar).find('.popup-handler[key="lineStyle"]')
              .popup('hide');
          });
        },
        className: {
          popup: 'ui popup my-popup line-style'
        },
        html: `<div class="ui icon buttons">
      <button key="0" class="ui button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 6" width="22" height="6">
          <path d="M1.5 2a.5.5 0 0 0 0 1h19a.5.5 0 0 0 0-1h-19z"></path>
        </svg>
      </button>
      <button key="1" class="ui button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 6" width="22" height="6">
          <path d="M1.5 2a.5.5 0 0 0 0 1H3V2H1.5zM4 2v1h2V2H4zm3 0v1h2V2H7zm3 0v1h2V2h-2zm3 0v1h2V2h-2zm3 0v1h2V2h-2zm3 0v1h1.5a.5.5 0 0 0 0-1H19z"></path>
        </svg>
      </button>
      <button key="2" class="ui button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 6" width="22" height="6">
          <path d="M1.5 2a.5.5 0 0 0 0 1H5V2zM7 2v1h3V2zm5 0v1h3V2zm5 0v1h3.5a.5.5 0 0 0 0-1z"></path>
        </svg>
      </button>
    </div>`
      });

    $(toolbar).find('.popup-handler[key="lineThickness"]')
      .popup({
        on: 'click',
        onVisible: function () {
          $('.my-popup.line-thickness .ui.button').click(function (e) {
            var val = $(e.target).closest('.ui.button').attr('key');
            var option = {
              mainLine: {
                lineThickness: val
              }
            };
            that._pan.updateShape(option, true);
            var lineThickness = [
              '<path d="M1.5 2a.5.5 0 0 0 0 1h19a.5.5 0 0 0 0-1h-19z"></path>',
              '<path d="M2 2a1 1 0 0 0 0 2h18a1 1 0 0 0 0-2H2z"></path>',
              '<path d="M2 1a1.5 1.5 0 0 0 0 3h18a1.5 1.5 0 0 0 0-3H2z"></path>',
              '<path d="M2 1a2 2 0 0 0 0 4h18a2 2 0 0 0 0-4H2z"></path>'
            ]
            $(toolbar).find('.popup-handler[key="lineThickness"] svg').html(lineThickness[parseInt(val) - 1]);
            $(toolbar).find('.popup-handler[key="lineThickness"]')
              .popup('hide');
          });
        },
        className: {
          popup: 'ui popup my-popup line-thickness'
        },
        html: `<div class="ui icon buttons">
      <button key="1" class="ui button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 6" width="22" height="6">
          <path d="M1.5 2a.5.5 0 0 0 0 1h19a.5.5 0 0 0 0-1h-19z"></path>
        </svg>
      </button>
      <button key="2" class="ui button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 6" width="22" height="6">
          <path d="M2 2a1 1 0 0 0 0 2h18a1 1 0 0 0 0-2H2z"></path>
        </svg>
      </button>
      <button key="3" class="ui button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 6" width="22" height="6">
          <path d="M2 1a1.5 1.5 0 0 0 0 3h18a1.5 1.5 0 0 0 0-3H2z"></path>
        </svg>
      </button>
      <button key="4" class="ui button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 6" width="22" height="6">
          <path d="M2 1a2 2 0 0 0 0 4h18a2 2 0 0 0 0-4H2z"></path>
        </svg>
      </button>
    </div>`
      });

    $(toolbar).find('.popup-handler[key="startArrow"]')
      .popup({
        on: 'click',
        onVisible: function () {
          $('.my-popup.start-arrow .ui.button').click(function (e) {
            var val = $(e.target).closest('.ui.button').attr('key');
            var option = {
              start: {
                arrow: val == 1,
                extend: val == 2
              }
            };
            that._pan.updateShape(option, true);
            var arrows = [
              '<path d="M20 2.5a.5.5 0 1 1 1 0 .5.5 0 1 1-1 0zm-19 0a2 2 0 1 1 4 0 2 2 0 1 1-4 0z"></path><path d="M20.5 3H3V2h17.5z"></path>',
              '<path d="M0 2.5L8 0v5zm20 0a.5.5 0 1 1 1 0 .5.5 0 1 1-1 0z"></path><path d="M20.5 3H7V2h13.5z"></path>',
              '<path d="M0 2.5a.5.5 0 1 1 1 0 .5.5 0 1 1-1 0zm18 0a2 2 0 1 1 4 0 2 2 0 1 1-4 0zm-9 0a2 2 0 1 1 4 0 2 2 0 1 1-4 0z"></path><path d="M19 3H.5V2H19z"></path>'
            ];
            $(toolbar).find('.popup-handler[key="startArrow"] svg').html(arrows[parseInt(val)]);
            $(toolbar).find('.popup-handler[key="startArrow"]')
              .popup('hide');
          });
        },
        className: {
          popup: 'ui popup my-popup start-arrow'
        },
        html: `<div class="ui icon buttons">
      <button key="0" class="ui button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 6" width="22" height="6">
          <path d="M20 2.5a.5.5 0 1 1 1 0 .5.5 0 1 1-1 0zm-19 0a2 2 0 1 1 4 0 2 2 0 1 1-4 0z"></path>
          <path d="M20.5 3H3V2h17.5z"></path>
        </svg>
      </button>
      <button key="1" class="ui button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 6" width="22" height="6">
          <path d="M0 2.5L8 0v5zm20 0a.5.5 0 1 1 1 0 .5.5 0 1 1-1 0z"></path>
          <path d="M20.5 3H7V2h13.5z"></path>
        </svg>
      </button>
      <button key="2" class="ui button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 6" width="22" height="6">
          <path d="M0 2.5a.5.5 0 1 1 1 0 .5.5 0 1 1-1 0zm18 0a2 2 0 1 1 4 0 2 2 0 1 1-4 0zm-9 0a2 2 0 1 1 4 0 2 2 0 1 1-4 0z"></path>
          <path d="M19 3H.5V2H19z"></path>
        </svg>
      </button>
    </div>`
      });
    $(toolbar).find('.popup-handler[key="endArrow"]')
      .popup({
        on: 'click',
        onVisible: function () {
          $('.my-popup.end-arrow .ui.button').click(function (e) {
            var val = $(e.target).closest('.ui.button').attr('key');
            var option = {
              end: {
                arrow: val == 1,
                extend: val == 2
              }
            };
            that._pan.updateShape(option, true);
            var arrows = [
              '<path d="M20 2.5a.5.5 0 1 1 1 0 .5.5 0 1 1-1 0zm-19 0a2 2 0 1 1 4 0 2 2 0 1 1-4 0z"></path><path d="M20.5 3H3V2h17.5z"></path>',
              '<path d="M0 2.5L8 0v5zm20 0a.5.5 0 1 1 1 0 .5.5 0 1 1-1 0z"></path><path d="M20.5 3H7V2h13.5z"></path>',
              '<path d="M22 2.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0zM4 2.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM13 2.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0z"></path><path d="M3 2h18.5v1H3z"></path>'
            ];
            $(toolbar).find('.popup-handler[key="endArrow"] svg').html(arrows[parseInt(val)]);
            $(toolbar).find('.popup-handler[key="endArrow"]')
              .popup('hide');
          });
        },
        className: {
          popup: 'ui popup my-popup end-arrow'
        },
        html: `<div class="ui icon buttons">
        <button key="0" class="ui button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 6" width="22" height="6">
            <path d="M20 2.5a.5.5 0 1 1 1 0 .5.5 0 1 1-1 0zm-19 0a2 2 0 1 1 4 0 2 2 0 1 1-4 0z"></path>
            <path d="M20.5 3H3V2h17.5z"></path>
          </svg>
        </button>
        <button key="1" class="ui button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 6" width="22" height="6">
            <path d="M0 2.5L8 0v5zm20 0a.5.5 0 1 1 1 0 .5.5 0 1 1-1 0z"></path>
            <path d="M20.5 3H7V2h13.5z"></path>
          </svg>
        </button>
        <button key="2" class="ui button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 6" width="22" height="6">
            <path d="M22 2.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0zM4 2.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM13 2.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0z"></path>
            <path d="M3 2h18.5v1H3z"></path>
          </svg>
        </button>
      </div>`
      });

    $(toolbar).find('.tv-floating-toolbar__widget[key="lock"]').click((e) => {
      var flag = that._pan._pen.option.isLocked;
      that._pan.updateShape({
        isLocked: !flag
      }, true);
      if (flag)
        $(e.target).closest('.tv-floating-toolbar__widget').find('.i-active').removeClass('i-active');
      else
        $(e.target).closest('.tv-floating-toolbar__widget').find('.apply-common-tooltip').addClass('i-active');
    });
    $(toolbar).find('.tv-floating-toolbar__widget[key="eye"]').click((e) => {
      var flag = that._pan._pen.option.visible;
      that._pan.updateShape({
        visible: !flag
      }, true);
      if (!flag)
        $(e.target).closest('.tv-floating-toolbar__widget').find('.i-active').removeClass('i-active');
      else
        $(e.target).closest('.tv-floating-toolbar__widget').find('.apply-common-tooltip').addClass('i-active');
    });
    $(toolbar).find('.tv-floating-toolbar__widget[key="delete"]').click((e) => {
      that._pan.deleteShape();
      $(toolbar).css('visibility', 'hidden');
    });

    $(toolbar).find('.tv-floating-toolbar__widget[key="setting"]').click(e => {
      that._pan.settingOption();
    });
  }

  drawFavoriteToolbar = (favorites, flag = false) => {
    const that = this;
    if (flag) {
      this._favorites = favorites;
      // return;
    }

    let html = '';
    html += `<div class="tv-floating-toolbar__drag js-drag ui-draggable-handle" style="width: 20px">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6 12">
        <path fill-rule="evenodd" d="M0 0h2v2H0V0zm4 0h2v2H4V0zM0 5h2v2H0V5zm4 0h2v2H4V5zm-4 5h2v2H0v-2zm4 0h2v2H4v-2z"></path>
      </svg>
    </div>`;
    favorites.forEach(item => {
      const tool = leftTools.find(oo => (oo.key === item.key));
      if (tool) {
        html += `<div key="${tool.key}" data-content="${tool.title}" data-variation="mini" class="tv-floating-toolbar__widget shape-wrapper">
          <div class="tv-linetool-properties-toolbar__button apply-common-tooltip">
            <div class="tv-linetool-properties-toolbar__icon">
              <svg fill="#000" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26">
                ${tool.icon}
              </svg>
            </div>
          </div>
        </div>`;
      }
    });
    if (favorites.length > 0) {
      $('.tv-floating-toolbar__widget-wrapper.favorite-toolbar').css('visibility', 'visible');
      $('.tv-floating-toolbar__widget-wrapper.favorite-toolbar').html(html);
    } else {
      $('.tv-floating-toolbar__widget-wrapper.favorite-toolbar').css('visibility', 'hidden');
    }

    $('.tv-floating-toolbar__widget-wrapper.favorite-toolbar').find('.ui-draggable-handle').on('pointerdown', e => {
      $(document).on('mousemove', (event) => {
        $('.tv-floating-toolbar__widget-wrapper.favorite-toolbar').position({
          my: "left-5",
          of: event,
          collision: "fit",
          within: that._pan._element
        });
      });
    });

    $('.tv-floating-toolbar__widget-wrapper.favorite-toolbar').find('.ui-draggable-handle').on('pointerup', () => {
      $(document).off('mousemove');
    });

    $('.favorite-toolbar .shape-wrapper').click((e) => {
      const key = $(e.target).closest('.shape-wrapper').attr('key');
      that._pan.selectShape(key);
    });

    $('.favorite-toolbar .tv-floating-toolbar__widget').popup({
      position: 'top center'
    });
  }

  updateAnalyze = (res) => {
    const option = this.options();
    const analyze = option.analyze;
    if (_.has(this._options, 'callFn.analized') && typeof this._options.callFn.analized === 'function') {
      if (res) _.merge(analyze, res);
      _.merge(analyze, {
        chartId: option._id,
        chartName: option.name,
        shapes: option.pan.shape,
        link: option.image_url,
        precision: option.topToolbar.currency.precision,
        pair: option.topToolbar.currency.name
      });
      this._options.callFn.analized(analyze);
    }
  }

  controlOptions = () => {
    if (!this._options._id) {
      this._options.controlling.autoSave = true;
      this._options.controlling.isEditor = true;
    } else if (_.hasIn(this._options, 'collaborate.enable')) {
      this._options.writerId = isNaN(this._options.writerId) ? this._options.writerId : parseInt(this._options.writerId);
      this._options.ownerId = isNaN(this._options.ownerId) ? this._options.ownerId : parseInt(this._options.ownerId);
      const writer = this._options.writerId;
      if (parseInt(this._layout.ownerId) == this._options.writerId) {
        _.set(this._options, 'controlling.autoSave', true);
        _.set(this._options, 'controlling.isEditor', true);
      } else {
        let flag = this._options.collaborate.role[0] > 0;
        if (this._options.collaborate.role[0] >= 2) {
          const cIndex = _.findIndex(this._options.collaborate.viewers, o => {
            const oo = isNaN(o) ? o : parseInt(o);
            return oo === writer
          });
          flag = cIndex > -1;
        }

        let isEditor = this._options.collaborate.role[1] > 0;
        if (this._options.collaborate.role[1] > 1) {
          isEditor = _.findIndex(this._options.collaborate.editors, o => (parseInt(o) === writer) >= 0) >= 0;
        }
        _.set(this._options, 'controlling.autoSave', flag);
        _.set(this._options, 'controlling.isEditor', isEditor);
      }
    }

    if (this._pan) {
      this._pan._auto_save = this._options.controlling.autoSave;
    }

    if (['signal', 'analysis'].indexOf(this._options.type) >= 0) {
      if (!this._options.analyzeEnable && this._options.writerId !== this._options.ownerId) {
        this._options.analyzeShapes = [];
      }
    }

    if (_.hasIn(this._options, 'enableNewChart')) {
      this._options.controlling.enableNewChart = this._options.enableNewChart;
    }

    if (this._options.windowWidth === 0) {
      this._options.windowWidth = window.innerWidth;
    }
  }

  loadChartWithId = (chartId, customSetting) => {
    this.loaded(false);
    const option = this._options;
    if (option._id == chartId) {
      this.loadChart(customSetting);
    } else {
      $.get({
        url: option.hostUrl + option.chartUrl + '/' + chartId,
        dataType: "json",
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", option.token);
        },
        success: res => {
          if (res.status && res.status.toLowerCase() === 'ok') {
            // this.loaded(true);
            const chartInfo = res.chart;
            if (customSetting) {
              _.merge(chartInfo, customSetting)
            }
            this.loadChart(chartInfo);
            if (customSetting) {
              this._sidebar.redraw()
            }
          } else {
            this.loaded(true);
            Swal.fire('Load Chart Error', 'There are some errors on server!', 'error');
          }
        },
        error: e => {
          this.loaded(true);
          Swal.fire('Load Chart Error', 'There are some errors on server!', 'error');
        }
      })
    }
  }

  drawingSignals = (used) => {
    this._options.signalUsed = used;
    if (this._pan._pans.length > 0) {
      this._pan._pans[0].drawingSignalShape(used)
    }
  }

  renderShapes = (shapes, flag) => {
    if (flag) {
      if (shapes.length > 0) {
        const analysisShape = shapes.find(shape => (shape.key == 'analysis'));
        if (analysisShape) {
          this._pan._pivotStyle = analysisShape.signals[8].color;
        } else {
          this._pan._pivotStyle = null;
        }
        this._pan.setShapes(shapes);
      } else {
        this._pan.deleteAll()
      }
    } else {
      this._pan.hoveringShapes(shapes);
    }
  }

  _socketInit = () => {
    const that = this;
    let socket = null;
    if (_.has(this._socket, 'getSocket')) {
      socket = this._socket.getSocket();
    } else {
      socket = this._socket;
    }

    if (socket) {
      socket.off('Joined:Chart');
      socket.off('rtChart:Created');
      socket.off('rtChart:Updating');
      socket.off('Price:Feed');
      socket.off('Socket:Connected')
    }

    this._socket.on("Joined:Chart", function (roomId) {
      console.log('connected socket', roomId);
    });

    this._socket.on("rtChart:Created", function (data) {
      if (data.roomId === that._room_id) {
        that._options._id = data._id;
        that._socket.emit("Joining:Chart", data._id);
      }
    });

    this._socket.on("rtChart:Updating", data => {
      if (data.transactionId != this._socket_transaction_id) {
        that._pan.proceedUpdateFromSocket(data);
      } else if (this._loaded) {
        this._toptoolbar.shared(true);
      }
    });

    socket.on('RealTime:Feed', (data) => {
      console.log(data);
    });

    socket.on("Socket:Connected", () => {
      this._priceSocketInit();
    });
  }

  _priceSocketInit = () => {
    let socket = null;
    if (_.has(this._socket, 'getSocket')) {
      socket = this._socket.getSocket();
    } else {
      socket = this._socket;
    }

    if (socket) {
      const symbol = this._options.topToolbar.currency.name;
      this._socket.emit("Price:Stream", symbol);
    }
  }

  _joinChartSocket = () => {
    if (this._layout_id) {
      this._socket.emit("Joining:Chart", this._layout_id);
    }
  }
};