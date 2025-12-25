import { useState, useEffect } from 'preact/hooks';
import request from '../utils/request.js';

export default function App() {
  const [fontSize, setFontSize] = useState(16);
  const [fontColor, setFontColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontWeight, setFontWeight] = useState('normal');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isEnabled, setIsEnabled] = useState(true);

  // 组件加载时获取开关状态和数据
  useEffect(() => {
    // 获取开关状态
    chrome.storage.sync.get(['pluginEnabled'], (result) => {
      const enabled = result.pluginEnabled !== undefined ? result.pluginEnabled : true;
      setIsEnabled(enabled);
      
      // 同步状态到 content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'togglePlugin',
            enabled: enabled
          });
        }
      });
    });

    // 获取数据
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await request();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message || '请求失败');
        console.error('请求失败:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 切换开关
  const handleToggle = (e) => {
    const enabled = e.currentTarget.checked;
    setIsEnabled(enabled);
    
    // 保存到 storage
    chrome.storage.sync.set({ pluginEnabled: enabled }, () => {
      // 通知 content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'togglePlugin',
            enabled: enabled
          });
        }
      });
    });
  };

  const handleApplyStyles = async () => {
    if (!isEnabled) {
      alert('请先启用样式编辑功能！');
      return;
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    const styles = {
      fontSize: fontSize + 'px',
      color: fontColor,
      backgroundColor: bgColor,
      fontFamily: fontFamily,
      fontWeight: fontWeight,
    };

    chrome.tabs.sendMessage(tab.id, {
      action: 'applyStyles',
      styles: styles,
    });
  };

  const handleResetStyles = async () => {
    if (!isEnabled) {
      alert('请先启用样式编辑功能！');
      return;
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.sendMessage(tab.id, {
      action: 'resetStyles',
    });
  };

  return (
    <div style={{ width: '300px', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h3 style={{ marginTop: 0 }}>元素样式编辑器</h3>

      {/* 开关 */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '12px', 
        background: isEnabled ? '#e8f5e9' : '#f5f5f5',
        borderRadius: '6px',
        border: `2px solid ${isEnabled ? '#4caf50' : '#ccc'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <label style={{ 
          fontWeight: 'bold', 
          fontSize: '14px',
          color: isEnabled ? '#2e7d32' : '#666',
          cursor: 'pointer',
          flex: 1
        }}>
          启用样式编辑
        </label>
        <label style={{ 
          position: 'relative', 
          display: 'inline-block', 
          width: '50px', 
          height: '26px',
          cursor: 'pointer'
        }}>
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={handleToggle}
            style={{ 
              opacity: 0, 
              width: 0, 
              height: 0 
            }}
          />
          <span style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: isEnabled ? '#4caf50' : '#ccc',
            borderRadius: '26px',
            transition: 'background-color 0.3s',
            cursor: 'pointer'
          }}>
            <span style={{
              position: 'absolute',
              content: '""',
              height: '20px',
              width: '20px',
              left: isEnabled ? '26px' : '3px',
              bottom: '3px',
              backgroundColor: 'white',
              borderRadius: '50%',
              transition: 'left 0.3s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}></span>
          </span>
        </label>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'inline-block', width: '80px', fontWeight: 'bold' }}>
          字体大小:
        </label>
        <input
          type="number"
          min="8"
          max="72"
          value={fontSize}
          onInput={(e) => setFontSize(Number(e.currentTarget.value))}
          style={{
            width: '150px',
            padding: '5px',
            border: '1px solid #ddd',
            borderRadius: '3px',
          }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'inline-block', width: '80px', fontWeight: 'bold' }}>
          字体颜色:
        </label>
        <input
          type="color"
          value={fontColor}
          onInput={(e) => setFontColor(e.currentTarget.value)}
          style={{
            width: '150px',
            padding: '5px',
            border: '1px solid #ddd',
            borderRadius: '3px',
          }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'inline-block', width: '80px', fontWeight: 'bold' }}>
          背景色:
        </label>
        <input
          type="color"
          value={bgColor}
          onInput={(e) => setBgColor(e.currentTarget.value)}
          style={{
            width: '150px',
            padding: '5px',
            border: '1px solid #ddd',
            borderRadius: '3px',
          }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'inline-block', width: '80px', fontWeight: 'bold' }}>
          字体族:
        </label>
        <select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.currentTarget.value)}
          style={{
            width: '150px',
            padding: '5px',
            border: '1px solid #ddd',
            borderRadius: '3px',
          }}
        >
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
          <option value="微软雅黑">微软雅黑</option>
          <option value="宋体">宋体</option>
        </select>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'inline-block', width: '80px', fontWeight: 'bold' }}>
          字体粗细:
        </label>
        <select
          value={fontWeight}
          onChange={(e) => setFontWeight(e.currentTarget.value)}
          style={{
            width: '150px',
            padding: '5px',
            border: '1px solid #ddd',
            borderRadius: '3px',
          }}
        >
          <option value="normal">正常</option>
          <option value="bold">粗体</option>
          <option value="lighter">细体</option>
        </select>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <button
          onClick={handleApplyStyles}
          disabled={!isEnabled}
          style={{
            background: isEnabled ? '#4caf50' : '#ccc',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: isEnabled ? 'pointer' : 'not-allowed',
            margin: '5px',
            opacity: isEnabled ? 1 : 0.6,
          }}
        >
          应用样式
        </button>
        <button
          onClick={handleResetStyles}
          disabled={!isEnabled}
          style={{
            background: isEnabled ? '#f44336' : '#ccc',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: isEnabled ? 'pointer' : 'not-allowed',
            margin: '5px',
            opacity: isEnabled ? 1 : 0.6,
          }}
        >
          重置样式
        </button>
      </div>

      {loading && <div style={{ marginTop: '10px', color: '#666' }}>加载中...</div>}
      {error && (
        <div style={{ marginTop: '10px', color: '#f44336' }}>错误: {error}</div>
      )}
      {data && (
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
          数据已加载
        </div>
      )}
    </div>
  );
}

