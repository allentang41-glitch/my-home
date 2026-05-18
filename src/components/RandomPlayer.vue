<template>
  <div class="music-player" @mouseenter="hoverShow = true" @mouseleave="hoverShow = false">
    <div v-if="loading" class="loading">
      <svg class="spin" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="32" />
      </svg>
      <span>加载中...</span>
    </div>

    <div v-else-if="songName" class="player">
      <div class="row">
        <span class="play-btn" @click="togglePlay">
          <play-one v-if="!isPlaying" theme="filled" size="22" fill="#efefef" />
          <pause v-else theme="filled" size="22" fill="#efefef" />
        </span>
        <div class="info">
          <div class="song-name text-hidden">{{ songName }}</div>
          <div class="singer text-hidden">{{ artist }}</div>
        </div>
        <span class="next-btn" @click="nextSong">
          <switch-one theme="filled" size="18" fill="#efefef" />
        </span>
      </div>
    </div>

    <audio ref="audioRef" :src="audioUrl" @ended="onEnded" @error="onError" />
  </div>
</template>

<script setup>
import { PlayOne, Pause, SwitchOne } from "@icon-park/vue-next";

const hoverShow = ref(false);
const isPlaying = ref(false);
const loading = ref(false);
const songName = ref("");
const artist = ref("");
const audioUrl = ref("");
const audioRef = ref(null);

const keywords = [
  "我记得 赵雷", "平凡之路 朴树", "起风了 买辣椒也用券",
  "晴天 周杰伦", "光年之外 邓紫棋", "孤勇者 陈奕迅",
  "夜曲 周杰伦", "成都 赵雷", "大鱼 周深",
  "漠河舞厅 柳爽", "赤伶 等什么君", "向云端 黄绮珊",
  "指纹 胡歌", "凄美地 郭顶",
];

const fetchSong = async (keyword) => {
  loading.value = true;
  try {
    const searchRes = await fetch(
      `https://music-api.gdstudio.xyz/api.php?types=search&source=netease&name=${encodeURIComponent(keyword)}&count=10&pages=1`
    );
    const searchData = await searchRes.json();
    if (!searchData || searchData.length === 0) throw "无搜索结果";

    const song = searchData[0];
    songName.value = song.name || "";
    artist.value = (song.artist || []).map(a => a.name || a).join(" / ") || "";

    const urlRes = await fetch(
      `https://music-api.gdstudio.xyz/api.php?types=url&source=netease&id=${song.id}&br=320`
    );
    const urlData = await urlRes.json();
    audioUrl.value = urlData.url || "";

    nextTick(() => {
      if (audioRef.value) {
        const playPromise = audioRef.value.play();
        if (playPromise !== undefined) {
          playPromise.then(() => { isPlaying.value = true; }).catch(() => { isPlaying.value = false; });
        }
      }
    });
  } catch (err) {
    console.error("获取歌曲失败:", err);
    setTimeout(() => nextSong(), 1000);
  } finally {
    loading.value = false;
  }
};

const randomKeyword = () => keywords[Math.floor(Math.random() * keywords.length)];
let currentKeyword = "";

const nextSong = () => { currentKeyword = randomKeyword(); fetchSong(currentKeyword); };

const togglePlay = () => {
  if (!audioRef.value) return;
  if (isPlaying.value) { audioRef.value.pause(); } else { audioRef.value.play(); }
  isPlaying.value = !isPlaying.value;
};

const onEnded = () => { isPlaying.value = false; nextSong(); };
const onError = () => { isPlaying.value = false; };

onMounted(() => { setTimeout(() => nextSong(), 1500); });
</script>

<style lang="scss" scoped>
.music-player {
  width: 100%;
  padding: 10px 14px;
  border-radius: 6px;
  background-color: #00000040;
  backdrop-filter: blur(10px);

  .loading {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    opacity: 0.7;
    .spin { animation: spin 1s linear infinite; }
  }

  .player {
    .row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .play-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #ffffff1a;
      cursor: pointer;
      flex-shrink: 0;
      &:hover { background: #ffffff40; }
      &:active { transform: scale(0.95); }
    }

    .info {
      flex: 1;
      min-width: 0;
      .song-name { font-size: 0.95rem; font-weight: bold; }
      .singer { font-size: 0.8rem; opacity: 0.7; margin-top: 1px; }
    }

    .next-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      cursor: pointer;
      flex-shrink: 0;
      &:hover { background: #ffffff26; }
      &:active { transform: scale(0.95); }
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
