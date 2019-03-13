/*!
 * @author dawangraoming
 * @date 2018/06/25
 */
///<reference path="../iconfont-helper.d.ts"/>

import './style.scss';
//
// const $ = document.querySelector.bind(document);
// const $$ = document.querySelectorAll.bind(document);

import * as JSZip from 'jszip';
import * as $ from 'jquery';

let timeHandler: number;

// 添加遮罩层，防止认为页面卡死
$('body').append(`
<div style="display: none;" class="_dawangraoming_popup-mask" id="__dawangraoming_mask__">操作中，请稍后。。。</div>
`);
const mask = $('#__dawangraoming_mask__');

/**
 * 将SVG转PNG数据
 * @param svg {string} svg 字符串
 * @param [size] {number} 图像尺寸、
 * @param [type] {string} 下载类型，支持png、GIF、
 * @return {Promise<string>} 返回一个Promise
 */
function createPNG(svg: string, size = 200, type?: string): Promise<string> {
    return new Promise(resolve => {
        const img = new Image();
        const canvas = ($.parseHTML(`
                <canvas style="position:absolute;left:0;top:0;display:block;"></canvas>`)[0] as HTMLCanvasElement);
        document.body.appendChild(img);
        document.body.appendChild(canvas);
        // size = size ? size : 200;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        // 设置高质量，防止缩放时导致不清晰
        ctx.imageSmoothingQuality = 'high';
        // 设置输出类型
        let compileType: string;
        switch (type) {
            case 'webp':
                compileType = 'webp';
                break;

            case 'jpg':
            case 'jpeg':
                compileType = 'jpep';
                break;

            case 'png':
            default:
                compileType = 'png'
        }
        compileType = 'image/' + compileType;
        // 图片加载完毕后
        img.onload = function () {
            ctx.drawImage(img, 0, 0, size, size);
            resolve(canvas.toDataURL(compileType));
            canvas.remove();
            img.remove();
        };
        img.src = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    });
}

/**
 * 通过DOM节点获取svg xml
 * @param element {Element | JQuery}
 * @param [index] {number}
 */
function getSVGFromNode(element: Element | JQuery, index = 0): string {
    const dom = $(element);
    // 获取SVG节点
    const svg = dom.find('svg.icon');
    // 获取SVG路径，去除掉无用的信息
    return `<svg xmlns="${svg.attr('xmlns')}" viewBox="${svg.attr('viewBox')}" version="${svg.attr('version')}">${svg.html()}</svg>`;
}

/**
 * 下载模块
 * @param [type] {string} 可选，下载类型，支持png、svg，默认svg
 * @param [size] {number} 图像尺寸
 * @return {Promise<void>}
 */
async function download(type?: IconFontHelper.imgType, size?: number): Promise<void> {
    // 获取所有购物车内的元素
    const iconList = document.querySelectorAll(".block-car-container .block-icon-list>li");
    if (!iconList || iconList.length < 1) return;
    // 创建zip数据
    let zipFile = new JSZip();

    for (let index = 0; index < iconList.length; index++) {
        const liEle = iconList[index];
        // 获取SVG DOM
        const svg = liEle.querySelector('svg.icon');
        // 获取图标的名词
        let name = liEle.querySelector('span.icon-name').textContent + ' ' + index;
        // 获取SVG路径，去除掉无用的信息
        const text = getSVGFromNode(svg);
        if (type === 'svg' || !type) {
            name += '.svg';
            zipFile.file(name, text);
        } else {
            name += '.' + type;
            let pngFile = await createPNG(text, size, type);
            pngFile = pngFile.replace(/^data:image\/\w+;base64,/, '');
            zipFile.file(name, pngFile, {base64: true});
        }
    }
    zipFile.generateAsync({type: "blob"}).then(function (content: BlobPart) {
        const url = window.URL.createObjectURL(new Blob([content], {"type": "application\/zip"}));
        // 创建一个下载标签
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.setAttribute("class", "svg-crowbar");
        a.setAttribute("download", "大王饶命.zip");
        a.setAttribute("href", url);
        a.style["display"] = "none";
        a.click();

        setTimeout(function () {
            window.URL.revokeObjectURL(url);
        }, 10);
    });
}


function select(type: string) {
    mask.show();
    clearTimeout(timeHandler);
    // 高频操作前做一个延迟，防止遮罩层未渲染
    timeHandler = window.setTimeout(function () {
        const iconList = document.querySelectorAll("#magix_vf_main .block-icon-list>li");
        Array.from(iconList).forEach(ele => {
            // 如果是全选，则排除掉已经选中的元素
            if (type === 'all') {
                if (/selected/.test(ele.className)) return;
            }
            (ele.querySelector('.icon-gouwuche1') as HTMLSpanElement).click();
        });
        mask.hide();
    }, 300);
}

// 注册监听事件
chrome.runtime.onMessage.addListener(function (request: IconFontHelper.MessageType, sender, sendResponse) {
    switch (request.type) {
        case 'select-all':
            select('all');
            break;

        case 'select-invert':
            select('invert');
            break;

        case 'download-svg':
            download('svg', request.size);
            break;

        case 'download-png':
            download('png', request.size);
            break;

        case 'download-jpg':
            download('jpg', request.size);
            break;

        case 'download-webp':
            download('webp', request.size);
            break;
    }
    sendResponse('over');
});



const observer = new MutationObserver(function () {
    const domList = $('.collection-detail .block-icon-list > li .icon-cover');
    if (domList.length > 0) {
        observer.disconnect();
        domList.each(function () {
            $(this).append(`
            <span title="复制图标(SVG)" class="cover-item iconfont cover-item-line _dawangraoming_copy-button">复制</span>
            `);
        });
        $(".collection-detail .block-icon-list").on('click', '._dawangraoming_copy-button', function () {
            // 获取SVG XML
            const text = getSVGFromNode($(this).closest('li[p-id]'));
            const id = '_dawangraoming_copy';
            // 插入一个输入框，用于复制功能
            $('body').append(`<input readonly="readonly" id="${id}" />`);
            const $input = $(`#${id}`);
            $input.val(text);
            $input.select();
            // 执行复制
            document.execCommand('copy');
            // 用完就删，做个渣男
            $input.remove();
        });
    }
});
observer.observe(document.querySelector('#root'), {
    subtree: true,
    childList: true,
    attributes: false,
    characterData: false,
});

