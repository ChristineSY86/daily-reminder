# 每日提醒 Daily Reminder

一款温润纸质感的每日提醒 App，支持添加到 iPhone 主屏幕。

## 本地运行

```bash
npm install
npm start
```

## 部署到 GitHub Pages

1. 在 `package.json` 中添加你的 GitHub Pages 地址：
   ```json
   "homepage": "https://你的用户名.github.io/daily-reminder"
   ```

2. 安装依赖并部署：
   ```bash
   npm install
   npm run deploy
   ```

## 部署到 Vercel（推荐）

1. 把这个项目 push 到 GitHub
2. 登录 vercel.com，导入该仓库
3. 点击 Deploy，自动完成

## 添加到 iPhone 主屏幕

1. 用 Safari 打开网站
2. 点击底部分享按钮 →「添加到主屏幕」
3. 像原生 App 一样使用 🎉
