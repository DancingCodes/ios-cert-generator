# iOS Cert Generator

静态 iOS 证书辅助工具。页面在浏览器本地生成 CSR 和 P12，服务器不接收私钥、证书或密码。

## 使用

```bash
npm install
npm run dev
```

生成生产静态文件：

```bash
$env:NUXT_PUBLIC_SITE_URL = 'https://ioscert.moonc.love'
npm run generate
```

部署 `.output/public` 到 Nginx 或其他静态托管服务。设置真实域名后，生成的 `sitemap.xml` 才能用于搜索引擎收录。

## 安全边界

- 私钥、CSR、CER、P12 和密码只在浏览器本地处理。
- 不要把私钥、P12、证书或密码提交到 Git 仓库。
- 浏览器下载的私钥无法从 Apple 后台恢复，应离线备份。
