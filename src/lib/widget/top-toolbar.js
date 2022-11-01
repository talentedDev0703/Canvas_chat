import Swal from 'sweetalert2';
import * as _ from 'lodash';
import moment from 'moment';
import {
	CIndicators,
	CIntervals,
	SymbolDatas,
	colorPalette
} from '../model/constants';
import {
	makeMenu
} from '../helpers/ui-utils';
import {
	chartOptionsDefaults
} from '../model/default-options';
import '../assets/colorPicker/js/colorpicker';
import '../assets/colorPicker/js/eye';
import {
	CreateUUID
} from '../helpers/data-util';

import {
	getModalTemplate,
	getPopupTemplate
} from '../helpers/modals';

const $ = window.$;

export class TopToolbarWidget {
	_chart = null;
	_options = null;
	_element = null;
	_mainToolbar = null;
	_cTypeElement = null;
	_currencyElement = null;
	_intervalElement = null;
	_currencies = [];
	_interval = null;
	_currency = null;
	_default = null;
	_search_key = '';
	_collaborate = {};
	_symbol_datas = [];
	_miniToggle = false;
	_layout_list_order = 'desc_date';
	_category = 'all';
	_boost_list = [];
	_candidate_user = null;
	_globalRoles = null;
	_channelSetting = null;
	_clipboardInput = null;
	_sorts = {
		key: 'name',
		order: 'asc'
	};
	_pagination = {
		page: 0,
		index: 0
	}
	autoSave = false;
	_shared = false;
	constructor(chart) {
		this._search_key = '';
		this._chart = chart;
		this._options = chart.options().topToolbar;
		this._interval = this._options.interval ? this._options.interval : _.cloneDeep(CIntervals[4]);
		this._element = document.createElement('div');
		this._element.className = 'ui segment top-toolbar';
		this._element.setAttribute('id', 'top_toolbar');
		this._mainToolbar = document.createElement('ul');
		$(this._mainToolbar).addClass('toolbar left-top-toolbar');
		this._cTypeElement = document.createElement('li');
		this._currencyElement = document.createElement('li');
		this._intervalElement = document.createElement('li');
		this._default = _.clone(chartOptionsDefaults);
		this.autoSave = this._options.autoSave;
		this._initSymbolDropdowns();
	}

	reload = (flag = true) => {
		this._options = this._chart._options.topToolbar;
		this._currencies = this._symbol_datas.filter(item => item.type === this._options.currency.type);
		this._currency = this._options.currency ? this._options.currency : this._currencies[0];
		this._interval = this._options.interval ? this._options.interval : _.cloneDeep(CIntervals[4]);
		$(this._mainToolbar).html('');
		$(this._element).find('.save-toolbar').remove();
		$(this._element).find('.collaborate-toolbar').remove();
		this._init(flag);
	}

	destroy = () => {
		delete this._chart;
		$(this._element).find('.setting-modal.tfa-modal').dialog('close');
		$(this._element).remove();
	}

	getElement = () => {
		return this._element;
	}

	_initSymbolDropdowns = (cb) => {
		const options = this._chart._options;
		const that = this;
		$.get({
			url: options.hostUrl + '/api/history/all-symbols',
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader("Authorization", options.token);
			},
			success: res => {
				if (res.length > 0) {
					that._symbol_datas = res;
					const filtered = res.filter(item => item.type === that._options.currency.type);
					that._currencies = _.sortBy(filtered, ['name']);
					let currency = null;
					if (that._options.currency) {
						currency = that._currencies.find(c => (c.name == that._options.currency.name));
					} else {
						currency = that._currencies[0];
					}
					if (currency) {
						that._currency = currency;
						that._chart._options.topToolbar.currency = currency;
						if (that._chart._pan) {
							that._chart._pan.loadData();
						}
					}
				}
				that._init();
			},
			error: e => {
				that._init();
			}
		});
	}

	_init = (flag = true) => {
		const that = this;
		const tempIntervals = _.cloneDeep(CIntervals);
		const intervalMenus = tempIntervals.filter(item => {
			if (this._options.intervals.length > 0) {
				return this._options.intervals.indexOf(item.label) >= 0;
			} else {
				return true;
			}
		});

		const toolbarWrapper = document.createElement('div');
		$(toolbarWrapper).addClass('top-toolbar-wrapper').appendTo(this._element);



		if (that._chart._options.topToolbar.currency) {
			that._currency = that._currencies.find(item => item.name === that._chart._options.topToolbar.currency.name);
			that._chart._options.topToolbar.currency = that._currency;
		}

		const symbolLabel = document.createElement('li');
		$(symbolLabel).html(`<div class="ui label" key="symbol" style="width: 120px; padding-left:10px;">${this._currency.name.replace('/', '')}</div>`);
		$(symbolLabel).appendTo(this._mainToolbar);
		/** interval select box */

		$(this._intervalElement).html(`<div id="interval" style="min-width: 100px" class="tc-dropdown ui selection bar-color dropdown">
			<input type="hidden" name="interval" value="forex" autocomplete="off">
			<i class="angle down icon"></i>
			<div class="text">Forex</div>
		</div>`).children('.tc-dropdown').append(makeMenu(intervalMenus.map(item => {
			return {
				name: item.name,
				value: item.value,
			};
		})));
		$(this._intervalElement).appendTo(this._mainToolbar);
		window.setTimeout(function () {
			$(that._intervalElement).children('.tc-dropdown')
				.dropdown({
					onChange: value => {
						that._interval = tempIntervals.find(item => item.value == value);
						that._chart._options.topToolbar.interval = that._interval;

						that._chart._layout.interval = that._interval;

						if (that._chart._socket !== null) {
							const data = {
								chartId: that._chart._options._id,
								layoutId: that._chart._layout._id,
								expecting: {
									interval: that._interval
								},
								verb: 'update',
								editor: that._chart._options.writerId,
								transactionId: that._chart._socket_transaction_id,
								field: 'interval'
							}

							that._chart._socket.emit("rtTfaChart:Updating", data);
						}
						if (that._chart._loaded && flag) {
							// that._chart._pan.resetAxisYRange();
							that._chart._pan.loadData();
						}
					}
				}).dropdown('set selected', that._interval.name);
		}, 100);
		flag = true;
		const options = this._chart.options();
		const toolWrapper = document.createElement('li');
		// indicators
		$(toolWrapper).clone().html(`
			<div class="ui label" key="indicator">
				<svg width="17" height="15" viewBox="0 0 17 15" fill="#FCFCFC" xmlns="http://www.w3.org/2000/svg">
					<g clip-path="url(#clip0)">
						<path d="M0.957153 0H1.95001V15H0.957153V0ZM1.95001 14.0625H16.8429V15H1.95001V14.0625Z"/>
						<path fill-rule="evenodd" clip-rule="evenodd" d="M15.2444 4.04251L10.9264 9.14064L7.90716 6.28782L4.2872 9.70689L3.58426 9.04314L7.90716 4.9622L10.845 7.73439L14.469 3.45657L15.2444 4.04157V4.04251Z"/>
						<path fill-rule="evenodd" clip-rule="evenodd" d="M10.8857 3.28125C10.8857 3.15693 10.938 3.0377 11.0311 2.94979C11.1242 2.86189 11.2505 2.8125 11.3821 2.8125H15.3536C15.4852 2.8125 15.6115 2.86189 15.7046 2.94979C15.7977 3.0377 15.85 3.15693 15.85 3.28125V7.03125C15.85 7.15557 15.7977 7.2748 15.7046 7.36271C15.6115 7.45061 15.4852 7.5 15.3536 7.5C15.2219 7.5 15.0956 7.45061 15.0025 7.36271C14.9094 7.2748 14.8571 7.15557 14.8571 7.03125V3.75H11.3821C11.2505 3.75 11.1242 3.70061 11.0311 3.61271C10.938 3.5248 10.8857 3.40557 10.8857 3.28125Z"/>
					</g>
					<defs>
						<clipPath id="clip0">
							<rect width="15.8857" height="15" fill="white" transform="translate(0.957153)"/>
						</clipPath>
					</defs>
				</svg><span class="caption">Indicators</span>
			</div>`).appendTo(this._mainToolbar);

		// Settings
		$(toolWrapper).clone().html(`
			<div class="ui label" key="setting">
				<svg width="18" height="18" viewBox="0 0 18 18" fill="white" xmlns="http://www.w3.org/2000/svg">
					<path d="M15.1875 9.42742V8.99992V8.5668L16.2675 7.6218C16.4666 7.44633 16.5972 7.20613 16.6363 6.94365C16.6754 6.68117 16.6205 6.41332 16.4812 6.18742L15.1537 3.93742C15.0551 3.76657 14.9133 3.62466 14.7425 3.52593C14.5717 3.4272 14.3779 3.37513 14.1806 3.37492C14.0584 3.37399 13.9368 3.39299 13.8206 3.43117L12.4537 3.89242C12.2177 3.7356 11.9716 3.59467 11.7169 3.47055L11.43 2.05305C11.3786 1.79408 11.2377 1.56145 11.032 1.39588C10.8263 1.23032 10.569 1.14236 10.305 1.14742H7.67249C7.40851 1.14236 7.15115 1.23032 6.94548 1.39588C6.73981 1.56145 6.59893 1.79408 6.54749 2.05305L6.26061 3.47055C6.00408 3.59464 5.75603 3.73557 5.51812 3.89242L4.17936 3.40867C4.06197 3.37809 3.9404 3.36669 3.81936 3.37492C3.62208 3.37513 3.42832 3.4272 3.25752 3.52593C3.08672 3.62466 2.94488 3.76657 2.84624 3.93742L1.51874 6.18742C1.38744 6.41298 1.33866 6.67717 1.38073 6.93474C1.4228 7.19231 1.55312 7.42724 1.74936 7.5993L2.81249 8.57242V9.43305L1.74936 10.378C1.54758 10.5513 1.4137 10.7904 1.37148 11.053C1.32926 11.3156 1.38143 11.5847 1.51874 11.8124L2.84624 14.0624C2.94488 14.2333 3.08672 14.3752 3.25752 14.4739C3.42832 14.5726 3.62208 14.6247 3.81936 14.6249C3.94162 14.6259 4.06322 14.6069 4.17936 14.5687L5.54624 14.1074C5.78223 14.2642 6.0284 14.4052 6.28311 14.5293L6.56999 15.9468C6.62143 16.2058 6.76231 16.4384 6.96798 16.604C7.17366 16.7695 7.43101 16.8575 7.69499 16.8524H10.35C10.614 16.8575 10.8713 16.7695 11.077 16.604C11.2827 16.4384 11.4236 16.2058 11.475 15.9468L11.7619 14.5293C12.0184 14.4052 12.2664 14.2643 12.5044 14.1074L13.8656 14.5687C13.9818 14.6069 14.1034 14.6259 14.2256 14.6249C14.4229 14.6247 14.6167 14.5726 14.7875 14.4739C14.9583 14.3752 15.1001 14.2333 15.1987 14.0624L16.4812 11.8124C16.6125 11.5869 16.6613 11.3227 16.6192 11.0651C16.5772 10.8075 16.4469 10.5726 16.2506 10.4005L15.1875 9.42742ZM14.1806 13.4999L12.2512 12.8474C11.7996 13.23 11.2834 13.529 10.7269 13.7305L10.3275 15.7499H7.67249L7.27311 13.753C6.72098 13.5458 6.20758 13.2473 5.75436 12.8699L3.81936 13.4999L2.49186 11.2499L4.02186 9.89992C3.91786 9.31766 3.91786 8.72157 4.02186 8.1393L2.49186 6.74992L3.81936 4.49992L5.74874 5.15242C6.20039 4.76986 6.71658 4.47082 7.27311 4.2693L7.67249 2.24992H10.3275L10.7269 4.2468C11.279 4.45404 11.7924 4.75257 12.2456 5.12992L14.1806 4.49992L15.5081 6.74992L13.9781 8.09992C14.0821 8.68219 14.0821 9.27828 13.9781 9.86055L15.5081 11.2499L14.1806 13.4999Z"/>
					<path d="M9 12.375C8.33249 12.375 7.67997 12.1771 7.12495 11.8062C6.56994 11.4354 6.13735 10.9083 5.88191 10.2916C5.62646 9.67486 5.55963 8.99626 5.68985 8.34157C5.82008 7.68689 6.14151 7.08552 6.61352 6.61352C7.08552 6.14151 7.68689 5.82008 8.34157 5.68985C8.99626 5.55963 9.67486 5.62646 10.2916 5.88191C10.9083 6.13735 11.4354 6.56994 11.8062 7.12495C12.1771 7.67997 12.375 8.33249 12.375 9C12.3795 9.44447 12.2953 9.88537 12.1273 10.2969C11.9593 10.7084 11.7108 11.0822 11.3965 11.3965C11.0822 11.7108 10.7084 11.9593 10.2969 12.1273C9.88537 12.2953 9.44447 12.3795 9 12.375ZM9 6.75C8.70263 6.74307 8.40695 6.79654 8.13084 6.90716C7.85472 7.01778 7.60391 7.18326 7.39359 7.39359C7.18326 7.60391 7.01778 7.85472 6.90716 8.13084C6.79654 8.40695 6.74307 8.70263 6.75 9C6.74307 9.29737 6.79654 9.59305 6.90716 9.86917C7.01778 10.1453 7.18326 10.3961 7.39359 10.6064C7.60391 10.8167 7.85472 10.9822 8.13084 11.0928C8.40695 11.2035 8.70263 11.2569 9 11.25C9.29737 11.2569 9.59305 11.2035 9.86917 11.0928C10.1453 10.9822 10.3961 10.8167 10.6064 10.6064C10.8167 10.3961 10.9822 10.1453 11.0928 9.86917C11.2035 9.59305 11.2569 9.29737 11.25 9C11.2569 8.70263 11.2035 8.40695 11.0928 8.13084C10.9822 7.85472 10.8167 7.60391 10.6064 7.39359C10.3961 7.18326 10.1453 7.01778 9.86917 6.90716C9.59305 6.79654 9.29737 6.74307 9 6.75Z"/>
				</svg><span class="caption">Settings</span>
				<div class="ui custom popup bottom left transition hidden layout-popup">
					I'm not on the same level as the button, but i can still be found.
				</div>
			</div>`).appendTo(this._mainToolbar);

		$(this._mainToolbar).appendTo(toolbarWrapper);

		$(this._element).find('.right-top-toolbar').remove();
		const rightToolbar = document.createElement('ul');
		$(rightToolbar).addClass('right-top-toolbar toolbar right floated');

		$(toolWrapper).clone().html(`
			<div class="ui label" key="analysis" style="min-width: 126px;">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
					<path d="M8 0.125C3.65117 0.125 0.125 3.65117 0.125 8C0.125 12.3488 3.65117 15.875 8 15.875C12.3488 15.875 15.875 12.3488 15.875 8C15.875 3.65117 12.3488 0.125 8 0.125ZM8 14.5391C4.38945 14.5391 1.46094 11.6105 1.46094 8C1.46094 4.38945 4.38945 1.46094 8 1.46094C11.6105 1.46094 14.5391 4.38945 14.5391 8C14.5391 11.6105 11.6105 14.5391 8 14.5391Z"/>
				</svg>
				<svg width="12" height="12" style="position:absolute; left: 7px;" viewBox="0 0 8 8" fill="white" xmlns="http://www.w3.org/2000/svg">
					<path d="M7.23438 3.4375H4.5625V0.765625C4.5625 0.688281 4.49922 0.625 4.42188 0.625H3.57812C3.50078 0.625 3.4375 0.688281 3.4375 0.765625V3.4375H0.765625C0.688281 3.4375 0.625 3.50078 0.625 3.57812V4.42188C0.625 4.49922 0.688281 4.5625 0.765625 4.5625H3.4375V7.23438C3.4375 7.31172 3.50078 7.375 3.57812 7.375H4.42188C4.49922 7.375 4.5625 7.31172 4.5625 7.23438V4.5625H7.23438C7.31172 4.5625 7.375 4.49922 7.375 4.42188V3.57812C7.375 3.50078 7.31172 3.4375 7.23438 3.4375Z"/>
				</svg>
				<span class="caption">Create Analysis</span>
			</div>`).appendTo(rightToolbar);


		// layouts
		const chartName = that._chart._layout.name + (that._chart._layout.nameIndex > 0 ? ` (${that._chart._layout.nameIndex})` : '');
		$(toolWrapper).clone().html(`
			<div class="ui label" key="layout">
				<svg class="shared" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path fill-rule="evenodd" clip-rule="evenodd" d="M15.531 9.21888C15.6008 9.28854 15.6562 9.37131 15.694 9.46242C15.7318 9.55354 15.7513 9.65122 15.7513 9.74988C15.7513 9.84853 15.7318 9.94621 15.694 10.0373C15.6562 10.1284 15.6008 10.2112 15.531 10.2809L11.031 14.7809C10.9613 14.8507 10.8785 14.9061 10.7874 14.9439C10.6963 14.9818 10.5986 15.0012 10.5 15.0012C10.4013 15.0012 10.3036 14.9818 10.2125 14.9439C10.1214 14.9061 10.0386 14.8507 9.96897 14.7809L7.71897 12.5309C7.64924 12.4611 7.59392 12.3784 7.55619 12.2873C7.51845 12.1961 7.49902 12.0985 7.49902 11.9999C7.49902 11.9013 7.51845 11.8036 7.55619 11.7125C7.59392 11.6214 7.64924 11.5386 7.71897 11.4689C7.7887 11.3991 7.87149 11.3438 7.9626 11.3061C8.0537 11.2684 8.15136 11.2489 8.24997 11.2489C8.34859 11.2489 8.44624 11.2684 8.53735 11.3061C8.62846 11.3438 8.71124 11.3991 8.78097 11.4689L10.5 13.1894L14.469 9.21888C14.5386 9.14903 14.6214 9.09362 14.7125 9.05581C14.8036 9.018 14.9013 8.99854 15 8.99854C15.0986 8.99854 15.1963 9.018 15.2874 9.05581C15.3785 9.09362 15.4613 9.14903 15.531 9.21888V9.21888Z" fill="#77D570"/>
					<path d="M6.609 5.013C8.10822 3.7202 10.0204 3.00621 12 3C16.035 3 19.3845 6 19.749 9.8685C22.137 10.206 24 12.2055 24 14.6595C24 17.3535 21.753 19.5 19.0305 19.5H5.6715C2.562 19.5 0 17.049 0 13.977C0 11.3325 1.899 9.1425 4.413 8.5875C4.6275 7.293 5.46 6.003 6.609 5.013V5.013ZM7.5885 6.1485C6.453 7.128 5.859 8.3085 5.859 9.2325V9.9045L5.1915 9.978C3.096 10.2075 1.5 11.928 1.5 13.977C1.5 16.1775 3.345 18 5.6715 18H19.0305C20.97 18 22.5 16.482 22.5 14.6595C22.5 12.8355 20.97 11.3175 19.0305 11.3175H18.2805V10.5675C18.282 7.2375 15.492 4.5 12 4.5C10.3798 4.50647 8.81526 5.09165 7.5885 6.15V6.1485Z" fill="#77D570"/>
				</svg>
				<svg class="share" width="24" height="24" viewBox="0 0 24 24" fill="#FCFCFC" xmlns="http://www.w3.org/2000/svg">
					<path fill-rule="evenodd" clip-rule="evenodd" d="M11.469 7.719C11.5386 7.64915 11.6214 7.59374 11.7125 7.55593C11.8036 7.51812 11.9013 7.49866 12 7.49866C12.0986 7.49866 12.1963 7.51812 12.2874 7.55593C12.3785 7.59374 12.4613 7.64915 12.531 7.719L15.531 10.719C15.6007 10.7887 15.656 10.8715 15.6938 10.9626C15.7315 11.0537 15.7509 11.1514 15.7509 11.25C15.7509 11.3486 15.7315 11.4463 15.6938 11.5374C15.656 11.6285 15.6007 11.7113 15.531 11.781C15.4612 11.8507 15.3785 11.906 15.2873 11.9438C15.1962 11.9815 15.0986 12.0009 15 12.0009C14.9014 12.0009 14.8037 11.9815 14.7126 11.9438C14.6215 11.906 14.5387 11.8507 14.469 11.781L12.75 10.0605V15.75C12.75 15.9489 12.671 16.1397 12.5303 16.2803C12.3896 16.421 12.1989 16.5 12 16.5C11.8011 16.5 11.6103 16.421 11.4696 16.2803C11.329 16.1397 11.25 15.9489 11.25 15.75V10.0605L9.53097 11.781C9.39014 11.9218 9.19913 12.0009 8.99997 12.0009C8.80081 12.0009 8.6098 11.9218 8.46897 11.781C8.32814 11.6402 8.24902 11.4492 8.24902 11.25C8.24902 11.0508 8.32814 10.8598 8.46897 10.719L11.469 7.719Z" fill-opacity="0.6"/>
					<path d="M6.609 5.013C8.10822 3.7202 10.0204 3.00621 12 3C16.035 3 19.3845 6 19.749 9.8685C22.137 10.206 24 12.2055 24 14.6595C24 17.3535 21.753 19.5 19.0305 19.5H5.6715C2.562 19.5 0 17.049 0 13.977C0 11.3325 1.899 9.1425 4.413 8.5875C4.6275 7.293 5.46 6.003 6.609 5.013V5.013ZM7.5885 6.1485C6.453 7.128 5.859 8.3085 5.859 9.2325V9.9045L5.1915 9.978C3.096 10.2075 1.5 11.928 1.5 13.977C1.5 16.1775 3.345 18 5.6715 18H19.0305C20.97 18 22.5 16.482 22.5 14.6595C22.5 12.8355 20.97 11.3175 19.0305 11.3175H18.2805V10.5675C18.282 7.2375 15.492 4.5 12 4.5C10.3798 4.50647 8.81526 5.09165 7.5885 6.15V6.1485Z" fill-opacity="0.6"/>
				</svg>
				<span class="caption">${chartName}</span>
				<i class="angle down icon"></i>
				<div class="ui custom popup top left transition hidden layout-setting-popup">
					<div class="ui celled list">
						<div class="item" key="duplicate">
							<div class="content">
								Duplicate Layout
							</div>
						</div>
						<div class="item" key="load">
							<div class="content">
								Load Layout
							</div>
						</div>
						<div class="item" key="new">
							<div class="content">
								New Layout
							</div>
						</div>
						<div class="item" key="rename">
							<div class="content">
								Rename Layout
							</div>
						</div>
					</div>
				</div>
			</div>			
			`).appendTo(rightToolbar);


		$(toolWrapper).clone().html(`
			<div class="ui label goldmetal-bg" key="share">
				Share
			</div>`).css('padding', '0px').css('border', '0px').appendTo(rightToolbar);

		$(rightToolbar).appendTo(toolbarWrapper);

		// more button for mini screen
		$(document.createElement('div')).addClass('ui label more right').attr('key', 'more-right').html(`<i class="icon ui angle right" style="margin: 0px;padding-top: 0px;"></i>`).appendTo(this._element);

		$(document.createElement('div')).addClass('ui label more left').attr('key', 'more-left').html(`<i class="icon ui angle left" style="margin: 0px;padding-top: 0px;"></i>`).appendTo(this._element);

		$(this._element).find('.ui.label').click((event) => {
			let key = $(event.target).attr('key');
			if (!key) {
				key = $(event.target).closest('.ui.label').attr('key');
			}
			this._handleEvent(key);
		});

		$(this._element).find('.ui.label[key="layout"]')
			.popup({
				popup: $('.custom.popup.layout-setting-popup'),
				on: 'click',
				onShow: () => {
					this._activeTool('layout', true);
				},
				onHide: () => {
					that._activeTool('layout', false);
				}
			});

		this.hidingTools();

		$(that._element).find('.layout-setting-popup .ui.celled.list .item').click(event => {
			let key = $(event.target).attr('key');
			if (!key) {
				key = $(event.target).closest('.item').attr('key');
			}
			if (key) {
				$(this._element).find('.ui.label[key="layout"]').popup('hide');
				if (key == 'load') {
					that._openChartLists();
				} else if (key == 'new') {
					that._newLayout();
				} else if (key == 'duplicate') {
					this._chart._pan.saveAs();
				} else if (key == 'share') {
					this._openCollaborate();
				} else if (key == 'rename') {
					this._renameLayout();
				}
			}
		});

		this.shared(false);
	}

	shared = (flag) => {
		this._shared = flag;
		if (flag) {
			$(this._element).find('.ui.label[key="layout"]').addClass('shared');
		} else {
			$(this._element).find('.ui.label[key="layout"]').removeClass('shared');
		}
	}

	hidingTools = () => {
		$(this._element).find('.top-toolbar-wrapper').css('left', 0);
		const curWidth = $(this._element).find('.top-toolbar-wrapper').width();
		const innerWidth = $(this._element).width();
		const flag = curWidth > innerWidth;
		this._pagination = {
			page: Math.floor(curWidth / innerWidth),
			index: 0,
			width: innerWidth,
			limit: curWidth - innerWidth
		}
		if (flag) {
			$(this._element).removeClass('left').addClass('small-screen right');
		} else {
			$(this._element).removeClass('small-screen right');
		}
	}

	_renameLayout = () => {
		const that = this;
		var options = this._chart.options();
		let confirmed = false;
		// options.pan.shape = this._shapes;
		const html = `<div class="modal-body duplicate-modal" style="padding: 10px">
				<div class="content scrolling mini-title">
					<div class="title">
					<h2>Rename Layout</h2>
					<div class="ui label close">
						<svg width="15" height="15" class="close" viewBox="0 0 15 15"  fill="#FCFCFC" xmlns="http://www.w3.org/2000/svg">
						<path d="M2.00029 0.317885L7.50014 5.8172L13 0.334549C13.1083 0.224379 13.2382 0.137874 13.3817 0.0805049C13.5251 0.0231361 13.6789 -0.0038486 13.8333 0.00125733C14.1363 0.0208622 14.4218 0.150057 14.6364 0.364719C14.8511 0.579381 14.9803 0.864834 14.9999 1.16778C15.0014 1.31673 14.9727 1.46444 14.9154 1.60194C14.8581 1.73944 14.7734 1.86387 14.6666 1.96768L9.15009 7.50032L14.6666 13.033C14.8833 13.2429 15.0033 13.5329 14.9999 13.8329C14.9803 14.1358 14.8511 14.4213 14.6364 14.6359C14.4218 14.8506 14.1363 14.9798 13.8333 14.9994C13.6789 15.0045 13.5251 14.9775 13.3817 14.9201C13.2382 14.8628 13.1083 14.7763 13 14.6661L7.50014 9.18345L2.01695 14.6661C1.90867 14.7763 1.7787 14.8628 1.63526 14.9201C1.49182 14.9775 1.33804 15.0045 1.18364 14.9994C0.875017 14.9833 0.583284 14.8535 0.364758 14.635C0.146231 14.4165 0.0164056 14.1248 0.00034112 13.8162C-0.00116684 13.6673 0.0276004 13.5195 0.0848979 13.382C0.142195 13.2445 0.226829 13.1201 0.333665 13.0163L5.85018 7.50032L0.316999 1.96768C0.213171 1.86247 0.131618 1.73741 0.0772107 1.59997C0.0228039 1.46253 -0.00333999 1.31554 0.00034112 1.16778C0.0199479 0.864834 0.149156 0.579381 0.363839 0.364719C0.578521 0.150057 0.864002 0.0208622 1.16698 0.00125733C1.32018 -0.00601838 1.47323 0.0183407 1.6166 0.0728159C1.75997 0.127291 1.89058 0.210715 2.00029 0.317885Z" fill-opacity="0.8"/>
						</svg>
					</div>
					</div>
					<div class="header for-input" style="padding: 18px;">
						<div class="ui label">New Name</div>
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
		$(this._element).find('.modal-body').dialog({
			modal: true,
			width: 640,
			resizable: false,
			classes: {
				'ui-dialog': 'tfa-modal'
			},
			open: event => {
				const modalEl = event.target;
				const chartName = that._chart._layout.name + (that._chart._layout.nameIndex > 0 ? ` (${that._chart._layout.nameIndex})` : '');
				$(modalEl).find('#chart_name').val(chartName);
				that.shared(false);
				$(modalEl).find('.button.ok').click(function () {
					saveName();
				});

				$(modalEl).find('#chart_name').keyup(function (event) {
					var keycode = (event.keyCode ? event.keyCode : event.which);
					if (keycode == '13') {
						saveName();
					}
				});

				function saveName() {
					let chartName = $(modalEl).find('#chart_name').val();
					const oldName = that._chart._layout.name + (that._chart._layout.nameIndex > 0 ? ` (${that._chart._layout.nameIndex})` : '');
					chartName = chartName.trim();
					if (chartName.length > 0 && chartName != oldName) {
						if (!confirmed) {
							confirmed = true;
							$.get({
								url: `${options.hostUrl}/api/layouts/checkname?userId=${options.writerId}&name=${chartName}&id=${that._chart._layout_id}&domainName=${options.domain}`,
								dataType: "json",
								beforeSend: function (x) {
									x.setRequestHeader("Authorization", options.token);
									if (x && x.overrideMimeType) {
										x.overrideMimeType("application/j-son;charset=UTF-8");
									}
								},
								success: res => {
									if (res.existed) {
										$(modalEl).find('.header.for-confirm').addClass('invalid-name');
									}
									chartName = res.index > 0 ? `${res.name} (${res.index})` : res.name;

									if (chartName == oldName) {
										$(modalEl).find('.header.for-confirm h2').html(`The name is ignored as same name.`);
										$(modalEl).find('.content.scrolling').addClass('confirmed');
										$(modalEl).find('.actions').remove();
										if ($('.modal-body').dialog('isOpen')) {
											setTimeout(() => {
												$('.modal-body').dialog('close');
											}, 2000);
										}
										return;
									}

									$(modalEl).find('.header.for-confirm h2').html(`Do you want to rename "${oldName}" layout to "${chartName}"?`)
									$(modalEl).find('.content.scrolling').addClass('confirmed');
								}
							});
							return true;
						}
						$.post({
							url: `${options.hostUrl}/api/layouts/${that._chart._layout_id}`,
							data: {
								data: JSON.stringify({
									name: chartName,
									ownerId: options.writerId,
									domainName: options.domain
								})
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
									that._chart._options.name = res.layout.name;
									that._chart._layout = res.layout;
									const title = `${res.layout.name}` + (res.layout.nameIndex > 0 ? `(${res.layout.nameIndex})` : '');
									$(that._element).find('.ui.label[key="layout"] .caption').html(title);
									that._chart._pan.renderMsgTip('Layout name changed!');
									that.shared(false);
								}
							}
						});
						if ($('.modal-body').dialog('isOpen')) {
							$('.modal-body').dialog('close');
						}
					} else if (chartName == that._chart._layout.name) {
						Swal.fire('Input Error', 'The name is same as orignal. Please enter another name', 'error');
					} else {
						Swal.fire('Input Error', 'Please enter layout name', 'error');
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

	_handleEvent = key => {
		switch (key) {
			case 'symbol':
				this._openSymbolSetting();
				break;
			case 'indicator':
				this._openIndicators();
				break;
			case 'setting':
				this._openSetting();
				break;
			case 'zoomout':
				this._chart._pan.zooming(-100);
				break;
			case 'zoomin':
				this._chart._pan.zooming(100);
				break;
			case 'reset':
				this._chart._pan.reset();
				break;
			case 'snapshot':
				this._chart._pan.snapshot();
				break;
			case 'save':
				this._chart._pan.saveAs();
				break;
			case 'open':
				this._openChartLists();
				break;
			case 'collaborate':
				this._openCollaborate();
				break;
			case 'share':
				this._openCollaborate();
				break;
			case 'new':
				this._newChart();
				break;
			case 'analysis':
				this._chart._pan.selectShape('analysis')
				this._activeTool('analysis', true);
				break;
			case 'more-right':
			case 'more-left':
				if (key == 'more-right') {
					this._pagination.index++;
				} else {
					this._pagination.index--;
				}
				if (this._pagination.index > this._pagination.page) {
					this._pagination.index = this._pagination.page;
				}
				if (this._pagination.index < 0) {
					this._pagination.index = 0;
				}

				let offset = this._pagination.index * this._pagination.width;

				if (this._pagination.page > 0 && offset >= this._pagination.limit) {
					offset = this._pagination.limit + 20;
					this._pagination.index = this._pagination.page
				}

				if (this._pagination.index <= 0) {
					$(this._element).removeClass('left').addClass('right');
				} else if (this._pagination.index >= this._pagination.page) {
					$(this._element).removeClass('right').addClass('left');
				} else {
					$(this._element).removeClass('right left');
				}

				$('.top-toolbar-wrapper').css('left', -offset);
				break;
			default:
				break;
		}
	}

	_activeTool = (key, flag) => {
		$(this._element).find(`.top-toolbar-wrapper li.active`).removeClass('active');
		if (key && flag) {
			$(this._element).find(`.top-toolbar-wrapper li .ui.label[key="${key}"]`).closest('li').addClass('active');
		}
	}

	_openSymbolSetting = () => {
		this._activeTool('symbol', true);
		var option = this._chart.options();

		let categoriesPan = '<div class="ui label cat-label active" key="all">All</div>';
		const currencyTypes = _.groupBy(this._symbol_datas, 'type');
		Object.keys(currencyTypes).forEach(type => {
			categoriesPan += `<div class="ui label cat-label" key="${type}">${type}</div>`
		});
		this._category = 'all';
		const that = this;
		this._channelSetting = {
			flag: false,
			symbols: []
		};
		// $(this._element).append(getModalTemplate('symbol'));
		$(getModalTemplate('symbol')).dialog({
			modal: true,
			width: 837,
			height: 558,
			resizable: false,
			classes: {
				'ui-dialog': 'tfa-symbol-dialog tfa-modal'
			},
			open: event => {
				const modalEl = event.target;

				$(modalEl).find('.content.scrolling>.sub-header').prepend(categoriesPan);
				// render channel
				if (option.callFn.getActivatedChannel && typeof option.callFn.getActivatedChannel == 'function') {
					const channelInfo = option.callFn.getActivatedChannel();
					$(modalEl).find('.sub-header .channel-enable .title').html('#' + channelInfo.name);
					that._channelSetting.symbols = channelInfo.symbols;
				}
				this._renderSymbols(modalEl);
				$(modalEl).find('.content .sub-header .ui.label').click(e => {
					var obj = e.target;
					if (!$(obj).hasClass('cat-label')) {
						obj = $(e.target).closest('.cat-label');
					}
					const key = $(obj).attr('key');
					if (key)
						this._category = key;
					$(modalEl).find('.content .sub-header .ui.label').removeClass('active');
					$(obj).addClass('active');
					this._renderSymbols(modalEl);
				});

				// channel checkbox
				$(modalEl).find('.sub-header .ui.checkbox').checkbox({
					onChecked: () => {
						that._channelSetting.flag = true;
						that._renderSymbols(modalEl);
					},
					onUnchecked: () => {
						that._channelSetting.flag = false;
						that._renderSymbols(modalEl);
					}
				})

				// search function
				$(modalEl).find('#search_key').keyup(e => {
					this._search_key = $(e.target).val();
					this._renderSymbols(modalEl);
				});

				// close button
				$(modalEl).find('.title .ui.label.close').click(() => {
					if ($('.chart-symbol-modal').dialog('isOpen')) {
						$('.chart-symbol-modal').dialog('close');
					}
				});
			},
			close: event => {
				$(event.target).remove();
				this._activeTool('symbol', false);
			}
		});
	}

	_renderSymbols = (modalEl) => {
		const options = this._chart.options();
		const filtered = this._channelSetting.flag ? this._channelSetting.symbols : (this._category == 'all' ? this._symbol_datas : this._symbol_datas.filter(item => item.type === this._category));
		this._currencies = _.sortBy(filtered, ['name']);
		let html = '';

		this._currencies.filter(item => {
			if (this._search_key.length > 0) {
				return item.name.replace('/', '').toUpperCase().indexOf(this._search_key.toUpperCase()) > -1;
			} else {
				return true;
			}
		}).forEach((item) => {
			const value = item.provider ? item.provider + ':' + item.name : item.name;
			html += `<div class="item ${this._boost_list.indexOf(item.name) > -1? 'boost': ''}" key="${value}">
				<div class="content title">
					${item.name.replace('/', '').toUpperCase()}
				</div>
				<div class="content">
					${item.description.toUpperCase()}
				</div>
				<div class="ui label chat circular">
					<svg width="16" height="14" viewBox="0 0 16 14" fill="#FCFCFC" xmlns="http://www.w3.org/2000/svg">
						<path fill-rule="evenodd" clip-rule="evenodd" d="M2.5128 1.07684H12.564C12.9639 1.07684 13.3474 1.24702 13.6301 1.54994C13.9129 1.85286 14.0717 2.26371 14.0717 2.69211V8.07633C14.0717 8.50472 13.9129 8.91557 13.6301 9.21849C13.3474 9.52141 12.9639 9.69159 12.564 9.69159H7.53842C7.47238 9.69147 7.40696 9.70529 7.34591 9.73226C7.28485 9.75924 7.22936 9.79884 7.18261 9.84881L5.02561 12.1608V10.23C5.02561 10.0872 4.97266 9.95026 4.87841 9.84929C4.78417 9.74832 4.65634 9.69159 4.52305 9.69159H2.5128C2.11294 9.69159 1.72945 9.52141 1.44671 9.21849C1.16396 8.91557 1.00512 8.50472 1.00512 8.07633V2.69211C1.00512 2.26371 1.16396 1.85286 1.44671 1.54994C1.72945 1.24702 2.11294 1.07684 2.5128 1.07684ZM12.564 0H2.5128C1.84636 0 1.20722 0.283632 0.735979 0.7885C0.264736 1.29337 -5.72205e-06 1.97812 -5.72205e-06 2.69211V8.07633C-5.72205e-06 8.42986 0.06499 8.77993 0.19127 9.10655C0.317551 9.43317 0.502643 9.72995 0.735979 9.97993C0.969315 10.2299 1.24632 10.4282 1.55119 10.5635C1.85606 10.6988 2.18282 10.7684 2.5128 10.7684H4.02049V13.4605C4.02031 13.5672 4.04969 13.6715 4.1049 13.7602C4.16011 13.8489 4.23866 13.9181 4.3306 13.9589C4.42255 13.9997 4.52374 14.0104 4.62134 13.9895C4.71895 13.9687 4.80857 13.9172 4.87886 13.8417L7.74648 10.7684H12.564C13.2305 10.7684 13.8696 10.4848 14.3409 9.97993C14.8121 9.47507 15.0768 8.79032 15.0768 8.07633V2.69211C15.0768 1.97812 14.8121 1.29337 14.3409 0.7885C13.8696 0.283632 13.2305 0 12.564 0Z"/>
						<path d="M10.1667 6.16274H8.73333L8.97667 4.82941H10.1667C10.2551 4.82941 10.3399 4.79429 10.4024 4.73178C10.4649 4.66926 10.5 4.58448 10.5 4.49607C10.5 4.40767 10.4649 4.32288 10.4024 4.26037C10.3399 4.19786 10.2551 4.16274 10.1667 4.16274H9.09667L9.32667 2.89274C9.33575 2.84818 9.33563 2.80222 9.32629 2.75771C9.31695 2.71319 9.29861 2.67106 9.27238 2.6339C9.24615 2.59675 9.21259 2.56535 9.17378 2.54165C9.13496 2.51794 9.0917 2.50243 9.04667 2.49607C9.00189 2.48541 8.95538 2.48413 8.91009 2.49232C8.86479 2.50052 8.82168 2.518 8.78347 2.54368C8.74527 2.56936 8.7128 2.60267 8.6881 2.64152C8.66341 2.68037 8.64703 2.72391 8.64 2.76941L8.39 4.16274H7.09667L7.32667 2.89274C7.33575 2.84818 7.33563 2.80222 7.32629 2.75771C7.31695 2.71319 7.29861 2.67106 7.27238 2.6339C7.24615 2.59675 7.21259 2.56535 7.17378 2.54165C7.13496 2.51794 7.0917 2.50243 7.04667 2.49607C7.00189 2.48541 6.95538 2.48413 6.91009 2.49232C6.86479 2.50052 6.82168 2.518 6.78347 2.54368C6.74527 2.56936 6.7128 2.60267 6.6881 2.64152C6.66341 2.68037 6.64703 2.72391 6.64 2.76941L6.39 4.16274H4.83333C4.74493 4.16274 4.66014 4.19786 4.59763 4.26037C4.53512 4.32288 4.5 4.40767 4.5 4.49607C4.5 4.58448 4.53512 4.66926 4.59763 4.73178C4.66014 4.79429 4.74493 4.82941 4.83333 4.82941H6.26667L6.02333 6.16274H4.83333C4.74493 6.16274 4.66014 6.19786 4.59763 6.26037C4.53512 6.32288 4.5 6.40767 4.5 6.49607C4.5 6.58448 4.53512 6.66926 4.59763 6.73178C4.66014 6.79429 4.74493 6.82941 4.83333 6.82941H5.90333L5.67333 8.09941C5.66424 8.14397 5.66437 8.18993 5.67371 8.23444C5.68305 8.27895 5.70139 8.32109 5.72762 8.35824C5.75385 8.3954 5.78741 8.4268 5.82622 8.4505C5.86504 8.47421 5.9083 8.48971 5.95333 8.49607C5.99811 8.50674 6.04462 8.50802 6.08991 8.49982C6.13521 8.49163 6.17832 8.47414 6.21652 8.44847C6.25473 8.42279 6.2872 8.38947 6.31189 8.35062C6.33659 8.31178 6.35297 8.26823 6.36 8.22274L6.61 6.82941H7.90333L7.67333 8.09941C7.66424 8.14397 7.66437 8.18993 7.67371 8.23444C7.68304 8.27895 7.70139 8.32109 7.72762 8.35824C7.75385 8.3954 7.78741 8.4268 7.82622 8.4505C7.86504 8.47421 7.9083 8.48971 7.95333 8.49607C7.99811 8.50674 8.04462 8.50802 8.08991 8.49982C8.13521 8.49163 8.17832 8.47414 8.21652 8.44847C8.25473 8.42279 8.2872 8.38947 8.31189 8.35062C8.33659 8.31178 8.35297 8.26823 8.36 8.22274L8.61 6.82941H10.1667C10.2551 6.82941 10.3399 6.79429 10.4024 6.73178C10.4649 6.66926 10.5 6.58448 10.5 6.49607C10.5 6.40767 10.4649 6.32288 10.4024 6.26037C10.3399 6.19786 10.2551 6.16274 10.1667 6.16274ZM6.73333 6.16274L6.97667 4.82941H8.26667L8.02333 6.16274H6.73333Z"/>
					</svg>
				</div>				
			</div>`;
		});
		$(modalEl).find('.ui.dimmer').removeClass('confirm active');
		$(modalEl).find('.content .scrolling-content .layout-contents').html(html);

		$(modalEl).find('.content .ui.list.layout-contents .item').click(e => {
			var obj = e.target;
			if (!$(obj).hasClass('item')) {
				obj = $(e.target).closest('.item');
			}
			const key = $(obj).attr('key');
			if (key) {
				if (key.indexOf(':') > 0) {
					const ccs = key.split(':');
					this._currency = this._currencies.filter(item => (item.provider === ccs[0] && item.name === ccs[1]))[0];
				} else {
					this._currency = this._currencies.filter(item => (item.name === key))[0];
				}
				this.setSymbol(this._currency);

				if (options.callFn.symbolChanged && typeof options.callFn.symbolChanged == 'function') {
					options.callFn.symbolChanged(this._currency, () => {
						$('.chart-symbol-modal').dialog('close');
					});
				}
			}
		});
	}

	setSymbol = (symbol) => {
		this._chart._pan.initPen();
		this._chart._options.topToolbar.currency = symbol;
		let layoutShapes = this._chart._layout.shapes && this._chart._layout.shapes[symbol.name];
		if (layoutShapes && layoutShapes.length > 0) {
			layoutShapes = layoutShapes.filter(shape => (shape.kind != 'analysis'));
		}
		this._chart._pan._shapes = layoutShapes || [];
		this._chart._options.pan.shape = this._chart._pan._shapes;
		if (this._chart._loaded) {
			this._chart._pan.loadData();
		}
		$(this._element).find('.ui.label[key="symbol"]').html(symbol.name.replace('/', '').toUpperCase());
	}

	_openIndicators = () => {
		const that = this;
		this._activeTool('indicator', true);
		// $(this._element).append(getModalTemplate('indicator'));
		$(getModalTemplate('indicator')).dialog({
			modal: true,
			title: 'Indicator Shape Lists',
			width: 450,
			height: 300,
			resizable: false,
			classes: {
				'ui-dialog': 'tfa-modal'
			},
			open: event => {
				const modalEl = event.target;
				const rect = $(that._element).find('.ui.label[key="indicator"]')[0].getBoundingClientRect();
				$(modalEl).closest('.ui-dialog').css('top', rect.bottom + 10).css('left', rect.left);
				$(modalEl).find('input').keyup((event) => {
					const key = $(event.target).val();
					this._redrawIndicators(modalEl, CIndicators.filter(item => item.label.toLowerCase().indexOf(key.toLowerCase()) >= 0));
				});
				this._redrawIndicators(modalEl, CIndicators);

				$('.ui-widget-overlay').click(() => {
					$(modalEl).dialog('close');
				});

				// close button
				$(modalEl).find('.title .ui.label.close').click(() => {
					if ($('.indicator-modal').dialog('isOpen')) {
						$('.indicator-modal').dialog('close');
					}
				});
			},
			close: event => {
				$(event.target).remove();
				$('.colorpicker').remove();
				this._activeTool('symbol', false);
			}
		});
	}

	_redrawIndicators = (parent, items) => {
		const that = this;
		const options = this._chart.options();

		const html = items.map(indicator => {
			return `<div class="item" key="${indicator.key}">${indicator.label}</div>`;
		});
		$(parent).find('.indicator-lists').html(html.join(''));
		// tslint:disable-next-line:typedef
		$(parent).find('.item').click((event) => {
			const key = $(event.target).attr('key');
			$.get({
				url: `${options.hostUrl}/api/shape-template/search?shape_type=${key}&owner=${options.ownerId}&key=default`,
				dataType: "json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", options.token);
				},
				success: res => {
					if (res.status.toLowerCase() === 'ok') {
						const option = _.merge(res.shape, {
							id: CreateUUID()
						});
						that._chart._pan.selectShape(key, res.shape);
					} else {
						that._chart._pan.selectShape(key);
					}
				}
			});
		});
	}

	_openSetting = () => {
		this._activeTool('setting', true);
		const that = this;
		let option = this._chart.options().pan;
		const panOption = _.cloneDeep(option);
		let colorPickers = {};

		// $(this._element).append(getModalTemplate('setting'));
		$(getModalTemplate('setting')).dialog({
			modal: true,
			title: 'Main Chart Setting',
			width: 485,
			height: 605,
			resizable: false,
			classes: {
				'ui-dialog': 'tfa-modal'
			},
			open: event => {
				const modalEl = event.target;
				const theme = option[option.theme];
				['backgroundColor', 'color', 'body.rising', 'body.falling', 'wick.rising', 'wick.falling'].forEach(container => {
					const color = _.get(theme, container);
					$(modalEl).find(`.color-wrapper[key="${container}"]`).val(color).spectrum({
						// coloe: color,
						showPaletteOnly: false,
						togglePaletteOnly: false,
						showInput: true,
						showAlpha: true,
						beforeShow: function (color) {
							color = _.get(theme, container);
							$(modalEl).find(`.color-wrapper[key="${container}"]`).spectrum('set', color);
						},
						change: color => {
							_.set(option[option.theme], container, color.toRgbString());
							that._chart._pan.renderChartWithCustomStyle();
						}
					});
				});

				$(modalEl).find('.ui.label.chart-type').removeClass('active');
				$(modalEl).find(`.ui.label.chart-type[key="${option.mainType}"]`).addClass('active');

				$(modalEl).find('.ui.label.chart-type').on('click', (e) => {
					let key = $(e.target).attr('key');
					var obj = e.target;
					if (!key) {
						obj = $(e.target).closest('.chart-type');
						key = $(obj).attr('key');
					}
					$(modalEl).find('.ui.label.chart-type').removeClass('active');
					$(obj).addClass('active');
					that._chart._options.pan.mainType = key;
					that._chart._pan.renderChartWithCustomStyle();
				})

				$(modalEl).find('.ui.label.ok').on('click', () => {
					that._chart._layout.theme = {
						mainType: option.mainType,
						light: option.light,
						dark: option.dark,
						theme: option.theme
					};

					if (that._chart._socket !== null) {
						const data = {
							chartId: that._chart._options._id,
							layoutId: that._chart._layout._id,
							expecting: {
								theme: that._chart._layout.theme
							},
							verb: 'update',
							editor: that._chart._options.writerId,
							transactionId: that._chart._socket_transaction_id,
							field: 'theme'
						}

						that._chart._socket.emit("rtTfaChart:Updating", data);
					}
					$(modalEl).dialog('close');
				});

				$('.ui-widget-overlay').click(() => {
					$(modalEl).dialog('close');
				});

				$(modalEl).find('.ui.label.cancel').on('click', () => {
					that._chart._options.pan = JSON.parse(JSON.stringify(panOption));
					that._chart._pan.renderChartWithCustomStyle();
					$(modalEl).dialog('close');
				});

				$(modalEl).find('.ui.label.close').on('click', () => {
					that._chart._options.pan = JSON.parse(JSON.stringify(panOption));
					that._chart._pan.renderChartWithCustomStyle();
					$(modalEl).dialog('close');
				});

				$(modalEl).find('.ui.label.default').on('click', () => {
					const clonedOptions = _.cloneDeep(that._default);
					that._chart._options.pan = clonedOptions.pan;
					option = clonedOptions.pan;
					that._chart._pan.renderChartWithCustomStyle();
					that._initColorSetting(modalEl, clonedOptions.pan[clonedOptions.pan.theme]);
					$(modalEl).find('.ui.checkbox').checkbox(clonedOptions.pan.theme == 'dark' ? 'set checked' : 'set unchecked');
				});

				$(modalEl).find('.ui.checkbox').checkbox(option.theme == 'dark' ? 'set checked' : 'set unchecked');
				$(modalEl).find('.ui.checkbox').checkbox({
					onChecked: function () {
						option.theme = 'dark';
						that._chart._pan.renderChartWithCustomStyle();
						that._initColorSetting(modalEl, option[option.theme]);
					},
					onUnchecked: function () {
						option.theme = 'light';
						that._chart._pan.renderChartWithCustomStyle();
						that._initColorSetting(modalEl, option[option.theme]);
					}
				})
			},
			close: event => {
				['backgroundColor', 'color', 'body.rising', 'body.falling', 'wick.rising', 'wick.falling'].forEach(container => {
					$(event.target).find(`.color-wrapper[key="${container}"]`).spectrum('destroy')
				});
				$(event.target).remove();
				this._activeTool('setting', false);
			}
		});
	}

	_initColorSetting = (modalEl, theme) => {
		['backgroundColor', 'color', 'body.rising', 'body.falling', 'wick.rising', 'wick.falling'].forEach(container => {
			const color = _.get(theme, container);
			$(modalEl).find(`.color-wrapper[key="${container}"]`).css('backgroundColor', color).attr('color', color).spectrum('set', color);
		});
	}

	_openChartLists = () => {
		var option = this._chart.options();

		// $(this._element).append(getModalTemplate('layout'));
		$(getModalTemplate('layout')).dialog({
			modal: true,
			width: 527,
			height: 726,
			resizable: false,
			classes: {
				'ui-dialog': 'tfa-chart-loading-dialog tfa-modal'
			},
			open: event => {
				const modalEl = event.target;
				const title = {
					name: 'ALPHABETICAL',
					created_at: 'DATE CREATED',
					updated_at: 'DATE EDITED'
				}
				$(modalEl).find('.sub-header .ui.label.order .title').html(title[this._sorts.key]);
				this._renderLayoutLists(modalEl);
			},
			close: event => {
				$(event.target).remove();
			}
		});
	}

	_renderLayoutLists = (modalEl, refresh = false) => {
		const that = this;
		var option = this._chart.options();
		$(modalEl).find('.ui.dimmer').addClass('active');
		$.get({
			url: `${option.hostUrl}/api/layouts?userId=${option.writerId}&domainName=${option.domain}`,
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader("Authorization", option.token);
			},
			success: res => {
				$(modalEl).find('.ui.dimmer').removeClass('confirm active');
				if (res.status.toLowerCase().toLowerCase() == 'ok') {
					const html = that._getChartTableBody(res.layouts);
					$(modalEl).find('.content .scrolling-content .layout-contents').html(html);
					if (refresh) {
						this._selectLayoutItem(modalEl, res.layouts);
					} else {
						that._addLayoutModalEvents(modalEl, res.layouts);
					}
				} else {
					Swal.fire('Load Chart Error', 'There are some errors on server!', 'error');
				}
			},
			error: e => {
				$(modalEl).find('.ui.dimmer').removeClass('confirm active');
				Swal.fire('Load Chart Error', 'There are some errors on server!', 'error');
			}
		})
	}

	_addLayoutModalEvents = (modalEl, charts) => {
		const that = this;
		var option = this._chart.options();
		this._tempChartId = null;
		$(modalEl).find('#search_key').keyup(e => {
			that._search_key = $(e.target).val();
			const html = that._getChartTableBody(charts);
			$(modalEl).find('.content .scrolling-content .layout-contents').html(html);
		});

		$(modalEl).find('.title .ui.label.close').click(() => {
			if ($('.chart-layouts-modal').dialog('isOpen')) {
				$('.chart-layouts-modal').dialog('close');
			}
		});

		$(modalEl).find('.sub-header .ui.label.order')
			.popup({
				html: getPopupTemplate('order'),
				className: {
					popup: 'ui popup custom modals-popup order'
				},
				position: 'bottom right',
				on: 'click',
				onShow: () => {
					$(`.modals-popup.order .item.active`).removeClass('active');
					$(`.modals-popup.order .item[key="${that._sorts.key}"]`).addClass('active');
					$(`.modals-popup.order .item[key="${that._sorts.order}"]`).addClass('active');
					$('.modals-popup.order .list .item').click(event => {
						let key = $(event.target).attr('key');
						if (!key) {
							key = $(event.target).closest('.item').attr('key');
						}
						if (key) {
							if (['order_by', 'sort_by'].indexOf(key) > -1) {
								return;
							}
							if (['name', 'created_at', 'updated_at'].indexOf(key) > -1) {
								that._sorts.key = key;
							} else {
								that._sorts.order = key;
								if (key == 'desc') {
									$(modalEl).find('.content.scrolling').removeClass('down up').addClass('down');
								} else {
									$(modalEl).find('.content.scrolling').removeClass('down up').addClass('up');
								}
							}

							$(`.modals-popup.order .item.active`).removeClass('active');
							$(`.modals-popup.order .item[key="${that._sorts.key}"]`).addClass('active');
							$(`.modals-popup.order .item[key="${that._sorts.order}"]`).addClass('active');

							const title = {
								name: 'ALPHABETICAL',
								created_at: 'DATE CREATED',
								updated_at: 'DATE EDITED'
							}
							$(modalEl).find('.sub-header .ui.label.order').popup('hide');
							$(modalEl).find('.sub-header .ui.label.order .title').html(title[key]);
							const html = that._getChartTableBody(charts);
							$(modalEl).find('.content .scrolling-content .layout-contents').html(html);
							that._selectLayoutItem(modalEl, charts);
						}
					});
				}
			});

		this._selectLayoutItem(modalEl, charts);

		$(modalEl).find('.scrolling-content .ui.dimmer .actions .ui.button').click(e => {
			const key = $(e.target).attr('key');
			if (key == 'ok') {
				$(modalEl).find('.ui.dimmer').removeClass('confirm');
				if (that._tempChartId) {
					$.ajax({
						url: `${option.hostUrl}/api/layouts/${that._tempChartId}`,
						type: 'DELETE',
						beforeSend: function (xhr) {
							xhr.setRequestHeader("Authorization", option.token);
						},
						data: {
							theme: this._chart._options.defaultTheme
						},
						success: function (result) {
							if (result.status == 'ok') {
								that._chart._layout = result.layout;
								if (result.layout._id == that._chart._layout_id) {
									const chartName = result.layout.name + (result.layout.nameIndex > 0 ? `(${result.layout.nameIndex})` : '');
									$(that._element).find('.ui.label[key="layout"] .caption').html(chartName);
									that._renderLayoutLists(modalEl, true);
								} else {
									if ($('.chart-layouts-modal').dialog('isOpen')) {
										$('.chart-layouts-modal').dialog('close');
									}
									that._chart._layout_id = result.layout._id;
									option.name = result.layout.name;
									option.topToolbar.interval = result.layout.interval;
									_.merge(option.pan, result.layout.theme);
									const shapes = result.layout.shapes && result.layout.shapes[option.topToolbar.currency.name];
									option.pan.shape = shapes || [];
									option.pan.viewport.x = result.layout.timeRange;
									option.collaborate = result.layout.collaborate;
									that._chart.loadChart(option);
								}
							}
						},
						error: e => {
							Swal.fire('Load Chart Error', 'There are some errors on server!', 'error');
						}
					});
				} else {
					$(modalEl).find('.ui.dimmer').removeClass('confirm active');
				}
			} else {
				$(modalEl).find('.ui.dimmer').removeClass('confirm active');
			}
		})
	};

	_selectLayoutItem = (modalEl, charts) => {
		const option = this._chart.options();
		const that = this;
		// favorite
		$(modalEl).find('.scrolling-content .ui.list .item>svg').click(e => {
			// $(modalEl).find('.ui.dimmer').removeClass('confirm active');
			var obj = $(e.target);
			if (!$(e.target).hasClass('.item')) obj = $(e.target).closest('.item');
			var chartId = obj.attr('key');
			const data = {
				isFavorite: true,
				ownerId: option.writerId,
				domain: option.domain
			};
			if ($(obj).hasClass('is-favorite')) {
				data.isFavorite = false;
			}
			this._saveLayout(modalEl, data, chartId, false);
			e.preventDefault();
			return false;
		});

		// default
		$(modalEl).find('.scrolling-content .ui.list .item').click(e => {
			// $(modalEl).find('.ui.dimmer').removeClass('confirm active');
			var obj = $(e.target);
			if (!$(e.target).hasClass('.item')) obj = $(e.target).closest('.item');
			var chartId = obj.attr('key');
			const data = {
				isDefault: true,
				ownerId: option.writerId,
				domain: option.domain
			};
			this._saveLayout(modalEl, data, chartId, true);
			e.preventDefault();
			return false;
		});

		// delete
		$(modalEl).find('.scrolling-content .ui.list .item .ui.label.delete').click(e => {
			// $(modalEl).find('.ui.dimmer').removeClass('confirm active');
			var obj = $(e.target).closest('.item');
			var chartId = obj.attr('key');
			const chart = charts.find(item => (item._id == chartId));
			that._tempChartId = chartId;
			$(modalEl).find('.ui.dimmer #chart_name').html(chart.name);
			$(modalEl).find('.ui.dimmer').addClass('active confirm');
			e.preventDefault();
			return false;
		});
	}

	_getChartTableBody = (data) => {
		return this._makeItemLists(data.filter(layout => (layout.isFavorite))) + this._makeItemLists(data.filter(layout => (!layout.isFavorite)));
	}

	_makeItemLists = (data) => {
		let html = '';
		const that = this;
		const selectedKey = this._sorts.key;
		data.filter(layout => {
				if (this._search_key.length > 0) {
					return layout.name.toLowerCase().indexOf(this._search_key.toLowerCase()) >= 0 || layout.symbol.name.replace('/', '').toLowerCase().indexOf(this._search_key.toLowerCase()) >= 0;
				} else {
					return true;
				}
			})
			.sort((a, b) => {
				if (selectedKey.indexOf('at') > 0) {
					return that._sorts.order == 'desc' ? new Date(b[selectedKey]) - new Date(a[selectedKey]) : new Date(a[selectedKey]) - new Date(b[selectedKey]);
				} else {
					const nameA = a.name.toUpperCase(); // ignore upper and lowercase
					const nameB = b.name.toUpperCase(); // ignore upper and lowercase
					if (nameA < nameB) {
						return that._sorts.order == 'desc' ? 1 : -1;
					}
					if (nameA > nameB) {
						return that._sorts.order == 'desc' ? -1 : 1;
					}

					// names must be equal
					return 0;
				}
			}).forEach(layout => {
				const title = `${layout.name}` + (layout.nameIndex > 0 ? `(${layout.nameIndex})` : '');
				let svg = `<svg width="25" class="favorite none" height="23" viewBox="0 0 25 23" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M12.6121 1.61248L14.9538 8.79233L15.0663 9.13729H15.4292H23.002L16.8771 13.5704L16.5819 13.784L16.6949 14.1305L19.0354 21.3065L12.9052 16.8695L12.6121 16.6573L12.3189 16.8695L6.18873 21.3065L8.52924 14.1305L8.64223 13.784L8.34704 13.5704L2.22216 9.13729H9.79496H10.1578L10.2703 8.79233L12.6121 1.61248Z" stroke="#80AAC7"/>
				</svg>`
				if (layout.isFavorite) {
					svg = `<svg width="25" height="23" class="favorite" viewBox="0 0 25 23" fill="#B2B2B2" xmlns="http://www.w3.org/2000/svg">
					<path d="M12.6124 1.61248L14.9542 8.79233L15.0667 9.13729H15.4296H23.0023L16.8775 13.5704L16.5823 13.784L16.6953 14.1305L19.0358 21.3065L12.9056 16.8695L12.6124 16.6573L12.3193 16.8695L6.1891 21.3065L8.5296 14.1305L8.64259 13.784L8.34741 13.5704L2.22253 9.13729H9.79532H10.1582L10.2707 8.79233L12.6124 1.61248Z"/>
				</svg>`
				} else if (layout.isDefault) {
					svg = `<svg width="25" height="23" class="favorite" viewBox="0 0 25 23" fill="#1B1C1D" xmlns="http://www.w3.org/2000/svg">
					<path d="M12.5 1.61804L14.8309 8.7918L14.9432 9.13729H15.3064H22.8494L16.747 13.5709L16.4531 13.7844L16.5654 14.1299L18.8963 21.3037L12.7939 16.8701L12.5 16.6565L12.2061 16.8701L6.10374 21.3037L8.43464 14.1299L8.54689 13.7844L8.253 13.5709L2.15064 9.13729H9.69357H10.0568L10.1691 8.7918L12.5 1.61804Z" fill-opacity="0.8" stroke="black"/>
				</svg>`
				}
				html += `<div class="item ${layout.isDefault? 'is-default': ''} ${layout.isFavorite? 'is-favorite': ''}" key="${layout._id}">
				${svg}
				<div class="content">
					<div class="header">${that._getBoldFont(title)}</div>
					<div class="description">${layout.interval.label} <span class="date-time">Last Edited: ${moment(layout.created_at).format('M/DD/YYYY HH:mm')}</span></div>
				</div>
				<div class="ui label delete">
					<svg width="15" height="15" viewBox="0 0 15 15"  fill="#FCFCFC" xmlns="http://www.w3.org/2000/svg">
						<path d="M2.00029 0.317885L7.50014 5.8172L13 0.334549C13.1083 0.224379 13.2382 0.137874 13.3817 0.0805049C13.5251 0.0231361 13.6789 -0.0038486 13.8333 0.00125733C14.1363 0.0208622 14.4218 0.150057 14.6364 0.364719C14.8511 0.579381 14.9803 0.864834 14.9999 1.16778C15.0014 1.31673 14.9727 1.46444 14.9154 1.60194C14.8581 1.73944 14.7734 1.86387 14.6666 1.96768L9.15009 7.50032L14.6666 13.033C14.8833 13.2429 15.0033 13.5329 14.9999 13.8329C14.9803 14.1358 14.8511 14.4213 14.6364 14.6359C14.4218 14.8506 14.1363 14.9798 13.8333 14.9994C13.6789 15.0045 13.5251 14.9775 13.3817 14.9201C13.2382 14.8628 13.1083 14.7763 13 14.6661L7.50014 9.18345L2.01695 14.6661C1.90867 14.7763 1.7787 14.8628 1.63526 14.9201C1.49182 14.9775 1.33804 15.0045 1.18364 14.9994C0.875017 14.9833 0.583284 14.8535 0.364758 14.635C0.146231 14.4165 0.0164056 14.1248 0.00034112 13.8162C-0.00116684 13.6673 0.0276004 13.5195 0.0848979 13.382C0.142195 13.2445 0.226829 13.1201 0.333665 13.0163L5.85018 7.50032L0.316999 1.96768C0.213171 1.86247 0.131618 1.73741 0.0772107 1.59997C0.0228039 1.46253 -0.00333999 1.31554 0.00034112 1.16778C0.0199479 0.864834 0.149156 0.579381 0.363839 0.364719C0.578521 0.150057 0.864002 0.0208622 1.16698 0.00125733C1.32018 -0.00601838 1.47323 0.0183407 1.6166 0.0728159C1.75997 0.127291 1.89058 0.210715 2.00029 0.317885Z" fill-opacity="0.8"/>
					</svg>
				</div>				
			</div>`;
			});
		return html;
	}

	_getBoldFont = (value) => {
		if (this._search_key.length > 0) {
			const sIndex = value.toLowerCase().indexOf(this._search_key);
			if (sIndex > -1) {
				const prev = value.substr(0, sIndex);
				const seed = value.substr(sIndex, this._search_key.length);
				const remain = value.substr(sIndex + this._search_key.length);
				return `${prev}<b>${seed}</b>${remain}`;
			}
		}
		return value;
	}

	_saveLayout = (modalEl, data, chartId, refresh, cb) => {
		$(modalEl).find('.ui.dimmer').addClass('active')
		var option = this._chart.options();
		const that = this;
		if (!chartId) {
			chartId = this._chart._layout_id;
		}
		const url = `${option.hostUrl}/api/layouts${chartId != null? '/' + chartId: ''}`;
		$.post({
			url: url,
			data: {
				data: JSON.stringify(data)
			},
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader("Authorization", option.token);
			},
			success: res => {
				$(modalEl).find('.ui.dimmer').removeClass('active');
				if (refresh && $('.chart-layouts-modal').dialog('isOpen')) {
					$('.chart-layouts-modal').dialog('close');
				}
				if (res.status.toLowerCase().toLowerCase() === 'ok') {
					if (refresh) {
						that._chart._layout_id = res.layout._id;
						that._chart._layout = res.layout;
						option.name = res.layout.name;
						option.topToolbar.interval = res.layout.interval;
						_.merge(option.pan, res.layout.theme);
						const shapes = res.layout.shapes && res.layout.shapes[option.topToolbar.currency.name];
						option.pan.shape = shapes || [];
						// option.pan.viewport.x = res.layout.timeRange;
						option.collaborate = res.layout.collaborate;
						this._chart.loadChart(option);
					}
					if (modalEl) {
						that._renderLayoutLists(modalEl, true);
					}
					if (cb) {
						cb(res.layout);
					}
					$(that._element).find('.ui.label[key="layout"]').addClass('shared');
				} else {
					Swal.fire('Layout Saving Error', 'There are some errors on server!', 'error');
				}
			},
			error: e => {
				Swal.fire('Layout Saving Error', 'There are some errors on server!', 'error');
			}
		});
	}

	_openCollaborate = () => {
		const that = this;
		this._candidate_user = null;
		const options = this._chart.options();
		this._collaborate = _.cloneDeep(options.collaborate);
		this._globalRoles = {
			normal: false,
			sort: parseInt(this._collaborate.role[1]) > 0 ? true : false,
			who: parseInt(this._collaborate.role[0]) > 0 ? true : false
		}
		$(getModalTemplate('share')).dialog({
			modal: true,
			title: 'Permission Setting',
			width: 550,
			height: 415,
			resizable: false,
			classes: {
				'ui-dialog': 'tfa-chart-setting-dialog tfa-modal'
			},
			open: event => {
				const modalEl = event.target;
				that._renderCollaborateUsers(modalEl);

				// normal events
				$(modalEl).find('#search_key').on('keyup', e => {
					that._candidate_user = null;
					$('.modals-popup.user-lists').html(that._makeUserList(e.target.value));
					$(modalEl).find('#search_key').popup('show');
					that._userListEvent(modalEl);
				});

				$(modalEl).find('.ui.label.close').on('click', e => {
					that._candidate_user = null;
					if ($('.share-modal').dialog('isOpen')) {
						$('.share-modal').dialog('close');
					}
				});

				$(modalEl).find('.ui.label.invite').on('click', () => {
					if (that._candidate_user) {
						that._collaborate.users.push({
							id: that._candidate_user.id,
							name: that._candidate_user.name,
							avatar: that._candidate_user.avatar,
							title: that._candidate_user.title,
							role: this._globalRoles['normal'] ? 1 : 0
						});
						that._candidate_user = null;
						that._renderCollaborateUsers(modalEl);
					}
				});

				// done action
				$(modalEl).find('.footer .ui.label.done').on('click', () => {
					that._chart._options.collaborate = that._collaborate;
					that._saveLayout(modalEl, {
						collaborate: that._collaborate,
						domain: options.domain
					});
					that._candidate_user = null;
					if ($('.share-modal').dialog('isOpen')) {
						$('.share-modal').dialog('close');
					}
				});

				// link action
				$(modalEl).find('.footer .ui.label.link').on('click', () => {
					const el = document.createElement('input');
					$(el).attr('type', 'text').attr('id', 'clipboard');
					$(el).val(`${that._chart._options.hostUrl}/charts/collaboration/${that._chart._layout_id}`);
					$(el).appendTo(modalEl);
					const copyText = document.querySelector('#clipboard');
					copyText.select();
					copyText.setSelectionRange(0, 99999);
					document.execCommand("copy");
					$(el).remove();
					$(getModalTemplate('copied')).dialog({
						modal: true,
						title: '',
						width: 359,
						height: 243,
						resizable: false,
						classes: {
							'ui-dialog': 'tfa-copied-popup tfa-modal'
						},
						open: event => {
							$('.ui-widget-overlay').addClass('black-overlay');
							setTimeout(() => {
								if ($('.copied-modal').dialog('isOpen')) {
									$('.copied-modal').dialog('close');
								}
							}, 2000);

							$('.ui-widget-overlay').click(() => {
								if ($('.copied-modal').dialog('isOpen')) {
									$('.copied-modal').dialog('close');
								}
							});
						},
						close: event => {
							$('.ui-widget-overlay').removeClass('black-overlay');
							$(event.target).remove();
						}
					});
				});

				// who popup
				$(modalEl).find('.ui.label.who')
					.popup({
						// popup: $('.custom.popup.who-popup'),
						html: getPopupTemplate('who'),
						className: {
							popup: 'ui popup custom modals-popup who'
						},
						position: 'bottom right',
						on: 'click',
						onShow: () => {
							$('.modals-popup.who .ui.list .item.active').removeClass('active');
							$(`.modals-popup.who .ui.list .item[key="${this._globalRoles['who']? 'only': 'every'}"]`).addClass('active');
							$('.modals-popup.who .ui.list .item').click(event => {
								let key = $(event.target).attr('key');
								if (!key) {
									key = $(event.target).closest('.item').attr('key');
								}
								this._globalRoles['who'] = key == 'only';
								that._collaborate.role[0] = this._globalRoles['who'] ? 1 : 0;
								$('.modals-popup.who .ui.list .item.active').removeClass('active');
								$(`.modals-popup.who .ui.list .item[key="${key}"]`).addClass('active');
								if (this._globalRoles['who']) {
									$(modalEl).find(`.sub-header .link`).addClass('locked')
								} else {
									$(modalEl).find(`.sub-header .link`).removeClass('locked')
								}
								$(modalEl).find('.ui.label.who').popup('hide');
								$(modalEl).find(`.ui.label.who .title`).html(this._globalRoles['who'] ? 'Only people invited to this layout' : 'Anyone with link can');
							});
						}
					});

				$(modalEl).find('#search_key')
					.popup({
						// popup: $('.custom.popup.who-popup'),
						html: that._makeUserList(''),
						className: {
							popup: 'ui popup custom modals-popup user-lists'
						},
						position: 'bottom left',
						on: 'click',
						onShow: () => {
							$('.modals-popup.user-lists').html(that._makeUserList(that._candidate_user ? that._candidate_user.name : ''));
							that._userListEvent(modalEl);
						}
					});
			},
			close: event => {
				$(event.target).remove();
			}
		});
	}

	_renderCollaborateUsers = (modalEl) => {
		const that = this;
		const options = this._chart.options();
		let selected_role = null;
		this._globalRoles = {
			normal: false,
			sort: parseInt(this._collaborate.role[1]) > 0 ? true : false,
			who: parseInt(this._collaborate.role[0]) > 0 ? true : false
		}

		$(modalEl).find('#search_key').val('');
		$(modalEl).find('.header .ui.label.role .title').html('can view');
		const owner = options.candidators.find(user => (parseInt(user.id) == options.writerId));
		let contents = owner ? that._makeUserItem(owner, options.writerId) : '';
		(that._collaborate.users || []).forEach(user => {
			contents += that._makeUserItem(user, options.writerId);
		});
		$(modalEl).find('.scrolling-content .list-content').html(contents);

		$(modalEl).find('.ui.label.role').click(e => {
			var key = $(e.target).attr('key');

			if (!key) {
				key = $(e.target).closest('.ui.label.role').attr('key');
			}

			if (key) {
				selected_role = key;
			} else {
				e.preventDefault();
				return false;
			}
		});
		// popup for role
		$(modalEl).find('.ui.label.role')
			.popup({
				// popup: $('.custom.popup.role-modal-popup'),
				html: getPopupTemplate('role'),
				className: {
					popup: 'ui popup custom modals-popup role'
				},
				position: 'bottom right',
				on: 'click',
				onShow: () => {
					if (selected_role) {
						let subKey = this._globalRoles[selected_role];
						if (['normal', 'sort'].indexOf(selected_role) > -1) {
							$('.modals-popup.role').addClass('mini');
						} else {
							const user = that._collaborate.users.find(user => (parseInt(user.id) == parseInt(selected_role)));
							if (user) {
								subKey = user.role;
							}
						}
						$('.modals-popup.role .ui.list .item.active').removeClass('active');
						$(`.modals-popup.role .ui.list .item[key="${subKey? 'edit': 'view'}"]`).addClass('active');
					}

					$('.modals-popup.role .ui.list .item').click(event => {
						let key = $(event.target).attr('key');
						if (!key) {
							key = $(event.target).closest('.item').attr('key');
						}
						if (key == 'remove') {
							that._collaborate.users = that._collaborate.users.filter(user => (parseInt(user.id) != parseInt(selected_role)));
							that._renderCollaborateUsers(modalEl);
						} else {
							this._globalRoles[selected_role] = key == 'edit';
							if (selected_role == 'sort') {
								that._collaborate.role[1] = this._globalRoles['sort'] ? 1 : 0;
							} else if (['normal', 'who'].indexOf(selected_role) < 0) {
								const userIndex = that._collaborate.users.findIndex(user => (parseInt(user.id) == parseInt(selected_role)));
								if (userIndex > -1) {
									that._collaborate.users[userIndex].role = (key == 'edit' ? 1 : 0);
								}
							}
							$('.modals-popup.role .ui.list .item.active').removeClass('active');
							$(`.modals-popup.role .ui.list .item[key="${key}"]`).addClass('active');
							$(modalEl).find(`.ui.label.role[key="${selected_role}"] .title`).html(`can ${key}`);
						}
						$(modalEl).find('.ui.label.role').popup('hide');
					});
				}
			});
	}

	_userListEvent = (modalEl) => {
		const that = this;
		$('.modals-popup.user-lists').find('.ui.list .item').click(e => {
			var key = $(e.target).attr('key');
			if (!key) {
				key = $(e.target).closest('.item').attr('key');
			}
			if (key) {
				const options = this._chart.options();
				const users = _.get(options, 'candidators');
				that._candidate_user = users.find(user => (parseInt(user.id) == parseInt(key)));
				if (that._candidate_user) {
					$(modalEl).find('#search_key').val(that._candidate_user.name);
				}
			}
			$(modalEl).find('#search_key').popup('hide');
		});
	}

	_makeUserItem = (user, writerId) => {
		return `
		<div class="item ${user.id == writerId? 'owner': ''}">
			<img class="ui avatar image" src="${user.avatar}">
			<div class="content">
				<a class="header">${user.name}<span class="you">(You)</span></a>
				<div class="description">${user.title}</div>
			</div>
			<div class="ui label owner">
				owner
			</div>
			<div class="ui label role" key="${user.id}">
				<div class="title">can ${user.role? 'edit': 'view'}</div>
				<i class="angle down icon"></i>
			</div>
		</div>
		`
	}

	_makeUserList = (seed) => {
		const options = this._chart.options();
		let html = '<div class="ui list">';
		const users = _.get(options, 'candidators');
		const candidates = seed.length > 0 ? users.filter(user => (user.name && user.name.length > 0 && user.name.toLowerCase().indexOf(seed.toLowerCase()) >= 0)) : users;
		const latestUsers = candidates.filter(user => (this._collaborate.users.findIndex(item => (item.id == user.id)) < 0 && parseInt(user.id) != parseInt(options.writerId)));
		latestUsers.forEach(user => {
			html += `<div class="item" key="${user.id}">
				<img class="ui avatar image" src="${user.avatar}">
				<div class="content">
					<a class="header">${user.name}</a>
					<div class="description">${user.title}</div>
				</div>
			</div>`;
		});
		html += '</div>'
		return html;
	}

	_shareUrl = (chartId) => {
		const options = this._chart.options();
		Swal.fire({
			title: "Collaboration Url",
			text: options.hosting + "/charts/collaboration/" + options._id,
			icon: "info",
			button: "OK"
		});
	}

	_newLayout = () => {
		const that = this;
		const options = this._chart._options;
		const html = `<div class="modal-body duplicate-modal" style="padding: 10px">
				<div class="content scrolling mini-title">
					<div class="title">
					<h2>New Layout</h2>
					<div class="ui label close">
						<svg width="15" height="15" class="close" viewBox="0 0 15 15"  fill="#FCFCFC" xmlns="http://www.w3.org/2000/svg">
						<path d="M2.00029 0.317885L7.50014 5.8172L13 0.334549C13.1083 0.224379 13.2382 0.137874 13.3817 0.0805049C13.5251 0.0231361 13.6789 -0.0038486 13.8333 0.00125733C14.1363 0.0208622 14.4218 0.150057 14.6364 0.364719C14.8511 0.579381 14.9803 0.864834 14.9999 1.16778C15.0014 1.31673 14.9727 1.46444 14.9154 1.60194C14.8581 1.73944 14.7734 1.86387 14.6666 1.96768L9.15009 7.50032L14.6666 13.033C14.8833 13.2429 15.0033 13.5329 14.9999 13.8329C14.9803 14.1358 14.8511 14.4213 14.6364 14.6359C14.4218 14.8506 14.1363 14.9798 13.8333 14.9994C13.6789 15.0045 13.5251 14.9775 13.3817 14.9201C13.2382 14.8628 13.1083 14.7763 13 14.6661L7.50014 9.18345L2.01695 14.6661C1.90867 14.7763 1.7787 14.8628 1.63526 14.9201C1.49182 14.9775 1.33804 15.0045 1.18364 14.9994C0.875017 14.9833 0.583284 14.8535 0.364758 14.635C0.146231 14.4165 0.0164056 14.1248 0.00034112 13.8162C-0.00116684 13.6673 0.0276004 13.5195 0.0848979 13.382C0.142195 13.2445 0.226829 13.1201 0.333665 13.0163L5.85018 7.50032L0.316999 1.96768C0.213171 1.86247 0.131618 1.73741 0.0772107 1.59997C0.0228039 1.46253 -0.00333999 1.31554 0.00034112 1.16778C0.0199479 0.864834 0.149156 0.579381 0.363839 0.364719C0.578521 0.150057 0.864002 0.0208622 1.16698 0.00125733C1.32018 -0.00601838 1.47323 0.0183407 1.6166 0.0728159C1.75997 0.127291 1.89058 0.210715 2.00029 0.317885Z" fill-opacity="0.8"/>
						</svg>
					</div>
					</div>
					<div class="header for-input" style="padding: 18px;">
						<div class="ui label">Layout Name</div>
						<div class="ui input has-border" style="width: 100%">
							<input type="text" id="chart_name"/>
						</div>
					</div>
				</div>
				<div class="actions" style="padding-top: 10px">
					<button class="ui button deny">Cancel</button>  
					<button class="ui button green ok">OK</button>        
				</div>
			</div>`;
		$(this._element).append(html);
		$(this._element).find('.modal-body').dialog({
			modal: true,
			width: 640,
			resizable: false,
			classes: {
				'ui-dialog': 'tfa-modal'
			},
			open: event => {
				const modalEl = event.target;

				$.get({
					url: `${options.hostUrl}/api/layouts/checkname?userId=${options.writerId}&name=Untitled`,
					dataType: "json",
					beforeSend: function (x) {
						x.setRequestHeader("Authorization", options.token);
						if (x && x.overrideMimeType) {
							x.overrideMimeType("application/j-son;charset=UTF-8");
						}
					},
					success: res => {
						const chartName = res.index > 0 ? `Untitled (${res.index})` : 'Untitled';
						$(modalEl).find('#chart_name').val(chartName);
					}
				});

				$(modalEl).find('#chart_name').keyup(function (event) {
					var keycode = (event.keyCode ? event.keyCode : event.which);
					if (keycode == '13') {
						newLayout();
					}
				});

				$(modalEl).find('.button.ok').click(function () {
					newLayout();
				});

				function newLayout() {
					const chartName = $(modalEl).find('#chart_name').val();
					if (chartName.length > 0) {
						that._newChart(chartName);
						if ($('.modal-body').dialog('isOpen')) {
							$('.modal-body').dialog('close');
						}
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
			close: (event) => {
				$(event.target).remove();
			}
		});
	}

	_newChart = (chartName) => {
		const tempOption = JSON.parse(JSON.stringify(chartOptionsDefaults));
		tempOption.topToolbar.currency = this._chart._options.topToolbar.currency;
		const chartType = this._chart._options.type ? this._chart._options.type : 'normal';
		if (_.get(this._chart._options, 'controlling.enableNewChart') && chartType == 'normal') {
			tempOption.topToolbar.enableCurrency = true;
		}
		_.merge(this._chart._options, {
			_id: null,
			name: 'Untitled',
			pan: tempOption.pan,
			topToolbar: {
				interval: tempOption.topToolbar.interval
			}
		});
		// this._chart._options = tempOption;

		const options = this._chart._options;
		const timeRange = [this._chart._pan._chart.navigator.slider.get('minimum'), this._chart._pan._chart.navigator.slider.get('maximum')];
		const that = this;
		const layout = {
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
			domain: options.domain,
			shapes: {},
			timeRange: timeRange,
			collaborate: options.collaborate,
			isDefault: true,
			isFavorite: false
		};
		that._chart._layout_id = null;

		this._saveLayout(null, layout, null, false, (layout) => {
			that._chart._layout_id = layout._id;
			that._chart._layout = layout;
			if (!layout.shapes) {
				that._chart._layout.shapes = {};
			}
			that._chart._options.pan.shape = [];
			that._chart._pan.destroy();
			that._chart._pan._init();
			that.reload(false);
			that._chart._joinChartSocket();
		});
	}

	setTimeframe = (val) => {
		const tempIntervals = _.cloneDeep(CIntervals);
		const intervalMenus = tempIntervals.filter(item => {
			if (this._options.intervals.length > 0) {
				return this._options.intervals.indexOf(item.label) >= 0;
			} else {
				return true;
			}
		});
		const timeframe = intervalMenus.find(item => (item.label == val));
		if (timeframe) {
			$(this._intervalElement).children('.tc-dropdown').dropdown('set selected', timeframe.name);
		}
	}
}