import request from './request.js';

// 获取DOM元素
const fontSize = document.getElementById("fontSize");
const fontColor = document.getElementById("fontColor");
const bgColor = document.getElementById("bgColor");
const fontFamily = document.getElementById("fontFamily");
const fontWeight = document.getElementById("fontWeight");
const applyBtn = document.getElementById("applyBtn");
const resetBtn = document.getElementById("resetBtn");

// 应用样式
applyBtn.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const styles = {
    fontSize: fontSize.value + "px",
    color: fontColor.value,
    backgroundColor: bgColor.value,
    fontFamily: fontFamily.value,
    fontWeight: fontWeight.value,
  };

  chrome.tabs.sendMessage(tab.id, {
    action: "applyStyles",
    styles: styles,
  });
});

// 重置样式
resetBtn.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(tab.id, {
    action: "resetStyles",
  });
});

// 调用 request 获取数据
(async () => {
  try {
    const result = await request();
    console.log('请求结果:', result);
    // 可以在这里处理返回的数据，比如显示在 popup 中
  } catch (error) {
    console.error('请求失败:', error);
  }
})();
