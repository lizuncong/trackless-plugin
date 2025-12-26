import { useState, useEffect } from "preact/hooks";
import request from "../utils/request.js";
import styles from "./app.module.css";

export default function App() {
  const [fontSize, setFontSize] = useState(16);
  const [fontColor, setFontColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontWeight, setFontWeight] = useState("normal");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isEnabled, setIsEnabled] = useState(true);

  // 组件加载时获取开关状态和数据
  useEffect(() => {
    // 获取开关状态
    chrome.storage.sync.get(["pluginEnabled"], (result) => {
      const enabled =
        result.pluginEnabled !== undefined ? result.pluginEnabled : true;
      setIsEnabled(enabled);

      // 同步状态到 content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "togglePlugin",
            enabled: enabled,
          });
        }
      });
    });

    // 获取数据
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await request();
        console.log(result);
        setData(result?.payload || []);
        setError(null);
      } catch (err) {
        setError(err.message || "请求失败");
        console.error("请求失败:", err);
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
            action: "togglePlugin",
            enabled: enabled,
          });
        }
      });
    });
  };

  const handleApplyStyles = async () => {
    if (!isEnabled) {
      alert("请先启用样式编辑功能！");
      return;
    }

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    const styles = {
      fontSize: fontSize + "px",
      color: fontColor,
      backgroundColor: bgColor,
      fontFamily: fontFamily,
      fontWeight: fontWeight,
    };

    chrome.tabs.sendMessage(tab.id, {
      action: "applyStyles",
      styles: styles,
    });
  };

  const handleResetStyles = async () => {
    if (!isEnabled) {
      alert("请先启用样式编辑功能！");
      return;
    }

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    chrome.tabs.sendMessage(tab.id, {
      action: "resetStyles",
    });
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>可视化埋点编辑器</h3>

      {/* 开关 */}
      <div
        className={`${styles.toggleContainer} ${
          isEnabled
            ? styles.toggleContainerEnabled
            : styles.toggleContainerDisabled
        }`}
      >
        <label
          className={`${styles.toggleLabel} ${
            isEnabled ? styles.toggleLabelEnabled : styles.toggleLabelDisabled
          }`}
        >
          启用埋点编辑器
        </label>
        <label className={styles.toggleWrapper}>
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={handleToggle}
            className={styles.toggleInput}
          />
          <span
            className={`${styles.toggleSlider} ${
              isEnabled
                ? styles.toggleSliderEnabled
                : styles.toggleSliderDisabled
            }`}
          >
            <span
              className={`${styles.toggleThumb} ${
                isEnabled
                  ? styles.toggleThumbEnabled
                  : styles.toggleThumbDisabled
              }`}
            ></span>
          </span>
        </label>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>埋点事件id:</label>
        <select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.currentTarget.value)}
          className={styles.select}
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

      <div className={styles.buttonGroup}>
        <button
          onClick={handleApplyStyles}
          disabled={!isEnabled}
          className={`${styles.button} ${styles.buttonApply} ${
            !isEnabled ? styles.buttonDisabled : ""
          }`}
        >
          应用样式
        </button>
        <button
          onClick={handleResetStyles}
          disabled={!isEnabled}
          className={`${styles.button} ${styles.buttonReset} ${
            !isEnabled ? styles.buttonDisabled : ""
          }`}
        >
          重置样式
        </button>
      </div>
    </div>
  );
}
