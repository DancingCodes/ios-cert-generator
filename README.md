# iOS Cert Generator

静态 iOS 证书辅助工具。页面在浏览器本地生成 CSR 和 P12，服务器不接收私钥、证书或密码。

## 使用

```bash
npm install
npm run dev
```

生成生产静态文件：

```bash
npm run generate
```

部署 `.output/public` 到 Nginx 或其他静态托管服务。构建产物会按 `room-web` 的配置自动包含 `sitemap.xml` 与 `robots.txt`。

## 安全边界

- 私钥、CSR、CER、P12 和密码只在浏览器本地处理。
- 不要把私钥、P12、证书或密码提交到 Git 仓库。
- 浏览器下载的私钥无法从 Apple 后台恢复，应离线备份。
