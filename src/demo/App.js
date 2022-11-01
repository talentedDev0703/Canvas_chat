// import './css/App.css';
// import './css/semantic.min.css';
import TfaChart from './../lib';
const io = window.io;
class App {
  constructor() {
    let chart = new TfaChart.App('chart', {
      _id: "6013f8e7054cd026c0a16827",
      width: window.innerWidth - 10,
      height: window.innerHeight - 100,
      ownerId: 16,
      ownerName: 'traders',
      writerId: 16,
      writerName: 'traders',
      callFn: {
        analized: function (res) {
          console.log('after analized', res);
        },
        suggest: function (res) {
          console.log('after suggested', res);
        },
        loaded: function (flag) {
          console.log('loaded');
        },
        updateSignal: function (idea) {
          console.log('idea updated', idea);
        },
        shapeDrawn: function(shape) {
          console.log('shape updated', shape);
        },
        openShapePopup: function () {
          console.log('shape popup is opened');
        },
        afterDeleteAll: function () {
          console.log('all shapes are deleted');
        },
        shapeSelected: function(data) {
          console.log(data);
        },
        symbolChanged: function(symbole) {
          console.log('symbol changed', symbole);
        }
      },
      topToolbar: {
        enableSave: true,
        intervals: []
      },
      socket: {
        enable: true,
        instance: socket
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
      defaultTheme: 'light',
      // defaultSymbol: 'AUD/USD',
      shapeStyle: {
        color: 'rgb(7, 92, 143)',
        background: 'rgba(7, 92, 143, 0.4)',
        labelColor: 'rgb(7, 92, 143)'
      },
      signalUsed: [{used: true, created: 1590164700000}, {used: true, created: 1590166810000}, {used: false, created: 0}, {used: false, created: 0}, {used: false, created: 0}, {used: false, created: 0}, {used: false, created: 0}],
      enableNewChart: true,
      analyzeShapes: ['analysis', 'trade'],
      analyzeEnable: true,
      candidators: [
        { id: 16, name: 'Rui Ma', role: 0, title: 'Sr Analysis', avatar: 'https://easymarkets.genesif.com/img/user-avatar.png' },
        { id: 17, name: 'YuanYi Li', role: 1, title: 'Introducer', avatar: 'https://easymarkets.genesif.com/img/user-avatar.png' },
      ],
      hostUrl: 'https://ohlc.genesif.com',
      // hostUrl: 'http://localhost:7000',
      dataUrl: '/api/history/tv-history',
      screenshotUrl: '/api/snapshot',
      chartUrl: '/api/charts',
      token: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZWNyZXQiOiJrTkpBMy5IPUhsbXxfdUxvbFItK3YrTWxQfS1xOm18JVRKQS05SUNZMDpuOUk5UEdNfFVlO0JBSyB8Z1h7KiBBIiwiaWF0IjoxNTc3NDU3ODcwfQ.mzMSckujaeEJZ0NHnBvh7wmEgBI55Gls1T83jlooa48',
      controlling: {
        deleteAll: true,
        defaultViewport: true,
        overideEnable: false,
        linkSidebarEnable: false,
        narrowDisable: false
      },
      priceSocket: socket,
      priceFeed: {        
        hostUrl: 'https://api-fxtrade.oanda.com/v3/instruments',
        accountId: '001-011-1432621-009',
        token: 'Bearer 6a0d853fedb46aa3252920d0af2f67b0-83da48312d4a6942d204a0c224879834'
      },
      domain: 'EAM',
      // trade_type: 'Day Traders'
    });

    window.onresize = function() {
      chart._chartWidget.resize(window.innerHeight - 100, window.innerWidth - 10);
    }
  }
}
export default App;