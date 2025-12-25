let selectedElement = null;
let originalStyles = {};

// 鼠标悬停时高亮元素
document.addEventListener('mouseover', (e) => {
  if (e.target.tagName !== 'BODY' && e.target.tagName !== 'HTML') {
    e.target.style.outline = '2px solid #4CAF50';
    e.target.style.cursor = 'pointer';
  }
});

// 鼠标离开时移除高亮
document.addEventListener('mouseout', (e) => {
  if (e.target.tagName !== 'BODY' && e.target.tagName !== 'HTML') {
    e.target.style.outline = '';
    e.target.style.cursor = '';
  }
});

// 点击选择元素
document.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  
  if (selectedElement) {
    selectedElement.style.outline = '';
  }
  
  selectedElement = e.target;
  selectedElement.style.outline = '3px solid #ff6b6b';
  
  // 保存原始样式
  originalStyles = {
    fontSize: selectedElement.style.fontSize,
    color: selectedElement.style.color,
    backgroundColor: selectedElement.style.backgroundColor,
    fontFamily: selectedElement.style.fontFamily,
    fontWeight: selectedElement.style.fontWeight
  };
});

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!selectedElement) {
    alert('请先点击选择一个页面元素！');
    return;
  }
  
  if (request.action === 'applyStyles') {
    const styles = request.styles;
    
    selectedElement.style.fontSize = styles.fontSize;
    selectedElement.style.color = styles.color;
    selectedElement.style.backgroundColor = styles.backgroundColor;
    selectedElement.style.fontFamily = styles.fontFamily;
    selectedElement.style.fontWeight = styles.fontWeight;
    
    // 显示成功提示
    showNotification('样式已应用！');
  }
  
  if (request.action === 'resetStyles') {
    selectedElement.style.fontSize = originalStyles.fontSize;
    selectedElement.style.color = originalStyles.color;
    selectedElement.style.backgroundColor = originalStyles.backgroundColor;
    selectedElement.style.fontFamily = originalStyles.fontFamily;
    selectedElement.style.fontWeight = originalStyles.fontWeight;
    
    showNotification('样式已重置！');
  }
});

// 显示通知
function showNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    z-index: 10000;
    font-size: 14px;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 2000);
}

