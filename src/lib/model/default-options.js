import { CIntervals } from './constants';

export const leftSidebarOptionsDefaults = {
	backgroundColor: '#4c525e',
	fontFamily: '',
	fontSize: 12,
	textColor: '#758696',
};

export const topToolbarOptionsDefaults = {
	enableCurrency: true,
	enableCategory: true,
	currency: {
		name: 'EUR/USD',
		description: 'EUR/USD',
		exchange: 'Forex',
		type: 'forex',
		precision: 4,
		// provider: 'oanda'
	},
	enableInterval: true,
	intervals: [],
	interval: CIntervals[4],
	screenshotUrl: 'charts/screenshot',
	showCollaUrl: true,
	chartUrl: 'charts',
	enableSave: true,	
	autoSave: true,
	reloadPerTimeframe: false
};

export const chartOptionsDefaults = {
	_id: null,
	type: 'normal',
	name: 'Untitled',
	ownerId: 0,
	ownerName: '',
	writerId: 0,
	writerName: '',
	width: 0,
	height: 0,
	leftSideBar: leftSidebarOptionsDefaults,
	topToolbar: topToolbarOptionsDefaults,
	pan: {	
		mainType: 'candle',	
		dark: {
			body: {
				rising: '#26a69a',
				falling: '#ef5350'
			},
			wick: {
				rising: '#26a69a',
				falling: '#ef5350'
			},
			backgroundColor: '#141414',
			color: '#d0d4d7'
		},
		light: {
			body: {
				rising: '#26a69a',
				falling: '#ef5350'
			},
			wick: {
				rising: '#26a69a',
				falling: '#ef5350'
			},
			backgroundColor: '#eaebf0',
			color: '#1b2128'
		},
		theme: 'dark',
		dataPointWidth: 20,
		dataPointMaxWidth: 30,
		dataPointMinWidth: 1,
		maxViewport: 0,
		minViewport: 0,
		shape: [],
		viewport: {
			x: [],
			y: []
		}
	},
	callFn: {
		analized: null,
		afterColla: null,
		autoSave: null,
		loaded: null
	},
	hoverColor: '#f1fb54',
	socket: {
		enable: false,
		path: null,
		instance: null
	},
	priceSocket: null,
	analyze: {
		type: '',
		values: [
			{value: 0, rate: 0},
			{value: 0, rate: 0},
			{value: 0, rate: 0},
			{value: 0, rate: 0},
			{value: 0, rate: 0},
			{value: 0, rate: 0},
			{value: 0, rate: 0},
			{value: 0, rate: 0},
			{value: 0, rate: 0}
		]
	},
	chat: {
		toggle: false,
		expected: {
			text: '',
			html: ''
		},
		happened: {
			text: '',
			html: ''
		},
		desc: ''
	},
	controlling: {
		autoSave: true, // real-time communication
		isEditor: false,
		deleteAll: true,
		defaultShape: false,
		enableNewChart: true,
		defaultViewport: false,
		linkSidebarEnable: false,
		narrowDisable: false,
		overideEnable: true
	},
	collaborate: {
		visible: true,
        enable: true,
        role: [0, 0],
        users: [
          // { id: 16, name: 'Rui Ma', role: 0, title: 'Sr Analysis', avatar: 'https://easymarkets.genesif.com/img/user-avatar.png' },
          // { id: 17, name: 'YuanYi Li', role: 1, title: 'Introducer', avatar: 'https://easymarkets.genesif.com/img/user-avatar.png' },
        ]
	},
	signalUsed: [{used: false, created: 0}, {used: false, created: 0}, {used: false, created: 0}, {used: false, created: 0}, {used: false, created: 0}, {used: false, created: 0}, {used: false, created: 0}],
	defaultShapes: [],
	analyzeShapes: [],
	analyzeEnable: true,
	tradeType: 'Scalping',
	signalType: 'Elliott Wave',
	title: ''
};