import * as _ from 'lodash';
export class SettingModel {
  _options = null;
  _widget = null;
  constructor(options, panWidget) {
    this._options = options;
    this._widget = panWidget;
  }

  options = () => {
    return this._options;
  }

  applyOptions = options => {
    _.merge(this._options, options);
  }

  destroy = () => {
    delete this._options;
  }
};