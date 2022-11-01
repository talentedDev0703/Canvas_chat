import * as $ from 'jquery';
export function makeMenu(menuItem) {
	const menuWrapper = document.createElement('div');
	$(menuWrapper).addClass('menu');
	for (const menu of menuItem) {
		const item = document.createElement('div');
		$(item).addClass('item').attr('data-value', menu.value);
		$(item).html(menu.name).appendTo(menuWrapper);
	}
	return menuWrapper;
}