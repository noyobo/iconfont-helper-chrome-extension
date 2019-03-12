/*!
 * @author dawangraoming<admin@yeenuo.net>
 * @date 2018/6/25
 */
require('./style.scss');

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const $sizeInput = $('#sizeInput');
$sizeInput.value = localStorage.getItem('_icon_font_site_') || '200';

/**
 * 发送消息到当前页面中
 * @param data {object}
 * @param data.type {string} 事件类型
 */
function sendMessage(data: { type: string, size: number }) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        const params = Object.assign({target: 'content'}, data);
        // 向当前标签发出请求
        chrome.tabs.sendMessage(tabs[0].id, params, function (response) {
            console.log("response =>" + response);
        });
    });
}

// 按钮事件添加
const buttonList = $$('.control-button');
for (let i = 0; i < buttonList.length; i++) {
    // 添加监听
    buttonList[i].addEventListener('click', function () {
        sendMessage({
            type: this.getAttribute('data-type'),
            size: $sizeInput.value
        });
    });
}


let throttleHandler: number;
$sizeInput.addEventListener('change', function () {
    clearTimeout(throttleHandler);
    // 数据变更时，等待一定时间后再进行数据存储
    throttleHandler = window.setTimeout(() => localStorage.setItem('_icon_font_site_', this.value),
        200);
});


// 获取当前页面地址
chrome.tabs.getSelected(null, function (tab) {
    const $warning = $('#warning');
    const url = tab.url;
    // 判断是否在iconfont站点内
    if (!(/^https?:\/\/(www.)?iconfont.cn/.test(url))) {
        $warning.innerText = '当前站点不支持此功能';
        $warning.style.display = 'block';
        return;
    }
    // 隐藏警告
    $warning.style.display = 'none';

});

