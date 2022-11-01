import * as _ from 'lodash';
export class ShapeModel {
  _options = null;
  _chartWidget = null;
  constructor(options, chartWidget) {
    this._options = options;
    this._chartWidget = chartWidget;
  }

  options = () => {
    return this._options;
  }

  applyOptions = options => {
    this._options = _.merge(this._options, options);
    if (_.hasIn(this._options, 'fireEvent')) {
      this._options.fireEvent.target[this._options.fireEvent.event]();
      delete this._options.fireEvent;
    }
  }

  destroy = () => {
    delete this._options;
  }
};