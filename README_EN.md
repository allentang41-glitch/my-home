<p>
<strong><h2>Personal Homepage</h2></strong>
A Vue-based personal homepage with weather, music player, Hitokoto quotes, wallpaper, and more.
</p>

> This project is based on [imsyy/home](https://github.com/imsyy/home), thanks to the original author for the great work.

![Screenshot](/screenshots/main.jpg)

### Features

- [x] Loading animation
- [x] Site description
- [x] Hitokoto quotes
- [x] Date and time
- [x] Live weather (auto IP location)
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

Upload the `dist` directory to your web server (Nginx, Apache, etc.).

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

> Note: `.env` settings won't sync automatically. Add them manually in the platform's environment variables.

### Usage

#### Hitokoto

Random quote displayed in the center. Powered by [hitokoto.cn](https://hitokoto.cn/).

- **Click the text** — refresh to a new quote
- **Hover** — shows "Open Music Player" button

#### Music Player

Supports playlist ID, song ID, and keyword search. Configure songs in `src/assets/playlist.json`.

- **Play/Pause** — click the center button
- **Next/Previous** — click the side buttons
- **Lyrics** — displayed in the footer when playing
- **Preload** — songs load in background, instant switching

Three formats supported:

```json
[
  {"playlist": 392110972},      // Netease playlist ID
  168091,                        // Song ID
  "keyword artist"               // Search keyword
]
```

#### Wallpaper

Switch wallpaper sources:

| Mode | Description |
|---|---|
| Default | Local images in `public/images/` |
| Daily | Bing daily wallpaper |
| Random Landscape | Online random landscape |
| Random Anime | Online random anime |

- **Middle-click** — toggle fullscreen wallpaper mode

#### Weather

Auto-displays real-time weather for your location.

- Auto IP location for China; shows "China only" for overseas IPs
- Set `VITE_WEATHER_CITY` in `.env` for a fixed city

#### Site Links

Customizable navigation links with Swiper pagination.

- **Swipe** (or mouse wheel) to turn pages
- **Click** to open link in new tab
- Edit `src/assets/siteLinks.json`

#### Social Links

Social media icons at bottom left.

- **Hover** — shows tooltip
- **Click** to open link in new tab
- Edit `src/assets/socialLinks.json`

#### Footer

Shows copyright, ICP filing info. Switches to lyrics display when music is playing.

#### Mobile Support

- Auto-switches to mobile layout when **width ≤ 720px**
- Menu button at bottom left to toggle left/right panels
- Site name centered at top

### Configuration

Main configuration is in `.env`. Common settings:

#### Site Info

```bash
VITE_SITE_NAME = "My Homepage"
VITE_SITE_AUTHOR = "Author"
VITE_SITE_URL = "example.com"
VITE_SITE_ICP = ""            # ICP filing (optional)
```

#### Weather

```bash
VITE_WEATHER_URL = "http://60sapi.eu.cc/v2/weather"
VITE_WEATHER_CITY = ""        # Manual city, leave empty for auto-detect
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

Edit `src/assets/siteLinks.json`:

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

Edit `src/assets/socialLinks.json`:

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

### Custom Wallpaper

Place images in `public/images/` as `background1.jpg` ~ `background10.jpg`.

Edit the count in `src/components/Background.vue`:

```js
const bgRandom = Math.floor(Math.random() * 10 + 1);
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
