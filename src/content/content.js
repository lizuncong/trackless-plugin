let selectedElement = null;
let originalStyles = {};
let pluginEnabled = true;

// 初始化：从 storage 获取开关状态
chrome.storage.sync.get(['pluginEnabled'], (result) => {
  pluginEnabled = result.pluginEnabled !== undefined ? result.pluginEnabled : true;
  updatePluginState();
});

// 更新插件状态
function updatePluginState() {
  if (!pluginEnabled) {
    // 如果关闭，清除所有高亮和选择
    if (selectedElement) {
      selectedElement.style.outline = '';
      selectedElement = null;
    }
    // 移除所有高亮
    document.querySelectorAll('[data-plugin-highlight]').forEach(el => {
      el.style.outline = '';
      el.style.cursor = '';
      el.removeAttribute('data-plugin-highlight');
    });
  }
}

// 鼠标悬停时高亮元素
document.addEventListener('mouseover', (e) => {
  if (!pluginEnabled) return;
  if (e.target.tagName !== 'BODY' && e.target.tagName !== 'HTML') {
    e.target.style.outline = '2px solid #4CAF50';
    e.target.style.cursor = 'pointer';
    e.target.setAttribute('data-plugin-highlight', 'true');
  }
});

// 鼠标离开时移除高亮
document.addEventListener('mouseout', (e) => {
  if (!pluginEnabled) return;
  if (e.target.tagName !== 'BODY' && e.target.tagName !== 'HTML') {
    // 只有当前元素不是选中的元素时才移除高亮
    if (e.target !== selectedElement) {
      e.target.style.outline = '';
      e.target.style.cursor = '';
      e.target.removeAttribute('data-plugin-highlight');
    }
  }
});

// 点击选择元素
document.addEventListener('click', (e) => {
  if (!pluginEnabled) return;
  
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
  // 处理开关切换
  if (request.action === 'togglePlugin') {
    pluginEnabled = request.enabled;
    updatePluginState();
    showNotification(pluginEnabled ? '样式编辑已启用' : '样式编辑已禁用', pluginEnabled ? '#4CAF50' : '#ff9800');
    return;
  }

  // 如果插件未启用，拒绝所有样式操作
  if (!pluginEnabled) {
    showNotification('请先启用样式编辑功能！', '#f44336');
    return;
  }
  
  if (request.action === 'applyStyles') {
    if (!selectedElement) {
      showNotification('请先点击选择一个页面元素！', '#f44336');
      return;
    }
    
    const styles = request.styles;
    
    selectedElement.style.fontSize = styles.fontSize;
    selectedElement.style.color = styles.color;
    selectedElement.style.backgroundColor = styles.backgroundColor;
    selectedElement.style.fontFamily = styles.fontFamily;
    selectedElement.style.fontWeight = styles.fontWeight;
    
    // 显示成功提示
    showNotification('样式已应用！', '#4CAF50');
  }
  
  if (request.action === 'resetStyles') {
    if (!selectedElement) {
      showNotification('请先点击选择一个页面元素！', '#f44336');
      return;
    }
    
    selectedElement.style.fontSize = originalStyles.fontSize;
    selectedElement.style.color = originalStyles.color;
    selectedElement.style.backgroundColor = originalStyles.backgroundColor;
    selectedElement.style.fontFamily = originalStyles.fontFamily;
    selectedElement.style.fontWeight = originalStyles.fontWeight;
    
    showNotification('样式已重置！', '#4CAF50');
  }
});

// 显示通知
function showNotification(message, backgroundColor = '#4CAF50') {
  // 移除之前的通知
  const existingNotification = document.getElementById('plugin-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement('div');
  notification.id = 'plugin-notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${backgroundColor};
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    z-index: 10000;
    font-size: 14px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    animation: slideIn 0.3s ease-out;
  `;
  
  // 添加动画样式
  if (!document.getElementById('plugin-notification-style')) {
    const style = document.createElement('style');
    style.id = 'plugin-notification-style';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }
  }, 2000);
}

