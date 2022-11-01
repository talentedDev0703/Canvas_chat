<div align="center"> 
  <strong>This is a more functional of canvasjs chart for trading.</strong>
</div>


## ⭐️ Features

- Webpack 4
- Babel 7
- Hot Reloading (`npm start`)
- CSS Autoprefixer
- SASS/SCSS support
- UMD exports, so your library works everywhere.
- Based on [CRA v3.1.1](https://github.com/facebook/create-react-app/releases/tag/v3.1.1) (For Vanilla JS libs or React libs)
- `npm run demo` To build a ready-for-deployment demo 

## 📦 Getting Started

```
git clone https://rbgudipudi@bitbucket.org/rbgudipudi/canvascharts.git
npm install
```

## 💎 Customization

> Before shipping, make sure to:
1. Edit `LICENSE` file
2. Edit `package.json` information (These will be used to generate the headers for your built files)
3. Edit `library: "tfaChart"` with your library's export name in `./config/webpack.config.js`
4. Edit `./bin/postinstall` (If you would like to display a message on package install)

## 🚀 Deployment
1. `npm publish`
2. Your users can include your library as usual

### npm
```
import TfaChart from 'tfa-chart-library';
import 'tfa-chart-library/build/index.css' // If you import a css file in your library

let chart = new TfaChart('chartContainerId', {height: 600});
...
```

### self-host/cdn
```
<link href="build/index.css" rel="stylesheet">
<script src="build/index.js"></script>

let TfaChart = window.TfaChart.default;
let chart = new TfaChart('chartContainerId', {height: 600});
...
```
### options
```
{
  ownerId: 0, // chart owner id. It's needed for saving chart
	ownerName: '', // chart owner name
	width: 0,     // chart width. If it's not define or 0, then the width of wrapper will be considered
	height: 0,    // chart height. It's needed to define for correct displaying of chart
	leftSideBar: {  // left side toolbar style customization
    backgroundColor: '#4c525e', 
    fontFamily: '',
    fontSize: 12,
    textColor: '#758696',
  },
	topToolbar: { // toptoolbar options
    enableCurrency: true, // currency select box enabled
    currency: {           // current currency for displaying trading data
      name: 'EUR/USD',
      description: 'EUR/USD',
      exchange: 'Forex',
      type: 'forex',
      precision: 4,
    },
    enableInterval: true,   // enable interval select box
    interval: CIntervals[5],  // default or selected interval of chart
    screenshotUrl: 'charts/screenshot', // screenshot url.
    enableCollaborate: true,            // enable collaborate function. still pending
    showCollaUrl: true
  },
	pan: {                        // chart pan's layout
		fallingColor: '#e64f5a',
		raisingColor: '#5bb981',
		wick1Color: '#a9cdd3',
		wick2Color: '#f5a6ae',
		theme: 'dark1',
		dark1: {
			backgroundColor: '#272b30',
			color: '#d0d4d7',
		},
		light1: {
			backgroundColor: '#eaebf0',
			color: '#1b2128',
		},
		dataPointWidth: 20,
		dataPointMaxWidth: 30,
		dataPointMinWidth: 1,
		maxViewport: 0,
		minViewport: 0,
		shape: []
	},
	dataUrl: 'http://localhost:1337/api/charts/history',              // data url of chart
	screenshotUrl: 'http://localhost:1337/api/livecharts/screenshot', // screenshot url
	chartUrl: 'http://localhost:1337/api/1.2/charts'                  // chart saving and opening url
}
```