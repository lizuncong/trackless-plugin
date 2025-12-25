# 可视化埋点编辑器 Chrome 扩展

基于 Vite + Preact 构建的 Chrome 扩展插件，用于选择页面元素并设置埋点参数。

## 技术栈

- **Vite** - 构建工具
- **Preact** - 轻量级 React 替代方案
- **Chrome Extension Manifest V3**

## 开发

### 安装依赖

```bash
npm install
```

### 开发模式（监听文件变化自动构建）

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

构建后的文件会输出到 `dist` 目录。

## 安装扩展

1. 运行 `npm run build` 构建项目
2. 打开 Chrome 浏览器，进入 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `dist` 目录

## 项目结构

```
├── src/
│   ├── popup/          # Popup 界面
│   │   ├── App.jsx     # Preact 主组件
│   │   ├── main.jsx    # 入口文件
│   │   └── index.html  # HTML 模板
│   ├── content/        # Content Script
│   │   ├── content.js
│   │   └── content.css
│   ├── utils/          # 工具函数
│   │   └── request.js   # API 请求
│   ├── icons/          # 图标文件
│   └── manifest.json   # 扩展配置
├── dist/               # 构建输出目录
├── vite.config.js      # Vite 配置
└── package.json
```

## 功能

- 选择页面元素并高亮显示
- 修改元素样式（字体、颜色、背景等）
- 重置元素样式
- API 数据请求

