import { leftTools } from '../model/constants';
import * as $ from 'jquery';
import * as _ from 'lodash';

export class SidebarWidget {
	_element = null;
	_gSidebars = [
		{ group: 'cursor', selectedKey: 'crosshair', opened: false, width: 220, top: 97 },
		{ group: 'lines', selectedKey: 'h-ray', opened: false, width: 200, top: 155 },
		{ group: 'fibs', selectedKey: 'fibonacci', opened: false, width: 250, top: 210 },
		{ group: 'shapes', selectedKey: 'rect', opened: false, width: 150, top: 267 },
		{ group: 'patterns', selectedKey: 'xabcd', opened: false, width: 315, top: 327 },
		{ group: 'magnet', selectedKey: 1, opened: false, width: 220, top: 397 }
	];
	_selectedGroup = 'cursor';
	_pan = null;
	_chartWidget = null;
	_favorites = [];
	_tradeShapes = [];
	constructor(chartWidget) {
		this._chartWidget = chartWidget;
		this._element = document.createElement('div');
		this._element.className = 'ui visible inverted icon left verical sidebar menu tfa-left-sidebar';
		this._element.setAttribute('id', 'left_sidebar');		
		const that = this;
		const options = chartWidget._options;
		
		if (options.analyzeShapes.length < 1) {
			this._tradeShapes = ['trade', 'analysis'];
		} else {
			this._tradeShapes = options.analyzeShapes;
		}
		this.redraw();

		$.get({
			url: options.hostUrl + '/api/favorite/' + options.writerId,
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader("Authorization", options.token);
			},
			success: res => {
				if (res.status.toLowerCase() === 'ok') {
					that._favorites = res.data;
					that._chartWidget.drawFavoriteToolbar(that._favorites, true);
				} else {
					that._favorites = [];
				}
				that._renderPans();
			},
			error: e => {
				that._renderPans();
			}
		});

	}

	redraw = (flag = true) => {
		const that = this;
		$(this._element).html('');

		if (this._chartWidget._options.controlling.linkSidebarEnable) {
			const linkBtn = document.createElement('div')
			$(linkBtn).addClass('item linkable').css('position', 'relative');
			$(linkBtn).attr('data-content', 'Link Chart To Text').attr("data-variation", "mini green")
			
			const icon = document.createElement('i');
			$(icon).addClass('icon').css('width', '100%').css('height', '100%');
			const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			let viewbox = '0 0 17 21'
			$(svg).attr('viewBox', viewbox)
				.attr('width', 28).attr('height', 28)
				.attr("fill", "none");
			$(svg).html(`<path d="M9.60406 15.4986L8.63131 16.9451C7.69115 18.3431 5.79568 18.7143 4.39765 17.7741C2.99962 16.834 2.62843 14.9385 3.56859 13.5404L4.54134 12.094C5.48149 10.6959 7.37697 10.3247 8.775 11.2649C8.99657 11.4139 9.19234 11.5869 9.3612 11.7781M6.48682 9.20097L7.45957 7.75448C8.39973 6.35645 10.2952 5.98527 11.6932 6.92542C13.0913 7.86558 13.4624 9.76105 12.5223 11.1591L11.5495 12.6056C10.6094 14.0036 8.71391 14.3748 7.31588 13.4346C7.09431 13.2856 6.89854 13.1126 6.72968 12.9214" stroke="#F4A933" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"></path>
				<path d="M2.33333 0.615385C2.33333 0.275517 2.60885 0 2.94872 0C3.28859 0 3.5641 0.275517 3.5641 0.615385V9.38462C3.5641 9.72448 3.28859 10 2.94872 10C2.60885 10 2.33333 9.72448 2.33333 9.38462V0.615385Z" fill="#18E9B7" class="none"></path>
				<path d="M1 3.89744C1 3.2177 1.55103 2.66667 2.23077 2.66667H3.76923C4.44897 2.66667 5 3.2177 5 3.89744V6.76923C5 7.44897 4.44897 8 3.76923 8H2.23077C1.55103 8 1 7.44897 1 6.76923V3.89744Z" fill="#18E9B7" class="none"></path>
				<path d="M17 15.5007C17 15.7768 16.7761 16.0014 16.5 16.0014H15.6197C15.3436 16.0014 15.1197 16.2252 15.1197 16.5014V20.5C15.1197 20.7761 14.8959 21 14.6197 21H14.355C14.0788 21 13.855 20.7761 13.855 20.5V16.5014C13.855 16.2252 13.6311 16.0014 13.355 16.0014H12.5C12.2239 16.0014 12 15.7768 12 15.5007C12 15.2245 12.2239 15 12.5 15H16.5C16.7761 15 17 15.2245 17 15.5007Z" fill="#BCBAA5" class="none"></path>`)

			$(svg).appendTo($(icon));
			$(icon).appendTo(linkBtn);

			$(linkBtn).appendTo(this._element);
			$(linkBtn).click(() => {
				if (this._chartWidget._options.callFn.openShapePopup) {
					this._chartWidget._options.callFn.openShapePopup();
				}
			})
		}

		// if (this._tradeShapes.indexOf('analysis') > -1) {
		// 	const analysisRow = document.createElement('div');
		// 	$(analysisRow).addClass('item').attr('data-content', 'Analysis Manager').attr("data-variation", "mini");		
		// 	$(analysisRow).html(`<i class="icon" style="width: 100%; height: 100%;">
		// 		<svg viewBox="0 0 19 9" width="26" height="28" fill="#ddd">
		// 			<path d='M4 5H8V6H4V5Z'></path>
		// 			<path d='M4 3H10V4H4V3Z'></path>
		// 			<path d='M4 1H10V2H4V1Z'></path>
		// 			<path d='M2.3555 14L5.171 9.002L8.888 12.247C9.00036 12.347 9.13383 12.4203 9.27846 12.4616C9.4231 12.5028 9.57518 12.5109 9.72337 12.4853C9.87157 12.4596 10.0121 12.4009 10.1344 12.3134C10.2568 12.2259 10.3578 12.1119 10.43 11.98L13.915 6.7785L13.0845 6.2215L9.5845 11.4455L9.5495 11.497L5.832 8.252C5.71967 8.15259 5.58645 8.07968 5.44217 8.03865C5.29789 7.99762 5.14624 7.98953 4.99841 8.01497C4.85058 8.0404 4.71036 8.09872 4.58809 8.18562C4.46582 8.27251 4.36463 8.38576 4.292 8.517L2 12.5915V1H1V14C1.00026 14.2651 1.10571 14.5193 1.29319 14.7068C1.48066 14.8943 1.73486 14.9997 2 15H15V14H2.3555Z'></path>
		// 		</svg>
		// 	</i>`);
		// 	$(analysisRow).appendTo(this._element);
		// 	$(analysisRow).click(() => {
		// 		this._chartWidget._pan.selectShape('analysis')
		// 	});
		// }	
		
		// if (this._tradeShapes.indexOf('trade') > -1) {
		// 	const tradeRow = document.createElement('div');
		// 	$(tradeRow).addClass('item').attr('data-content', 'Create Ideas').attr("data-variation", "mini");		
		// 	$(tradeRow).html(`<i class="icon" style="width: 100%; height: 100%;">
		// 		<svg viewBox="0 0 6 16" width="26" height="28" fill="#ddd">
		// 			<path d="M5.9652 3.33032L3.13185 0.0578172C3.1003 0.0213921 3.05024 4.18972e-05 3.00016 6.13288e-08C2.94998 -4.17745e-05 2.89978 0.0213224 2.86817 0.0578172L0.0348006 3.33032C-0.00410605 3.37521 -0.0109342 3.43592 0.0170661 3.48677C0.0450664 3.53775 0.103004 3.57001 0.166646 3.57001H0.866654C1.30849 3.57001 1.66666 3.88967 1.66666 4.284V6.99125C1.66666 7.07347 1.74121 7.14 1.83333 7.14H4.16668C4.25881 7.14 4.33336 7.07347 4.33336 6.99125V4.28399C4.33336 3.88966 4.69153 3.56999 5.13336 3.56999H5.83337C5.89701 3.56999 5.95495 3.53774 5.98295 3.48675C6.01094 3.43591 6.00409 3.37519 5.9652 3.33032Z"></path><path d="M0.0347996 11.9697L2.86815 15.2422C2.8997 15.2786 2.94976 15.3 2.99984 15.3C3.05002 15.3001 3.10022 15.2787 3.13183 15.2422L5.9652 11.9697C6.00411 11.9248 6.01093 11.8641 5.98293 11.8133C5.95493 11.7623 5.897 11.73 5.83335 11.73H5.13335C4.69151 11.73 4.33334 11.4103 4.33334 11.016V8.30877C4.33334 8.22655 4.25879 8.16002 4.16667 8.16002H1.83332C1.74119 8.16002 1.66664 8.22655 1.66664 8.30877V11.016C1.66664 11.4104 1.30847 11.73 0.866636 11.73H0.166629C0.102987 11.73 0.0450492 11.7623 0.0170488 11.8133C-0.0109358 11.8641 -0.00409126 11.9248 0.0347996 11.9697Z"></path>
		// 		</svg>
		// 	</i>`);
		// 	$(tradeRow).appendTo(this._element);
		// 	$(tradeRow).click(() => {
		// 		this._chartWidget._pan.selectShape('trade')
		// 	});
		// }
		
		for (const item of this._gSidebars) {
			// if (item.group === 'analysis') {
			// 	item.selectedKey = this._chartWidget._options.analyzeShapes[0];
			// }
			const aTag = document.createElement('div');
			$(aTag).addClass('item ' + item.group).css('position', 'relative');
			if (this._selectedGroup === item.group && flag) {
				$(aTag).addClass('active');
			}

			const icon = document.createElement('i');
			$(icon).addClass('icon').css('width', '100%').css('height', '100%');
			const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			let viewbox = item.group === 'analysis'? '0 0 19 9': '0 0 28 28'
			if (item.selectedKey === 'trade') viewbox = '0 0 6 16'
			$(svg).attr('viewBox', viewbox)
				.attr('width', 28).attr('height', 28)
				.attr("fill", "#ddd");
			if (item.group === 'magnet') {
				const temp = item.selectedKey > 0? leftTools.filter(tool => tool.key === item.selectedKey): leftTools.filter(tool => tool.group === 'magnet');
				$(svg).html(temp[0].icon);
			} else {
				$(svg).html(leftTools.filter(tool => tool.key === item.selectedKey)[0].icon);
			}
			
			if (item.group === 'magnet' && this._chartWidget._pan && this._chartWidget._pan._magnet > 0) {
				$(icon).addClass('active');
				$(svg).find('g').attr("fill", '#2185d0');
			}

			$(svg).appendTo($(icon));
			$(icon).appendTo(aTag);


			const pin = document.createElement('div');
			const pinIcon = document.createElement('i');
			if (this._selectedGroup === item.group) {
				$(pin).addClass('arrow-handle');
				$(pinIcon).addClass(item.opened ? 'left' : 'right');
			}
			$(pin).attr('id', 'pin_' + item.group).attr('key', item.group).addClass('pin-wrapper');
			$(pinIcon).addClass('icon').addClass('angle').appendTo(pin);
			$(pin).appendTo(aTag);
			$(pin).click(e => {
				this._selectGroup(item.group);
				e.preventDefault();
			});

			const selectedItem = _.find(leftTools, o => (o.group === item.group && o.key === item.selectedKey));
			$(aTag).attr('data-content', selectedItem.title).attr("data-variation", "mini");		
			
			if (item.selectedKey.length > 0)
				$(aTag).appendTo(this._element);
			$(aTag).on('mouseenter', () => {
				this._hoverover(item.group);
			});
			$(aTag).on('mouseleave', () => {
				this._hoverout(item.group);
			});

			$(aTag).on('click', e => {
				if ($(e.target).closest('.arrow-handle').length <= 0) {					
					this._selectShape(selectedItem);
				}
			});
		}

		if (this._chartWidget._options.controlling.isEditor || this._chartWidget._options.controlling.deleteAll) {
			const deleteAll = document.createElement('div');
			$(deleteAll).addClass('delete-all item');
			$(deleteAll).html('<i class="ui large inverted trash alternate outline icon"></i>');
			$(deleteAll).appendTo(this._element);
			$(deleteAll).click(() => {
				that._chartWidget._pan.deleteAll();
				if (_.has(this._chartWidget._options.callFn, 'afterDeleteAll')) {
					this._chartWidget._options.callFn.afterDeleteAll();
				}
			})
		}

		const treeWrapper = document.createElement('div');
		$(treeWrapper).addClass('object-tree-tool');
		$(treeWrapper).html(`<div class="" style="position: relative;">
			<i class="icon" data-content="Layers" data-variation="mini" style="width: 100%; height: 100%;">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28"><g fill="currentColor"><path fill-rule="nonzero" d="M14 18.634l-.307-.239-7.37-5.73-2.137-1.665 9.814-7.633 9.816 7.634-.509.394-1.639 1.269-7.667 5.969zm7.054-6.759l1.131-.876-8.184-6.366-8.186 6.367 1.123.875 7.063 5.491 7.054-5.492z"></path><path d="M7 14.5l-1 .57 8 6.43 8-6.5-1-.5-7 5.5z"></path><path d="M7 17.5l-1 .57 8 6.43 8-6.5-1-.5-7 5.5z"></path></g></svg>
			</i>
		</div>`);
		$(treeWrapper).appendTo(this._element);
		$(treeWrapper).click(() => {
			const options = that._chartWidget._options;
			if (options.suggestor && options.suggestor > 0) {
				that._chartWidget._pan.openCompareTree();
			} else {
				that._chartWidget._pan.openObjectTree();
			}
		});		
	}

	destroy = () => {
		// this._mouseEventHandler.destroy();
		// if (this._stub !== null) {
		// 	this._stub.destroy();
		// }
	}

	getElement = () => {
		return this._element;
	}

	collapsePan = () => {
		$('.tfa-left-sidebar .toolbars').remove();
		this._gSidebars = this._gSidebars.map(item => {
			item.opened = false;
			return item;
		});
		this._hoverover(this._selectedGroup, false);
	}

	_hoverover = (key, opened) => {
		$('.tfa-left-sidebar .arrow-handle').removeClass('arrow-handle');
		$(`.tfa-left-sidebar #pin_${this._selectedGroup}`).addClass('arrow-handle');
		const pin = $(`.tfa-left-sidebar #pin_${key}`);
		$(pin).addClass('arrow-handle');
		// tslint:disable-next-line:no-typeof-undefined
		if (typeof opened === 'undefined') { opened = this._gSidebars.filter(item => item.group === this._selectedGroup)[0].opened; }
		$('.tfa-left-sidebar i.angle').removeClass('left').removeClass('right');
		$(`.tfa-left-sidebar .arrow-handle#pin_${this._selectedGroup} i`).addClass(opened ? 'left' : 'right');
		if (this._selectedGroup !== key) { $(pin).find('i').removeClass('left').addClass('right'); }
	}

	_hoverout = () => {
		$('.tfa-left-sidebar .arrow-handle i').removeClass('left').removeClass('right');
		$('.tfa-left-sidebar .arrow-handle').removeClass('arrow-handle');
		$(`.tfa-left-sidebar #pin_${this._selectedGroup}`).addClass('arrow-handle');
		$(`.tfa-left-sidebar #pin_${this._selectedGroup} i`).addClass(this._gSidebars.filter(item => item.group === this._selectedGroup)[0].opened ? 'left' : 'right');
	}

	_selectGroup = (key) => {

		$('.tfa-left-sidebar .active').removeClass('active');
		$(`.tfa-left-sidebar #pin_${key}`).parent().addClass('active');
		this._selectedGroup = key;
		let opened = true;
		this._gSidebars = this._gSidebars.map(item => {
			if (item.group === key) { item.opened = !item.opened; opened = item.opened; } else { item.opened = false; }
			return item;
		});
		this._hoverover(key, opened);
		this._renderPans();
	}

	_renderPans = () => {
		let offset = 0 //* this._tradeShapes.length;
		
		if (!this._chartWidget._options.controlling.linkSidebarEnable) {
			offset = offset - 57;
		}
		// if (this._chartWidget._options.libDomain === 'forum') {
		// 	offset += 57 * 2;
		// } else if (this._chartWidget._options.libDomain === 'EAM') {
		// 	offset += 57;
		// }
		let myleftTools = leftTools.filter(item => item.group === this._selectedGroup);
		const selectedGroup = this._gSidebars.filter(item => item.group === this._selectedGroup)[0];
		$('.left-side-toolbars').remove();
		const toolbar = document.createElement('div');
		$(toolbar).addClass('left-side-toolbars').addClass('ui').addClass('card');
		$(toolbar).css('width', selectedGroup.width).css('display', selectedGroup.opened ? 'flex' : 'none').css('top', selectedGroup.top + offset);
		const wrapper = document.createElement('div');
		if (this._selectedGroup === 'analysis') {
			myleftTools = myleftTools.filter(item => (this._chartWidget._options.analyzeShapes.indexOf(item.key) > -1));
		}
		$(wrapper).addClass('ui content relaxed divided selection middle list');
		
		for (const tool of myleftTools) {
			const row = document.createElement('div');
			let viewbox = tool.group === 'analysis'? '0 0 19 9': '0 0 28 28'
			if (tool.key === 'trade') viewbox = '0 0 6 16'
			$(row).addClass('item');
			$(row).html(`<div class="ui image"><svg fill="#ddd" xmlns="http://www.w3.org/2000/svg" viewBox="${viewbox}" width="28" height="28" class="ui image">${tool.icon}</svg></div><div style="padding-top: 5px" class="content"> <span>${tool.title}</span></div>`);
			const fIcon = document.createElement('div');
			$(fIcon).addClass('f-item');
			const favoriteClass = this._favorites.findIndex(item => (item.key === tool.key)) >= 0 ? 'outline yellow' : 'grey';
			$(fIcon).html(`<i class="icon star ${favoriteClass}"></i>`);
			$(fIcon).click((event) => {
				this.addFavorite(tool, event.target);
			})
			$(fIcon).appendTo(row);
			$(row).find('.content').click(() => {
				this._selectShape(tool);
			});
			$(row).find('.ui.image').click(() => {
				this._selectShape(tool);
			});
			$(row).appendTo(wrapper);
			if (myleftTools.length > 5) {
				$(wrapper).css('overflow-y', 'auto').css('height', '300px');
			}
		}
		$(wrapper).appendTo(toolbar);
		$(toolbar).appendTo($(this._element).parent());
	}

	addFavorite = (tool, obj) => {
		const option = this._chartWidget._options;
		const favorite = this._favorites.find(item => (item.key === tool.key));
		const that = this;
		if (favorite) {
			$.ajax({
				url: `${option.hostUrl}/api/favorite/${favorite._id}`,
				type: 'DELETE',
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", option.token);
				},
				success: function (result) {
					if (result.status === 'ok') {
						$(obj).removeClass('outline yellow');
						$(obj).addClass('grey');
						that._favorites = [
							...that._favorites.slice(0, that._favorites.indexOf(favorite)),
							...that._favorites.slice(that._favorites.indexOf(favorite) + 1)
						];
						that._chartWidget.drawFavoriteToolbar(that._favorites);
					}
				}
			});
		} else {
			$.post({
				url: option.hostUrl + '/api/favorite',
				data: { owner: option.writerId, key: tool.key },
				dataType: "json",
				beforeSend: function (x) {
					x.setRequestHeader("Authorization", option.token);
					if (x && x.overrideMimeType) {
						x.overrideMimeType("application/j-son;charset=UTF-8");
					}
				},
				success: res => {
					if (res.status.toLowerCase() === 'ok') {
						$(obj).removeClass('grey');
						$(obj).addClass('outline yellow');
						that._favorites.push({
							_id: res._id,
							owner: option.writerId,
							key: tool.key,
							title: tool.title
						});
						that._chartWidget.drawFavoriteToolbar(that._favorites);
					}
				}
			});
		}
	}

	_selectShape = tool => {
		// calling function to set object for draw canvas
		$('.left-side-toolbars').remove();
		this._selectedGroup = tool.group;
		this._gSidebars = this._gSidebars.map(item => {
			if (item.group === tool.group) { item.selectedKey = tool.key; }
			item.opened = false;
			return item;
		});
		if (tool.group === 'magnet') {
			const magnet = this._chartWidget._pan._magnet === tool.key ? 0 : tool.key;
			this._chartWidget._pan.setMagnet(magnet);
			if (magnet > 0) {
				$(this.element).find('.magnet i').addClass('active');
				$(this._element).find('.magnet g').attr("fill", '#2185d0');
			} else {
				$(this.element).find('.magnet i').removeClass('active');
				$(this._element).find('.magnet g').attr("fill", '#ddd');
			}
		}
		this.redraw();		
		if (tool.group == 'cursor') {
			$('.tfa-chart-wrapper').removeClass('tfa-cursor-crosshair tfa-cursor-arrow tfa-cursor-dot');
			$('.tfa-chart-wrapper').addClass(`tfa-cursor-${tool.key}`);
		} else if (tool.group !== 'magnet') {
			this._chartWidget._pan.selectShape(tool.key);
		} 
	}

	closeSidebar = () => {
		this._gSidebars = this._gSidebars.map(item => {
			item.opened = false;
			return item;
		});
		$('.left-side-toolbars').remove();
	}
}
