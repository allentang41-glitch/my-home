<p>
<strong><h2>个人主页</h2></strong>
一个基于 Vue 的个人主页，支持天气、音乐播放器、一言、壁纸等功能。
</p>

---

[English](./README_EN.md) | 中文

---

### 项目说明

本项目基于 [imsyy/home](https://github.com/imsyy/home) 修改，感谢原作者的出色工作。原项目采用 [MIT License](./LICENSE)，本项目同样遵循 MIT 协议。

### 功能

- [x] 载入动画
- [x] 站点简介
- [x] Hitokoto 一言
- [x] 日期及时间
- [x] 实时天气（全球，IP 自动定位）
- [x] 音乐播放器（支持歌单 / 歌曲 ID / 关键词搜索）
- [x] 歌词同步显示
- [x] 壁纸切换
- [x] 移动端适配

### 部署方式

#### 手动部署

```bash
# 安装 pnpm
npm install -g pnpm

# 安装依赖
pnpm install

# 构建
pnpm build
```

构建完成后，将 `dist` 目录中的文件上传至 Web 服务器（如 Nginx、Apache）即可。

#### Docker 部署

使用官方预构建镜像：

```bash
docker pull yunlong88/my-home:latest
docker run -p 12445:12445 -d yunlong88/my-home:latest
```

自行构建镜像：

```bash
# 构建镜像
docker build -t my-home .

# 运行容器
docker run -p 12445:12445 -d my-home
```

#### Vercel 部署

1. 前往 [Vercel](https://vercel.com/)，点击 **Add New Project**
2. 导入本仓库
3. 框架预设选择 **Vite**
4. 在 **Environment Variables** 中添加 `.env` 中的配置
5. 点击 **Deploy** 即可自动部署

#### Cloudflare Pages 部署

1. 在 Cloudflare Dashboard 中进入 **Pages**
2. 点击 **Create a project** → **Connect to Git**，关联本仓库
3. 在构建配置中填写：

| 配置项 | 值 |
|---|---|
| 框架预设 | None |
| 构建命令 | `pnpm run build` |
| 构建输出目录 | `dist` |
| 环境变量（可选） | 在 Pages 项目 Settings → Environment variables 中添加 `.env` 中的变量 |

4. 点击 **Save and Deploy** 即可

> 注意：`.env` 文件中的配置不会自动同步到部署平台，需在平台的环境变量中手动添加。

### 功能使用指南

#### 一言（Hitokoto）

页面中部显示随机名言，来源：[hitokoto.cn](https://hitokoto.cn/)。

- **点击一言文字** — 随机刷新下一条
- **鼠标悬停** — 出现"打开音乐播放器"按钮

#### 音乐播放器

基于 [Meting API](https://api.injahow.cn/meting/) 获取歌曲信息，音频来自 [gdstudio 音乐 API](https://music-api.gdstudio.xyz/)。

支持歌单 ID、歌曲 ID、关键词三种方式搜歌。歌单配置在 `src/assets/playlist.json`。

- **播放/暂停** — 点击中央的播放/暂停按钮
- **切歌** — 点击上一首/下一首按钮
- **歌词显示** — 播放时页脚自动同步显示当前歌词
- **预加载** — 打开网站后后台预加载，切歌秒切
- **歌单配置** — 编辑 `src/assets/playlist.json` 增删歌曲

#### 天气

自动显示当前城市的实时天气。国内 IP 使用 [60s API](https://github.com/vikiboss/60s)，国外 IP 使用 [Open-Meteo](https://open-meteo.com/)。IP 定位服务来自 [ip-api.com](https://ip-api.com/)。

- 可在 `.env` 中手动指定 `VITE_WEATHER_CITY`

#### 网站链接

右侧下方展示可自定义的网站导航，采用 [Swiper](https://swiperjs.com/) 滑动翻页。

- 编辑 `src/assets/siteLinks.json` 自定义

#### 社交链接

左侧底部展示社交账号图标。

- 编辑 `src/assets/socialLinks.json` 自定义

#### 页脚

底部信息栏，显示版权信息、ICP 备案号，播放音乐时自动切换为歌词显示。

### 配置说明

#### 站点信息

```bash
VITE_SITE_NAME = "我的主页"        # 站点名称
VITE_SITE_AUTHOR = "作者"          # 作者
VITE_SITE_URL = "example.com"      # 站点域名
VITE_SITE_ICP = ""                 # ICP 备案号（可选）
```

#### 歌单

编辑 `src/assets/playlist.json`，支持三种格式：

```json
[
  {"playlist": 392110972},      // 网易云歌单 ID
  168091,                        // 单曲 ID
  "关键词 歌手名"                // 关键词搜索
]
```

#### 网站链接

编辑 `src/assets/siteLinks.json`：

```json
[
  {
    "icon": "Blog",
    "name": "博客",
    "link": "https://example.com/"
  }
]
```

#### 社交链接

编辑 `src/assets/socialLinks.json`：

```json
[
  {
    "name": "GitHub",
    "icon": "/images/icon/github.png",
    "tip": "去看看",
    "url": "https://github.com/username"
  }
]
```

### 技术栈

- [Vue 3](https://cn.vuejs.org/)
- [Vite](https://vitejs.cn/vite3-cn/)
- [Pinia](https://pinia.vuejs.org/zh/)
- [Element Plus](https://element-plus.org/)
- [Swiper](https://swiperjs.com/)
- [Sass](https://sass-lang.com/)

### 开源许可

本项目基于 [MIT License](./LICENSE) 开源。
