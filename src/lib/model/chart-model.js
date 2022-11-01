import * as _ from 'lodash';
import {
  defaultOptions
} from './options';
import {
  CreateUUID
} from '../helpers/data-util';
export class ChartModel {
  _options = null;
  _chartWidget = null;
  constructor(options, chartWidget) {
    this._options = options;
    this._chartWidget = chartWidget;
    if (_.has(options, 'analize.default') && options.analize.default) {
      let option = defaultOptions['analysis'];
      option.signals[0].value.y = isNaN(parseFloat(options.analize.support1.value)) ? 0: parseFloat(options.analize.support1.value);
      option.signals[1].value.y = isNaN(parseFloat(options.analize.support2.value)) ? 0: parseFloat(options.analize.support2.value);
      option.signals[7].value.y = isNaN(parseFloat(options.analize.resistance1.value)) ? 0: parseFloat(options.analize.resistance1.value);
      option.signals[6].value.y = isNaN(parseFloat(options.analize.resistance2.value)) ? 0: parseFloat(options.analize.resistance2.value);
      option.id = CreateUUID();
      this._options.pan.shape.push(option);
    }
  }

  options = () => {
    return this._options;
  }

  applyOptions = options => {
    let flag = true;
    if (_.hasIn(options, 'topToolbar.currency')) {
      flag = _.isEqual(this._options.topToolbar.currency, options.topToolbar.currency);
    }

    if (_.hasIn(options, 'topToolbar.interval')) {
      flag = _.isEqual(this._options.topToolbar.interval, options.topToolbar.interval);
    }

    if (!flag) {
      this._options.shape = [];
      options.shape = [];
    }
    let clonedOptions = _.cloneDeep(this._options);
    _.merge(clonedOptions, options);

    this._options = clonedOptions;
    if (_.hasIn(this._options, 'fireEvent')) {
      this._options.fireEvent.target[this._options.fireEvent.event]();
      delete this._options.fireEvent;
    }
  }

  destroy = () => {
    delete this._options;
  }

  initOptions = (options) => {
    _.merge(options, {hostUrl: this._options.hostUrl});
    this._options = options;
    this.controllOptions();
  }

  controllOptions = () => {
    // detection controll part
    if (this._options.chartId <= 0) {
      this._options.controlling.autoSave = true;
      this._options.controlling.isEditor = true;
    } else if (_.hasIn(this._options, 'collaborate.enable')) {
      const writer = parseInt(this._options.writerId);
      if (parseInt(this._options.ownerId) === parseInt(this._options.writerId) && parseInt(this._options.ownerId) > 0) {
        _.set(this._options, 'controlling.autoSave', true && this._options.topToolbar.autoSave);
        _.set(this._options, 'controlling.isEditor', true);
      } else {
        let flag = this._options.collaborate.role[0] > 0;
        if (this._options.collaborate.role[0] >= 2) {
          flag = _.findIndex(this._options.collaborate.viewers, o => (parseInt(o) === writer) >= 0) >= 0;
        }

        let isEditor = this._options.collaborate.role[1] > 0;
        if (this._options.collaborate.role[1] > 1) {
          isEditor = _.findIndex(this._options.collaborate.editors, o => (parseInt(o) === writer) >= 0) >= 0;
        }
        _.set(this._options, 'controlling.autoSave', flag && this._options.topToolbar.autoSave);
        _.set(this._options, 'controlling.isEditor', isEditor);
      }
    }
  }
};