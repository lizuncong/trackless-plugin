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

  // 组件加载时获取数据
  useEffect(() => {
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

  const handleApplyStyles = async () => {
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
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.sendMessage(tab.id, {
      action: 'resetStyles',
    });
  };

  return (
    <div style={{ width: '300px', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h3 style={{ marginTop: 0 }}>元素样式编辑器</h3>

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
          style={{
            background: '#4caf50',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            margin: '5px',
          }}
        >
          应用样式
        </button>
        <button
          onClick={handleResetStyles}
          style={{
            background: '#f44336',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            margin: '5px',
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

