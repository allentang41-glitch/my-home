<template>
  <div class="music cards" v-show="store.musicOpenState">
    <div class="btns">
      <span @click="nextSong">切歌</span>
      <span @click="store.musicOpenState = false">回到一言</span>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <template v-else-if="songName">
      <div class="info">
        <div class="song-name">{{ songName }}</div>
        <div class="singer">{{ artist }}</div>
      </div>

      <div class="control">
        <span class="ctrl-btn" @click="prevSong">
          <go-start theme="filled" size="24" fill="#efefef" />
        </span>
        <span class="play-btn" @click="togglePlay">
          <play-one v-if="!isPlaying" theme="filled" size="44" fill="#efefef" />
          <pause v-else theme="filled" size="44" fill="#efefef" />
        </span>
        <span class="ctrl-btn" @click="nextSong">
          <go-end theme="filled" size="24" fill="#efefef" />
        </span>
      </div>
    </template>

    <audio ref="audioRef" :src="audioUrl" @timeupdate="onTimeUpdate" @ended="onEnded" @error="onError" />
  </div>
</template>

<script setup>
import { GoStart, PlayOne, Pause, GoEnd } from "@icon-park/vue-next";
import { mainStore } from "@/store";
import playlist from "@/assets/playlist.json";

const store = mainStore();

const loading = ref(true);
const isPlaying = ref(false);
const songName = ref("");
const artist = ref("");
const audioUrl = ref("");
const currentLyric = ref("");

const audioRef = ref(null);
const lyrics = ref([]);
let lyricIndex = 0;

// 预加载队列
const buffer = [];
const playlistPool = [];
const BUFFER_SIZE = 2; // 预加载全部歌单

const parseLrc = (text) => {
  if (!text) return [];
  const result = [];
  const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
  for (const line of text.split("\n")) {
    const m = line.match(regex);
    if (m) {
      const t = parseInt(m[1]) * 60 + parseInt(m[2]) + parseInt(m[3].padEnd(3, "0")) / 1000;
      const txt = line.replace(regex, "").trim();
      if (txt && !/作词|作曲|编曲|制作/.test(txt)) result.push({ time: t, text: txt });
    }
  }
  return result;
};

// 随机选关键词
const pickKeyword = () => playlist[Math.floor(Math.random() * playlist.length)];

// 搜索歌曲（单个）
const searchSong = async (keyword) => {
  let searchData = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(`https://music-api.gdstudio.xyz/api.php?types=search&source=netease&name=${encodeURIComponent(keyword)}&count=10&pages=1`);
      searchData = await r.json();
      if (searchData && searchData.length > 0) break;
      const r2 = await fetch(`https://api.injahow.cn/meting/?server=netease&type=search&name=${encodeURIComponent(keyword)}`);
      searchData = await r2.json();
      if (searchData && searchData.length > 0) break;
    } catch {}
    if (attempt < 2) await new Promise(r => setTimeout(r, 1000));
  }
  if (!searchData || searchData.length === 0) return null;
  const song = searchData[0];
  return song;
};

// 获取歌曲完整数据（用于 ID 模式）
const getSongById = async (id) => {
  try {
    const r = await fetch(`https://api.injahow.cn/meting/?server=netease&type=song&id=${id}`);
    const d = await r.json();
    if (d && d[0]) return { id, name: d[0].name, artist: d[0].artist };
  } catch {}
  return { id, name: "未知歌曲", artist: "" };
};

// 获取音频和歌词
const fetchAudioAndLyric = async (songId) => {
  const [urlRes, lyricRes] = await Promise.all([
    fetch(`https://music-api.gdstudio.xyz/api.php?types=url&source=netease&id=${songId}&br=320`),
    fetch(`https://music-api.gdstudio.xyz/api.php?types=lyric&source=netease&id=${songId}`),
  ]);
  const urlData = await urlRes.json();
  const lyricData = await lyricRes.json();
  return { url: urlData.url || "", lyrics: parseLrc(lyricData?.lyric || "") };
};

// 预加载
const preloadOne = async () => {
  const kw = pickKeyword();
  try {
    // 歌单模式：获取歌曲列表，逐个预加载
    if (typeof kw === "object" && kw.playlist) {
      if (!playlistPool.length) {
        const r = await fetch(`https://api.injahow.cn/meting/?server=netease&type=playlist&id=${kw.playlist}`);
        const data = await r.json();
        if (data && data.length > 0) {
          for (const song of data) {
            const songId = song.url?.match(/id=(\d+)/)?.[1] || song.id;
            if (songId) playlistPool.push({ name: song.name || "", artist: song.artist || "", id: songId });
          }
        }
      }
      if (!playlistPool.length) return null;
      const s = playlistPool.shift();
      const audio = await fetchAudioAndLyric(s.id);
      if (audio.url) return { name: s.name, artist: s.artist, url: audio.url, lyrics: audio.lyrics };
      return null;
    }

    let songId, sName, sArtist;

    if (typeof kw === "number") {
      const info = await getSongById(kw);
      songId = kw;
      sName = info.name;
      sArtist = info.artist;
    } else {
      const song = await searchSong(kw);
      if (!song) return null;
      songId = song.id;
      sName = song.name || "";
      sArtist = (song.artist || []).map(a => a.name || a).join(" / ") || "";
    }

    const audio = await fetchAudioAndLyric(songId);
    if (!audio.url) return null;

    return { name: sName, artist: sArtist, url: audio.url, lyrics: audio.lyrics };
  } catch {
    return null;
  }
};

// 维持缓冲区
let preloading = false;
const maintainBuffer = async () => {
  if (preloading) return;
  preloading = true;
  while (buffer.length < BUFFER_SIZE) {
    const song = await preloadOne();
    if (song) buffer.push(song);
  }
  preloading = false;
};

// 从缓冲区播放
const playFromBuffer = () => {
  if (buffer.length === 0) return;
  const song = buffer.shift();
  if (!song) return;

  songName.value = song.name;
  artist.value = song.artist;
  audioUrl.value = song.url;
  lyrics.value = song.lyrics;
  lyricIndex = 0;
  currentLyric.value = song.lyrics[0]?.text || "";
  store.setPlayerLrc(song.name + " - " + song.artist);
  loading.value = false;

  nextTick(() => {
    if (audioRef.value) {
      audioRef.value.play().then(() => {
        isPlaying.value = true;
        store.playerState = true;
        // 播放后立即补充缓冲区
        maintainBuffer();
      }).catch(() => {});
    }
  });
};

const nextSong = () => {
  store.setPlayerLrc("加载中...");
  if (buffer.length > 0) {
    playFromBuffer();
  } else {
    loading.value = true;
    maintainBuffer().then(() => playFromBuffer());
  }
};

const prevSong = () => nextSong();

const togglePlay = () => {
  if (!audioRef.value) return;
  if (isPlaying.value) {
    audioRef.value.pause();
    store.playerState = false;
  } else {
    audioRef.value.play();
    store.playerState = true;
  }
  isPlaying.value = !isPlaying.value;
};

const onTimeUpdate = () => {
  if (!audioRef.value || !lyrics.value.length) return;
  const t = audioRef.value.currentTime;
  while (lyricIndex < lyrics.value.length - 1 && t >= lyrics.value[lyricIndex + 1].time) lyricIndex++;
  const lrc = lyrics.value[lyricIndex]?.text || "";
  currentLyric.value = lrc;
  store.setPlayerLrc(lrc);
};

const onEnded = () => { isPlaying.value = false; store.playerState = false; nextSong(); };
const onError = () => { isPlaying.value = false; store.playerState = false; };

// 启动：预加载全部歌单，10秒后开始播放
onMounted(async () => {
  await maintainBuffer();
  setTimeout(() => {
    if (buffer.length > 0) playFromBuffer();
  }, 10000);
});
</script>

<style lang="scss" scoped>
.music {
  width: 100%;
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  animation: fade 0.5s;

  .btns {
    display: flex;
    align-items: center;
    gap: 8px;
    span {
      background: #ffffff26;
      padding: 2px 10px;
      border-radius: 6px;
      font-size: 0.9rem;
      cursor: pointer;
      &:hover { background: #ffffff4d; }
    }
  }

  .loading { font-size: 1rem; opacity: 0.7; }

  .info {
    text-align: center;
    .song-name { font-size: 1.2rem; font-weight: bold; margin-bottom: 4px; }
    .singer { font-size: 0.95rem; opacity: 0.7; }
  }

  .control {
    display: flex;
    align-items: center;
    gap: 20px;
    .ctrl-btn {
      cursor: pointer;
      &:hover { transform: scale(1.1); }
      &:active { transform: scale(0.95); }
    }
    .play-btn {
      cursor: pointer;
      &:hover { transform: scale(1.05); }
      &:active { transform: scale(0.95); }
    }
  }
}
</style>
