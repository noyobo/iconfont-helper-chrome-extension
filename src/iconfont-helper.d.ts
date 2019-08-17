/*!
 * @author dawangraoming<admin@yeenuo.net>
 * @website http://www.yeenuo.net
 * @date 2019-03-13
 */

declare namespace IconFontHelper {
	type selectInvert = 'select-invert';
	type selectAll = 'select-all';
	type downloadSvg = 'download-svg';
	type downloadPng = 'download-png';
	type downloadJpg = 'download-jpg';
	type downloadWebp = 'download-webp';
	type setIconColor = 'set-icon-color';

	type imgType = 'jpg' | 'png' | 'svg' | 'webp' | 'jpeg';

	interface MessageType {
		type: selectInvert | selectAll | downloadSvg | downloadPng | downloadJpg | downloadWebp | setIconColor;
		size?: number;
		color?: string;
	}
}
