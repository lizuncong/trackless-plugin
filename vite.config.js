import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync, readdirSync, readFileSync, writeFileSync, rmSync } from 'fs';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// 递归复制目录
function copyDir(src, dest) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }
  const entries = readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = resolve(src, entry.name);
    const destPath = resolve(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

// 自定义插件：复制 manifest.json、icons 和 content.css，并修复 popup.html 路径
function copyManifestPlugin() {
  return {
    name: 'copy-manifest',
    writeBundle() {
      const distDir = resolve(__dirname, 'dist');
      const srcDir = resolve(__dirname, 'src');
      
      // 确保 dist 目录存在
      if (!existsSync(distDir)) {
        mkdirSync(distDir, { recursive: true });
      }
      
      // 复制 manifest.json
      const manifestSrc = resolve(srcDir, 'manifest.json');
      const manifestDest = resolve(distDir, 'manifest.json');
      if (existsSync(manifestSrc)) {
        copyFileSync(manifestSrc, manifestDest);
      }
      
      // 复制 icons 目录
      const iconsSrc = resolve(srcDir, 'icons');
      const iconsDest = resolve(distDir, 'icons');
      if (existsSync(iconsSrc)) {
        copyDir(iconsSrc, iconsDest);
      }
      
      // 复制 content.css
      const contentCssSrc = resolve(srcDir, 'content/content.css');
      const contentCssDest = resolve(distDir, 'content.css');
      if (existsSync(contentCssSrc)) {
        copyFileSync(contentCssSrc, contentCssDest);
      }
      
      // 修复 popup.html 路径：将 dist/src/popup/index.html 或 dist/popup.html 移动到正确位置
      const popupHtmlSrc1 = resolve(distDir, 'src/popup/index.html');
      const popupHtmlSrc2 = resolve(distDir, 'popup.html');
      const popupHtmlDest = resolve(distDir, 'popup.html');
      
      let popupHtmlSrc = null;
      if (existsSync(popupHtmlSrc1)) {
        popupHtmlSrc = popupHtmlSrc1;
      } else if (existsSync(popupHtmlSrc2)) {
        popupHtmlSrc = popupHtmlSrc2;
      }
      
      if (popupHtmlSrc) {
        // 读取文件内容并修复路径
        let content = readFileSync(popupHtmlSrc, 'utf-8');
        // 将绝对路径改为相对路径
        content = content.replace(/src="\/assets\//g, 'src="./assets/');
        content = content.replace(/href="\/assets\//g, 'href="./assets/');
        writeFileSync(popupHtmlDest, content, 'utf-8');
        
        // 如果源文件在 src 目录下，删除 src 目录
        if (popupHtmlSrc === popupHtmlSrc1) {
          const srcDirInDist = resolve(distDir, 'src');
          if (existsSync(srcDirInDist)) {
            rmSync(srcDirInDist, { recursive: true, force: true });
          }
        }
      }
    }
  };
}

export default defineConfig({
  plugins: [
    preact(),
    copyManifestPlugin()
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
        content: resolve(__dirname, 'src/content/content.js')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'content' ? 'content.js' : 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.names?.[0] || assetInfo.name || '';
          if (name.endsWith('.css')) {
            return name === 'content.css' ? 'content.css' : 'assets/[name]-[hash][extname]';
          }
          // HTML 文件处理
          if (name.includes('index.html') || name.includes('popup')) {
            return 'popup.html';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});

