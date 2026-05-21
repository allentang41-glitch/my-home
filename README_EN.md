<p>
<strong><h2>Personal Homepage</h2></strong>
A Vue-based personal homepage with weather, music player, Hitokoto quotes, wallpaper, and more.
</p>

---

English | [中文](./README.md)

---

### About

This project is based on [imsyy/home](https://github.com/imsyy/home), licensed under [MIT](./LICENSE).

### Features

- [x] Loading animation
- [x] Site description
- [x] Hitokoto quotes
- [x] Date and time
- [x] Live weather (global, auto IP location)
- [x] Music player (playlist / song ID / keyword search)
- [x] Sync lyrics display
- [x] Wallpaper switching
- [x] Mobile adaptation

### Deployment

#### Manual Deployment

```bash
# Install pnpm
npm install -g pnpm

# Install dependencies
pnpm install

# Build for production
pnpm build
```

Upload the `dist` directory to your web server.

#### Docker Deployment

```bash
# Build image
docker build -t home .

# Run container
docker run -p 12445:12445 -d home
```

#### Vercel Deployment

1. Go to [Vercel](https://vercel.com/), click **Add New Project**
2. Import this repository
3. Framework preset: **Vite**
4. Add `.env` variables in **Environment Variables**
5. Click **Deploy**

#### Cloudflare Pages Deployment

1. In Cloudflare Dashboard, go to **Pages**
2. Click **Create a project** → **Connect to Git**, link this repository
3. Build settings:

| Setting | Value |
|---|---|
| Framework preset | None |
| Build command | `pnpm run build` |
| Build output directory | `dist` |
| Environment variables | Add `.env` variables in Pages Settings → Environment variables |

4. Click **Save and Deploy**

### Usage

#### Hitokoto

Powered by [hitokoto.cn](https://hitokoto.cn/).

- **Click** — refresh to a new quote
- **Hover** — shows "Open Music Player" button

#### Music Player

Powered by [Meting API](https://api.injahow.cn/meting/) and [gdstudio Music API](https://music-api.gdstudio.xyz/).

Configure songs in `src/assets/playlist.json`. Supports three formats:

```json
[
  {"playlist": 392110972},
  168091,
  "keyword artist"
]
```

- **Play/Pause** — click the center button
- **Next/Previous** — click the side buttons
- **Lyrics** — displayed in the footer when playing
- **Preload** — songs load in background, instant switching

#### Weather

Auto-detects your location via [ip-api.com](https://ip-api.com/). Uses [60s API](https://github.com/vikiboss/60s) for China, [Open-Meteo](https://open-meteo.com/) for overseas.

#### Site Links

Edit `src/assets/siteLinks.json`.

#### Social Links

Edit `src/assets/socialLinks.json`.

### Configuration

#### Site Info

```bash
VITE_SITE_NAME = "My Homepage"
VITE_SITE_AUTHOR = "Author"
VITE_SITE_URL = "example.com"
```

#### Playlist

Edit `src/assets/playlist.json`:

```json
[
  {"playlist": 392110972},
  168091,
  "keyword artist"
]
```

#### Site Links

```json
[
  {
    "icon": "Blog",
    "name": "Blog",
    "link": "https://example.com/"
  }
]
```

#### Social Links

```json
[
  {
    "name": "GitHub",
    "icon": "/images/icon/github.png",
    "tip": "Check it out",
    "url": "https://github.com/username"
  }
]
```

### Tech Stack

- [Vue 3](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Pinia](https://pinia.vuejs.org/)
- [Element Plus](https://element-plus.org/)
- [Swiper](https://swiperjs.com/)
- [Sass](https://sass-lang.com/)

### License

[MIT](./LICENSE)
