<template>
  <div class="weather" v-if="weatherLoaded && weatherData.adCode.city && weatherData.weather.weather">
    <span>{{ weatherData.adCode.city }}&nbsp;</span>
    <span>{{ weatherData.weather.weather }}&nbsp;</span>
    <span v-if="weatherData.weather.temperature !== ''">{{ weatherData.weather.temperature }}℃</span>
    <span class="sm-hidden" v-if="weatherData.weather.winddirection">
      &nbsp;{{ weatherData.weather.winddirection }}&nbsp;
    </span>
    <span class="sm-hidden" v-if="weatherData.weather.windpower">{{ weatherData.weather.windpower }}&nbsp;级</span>
  </div>
  <div class="weather" v-else-if="weatherLoaded">
    <span>天气数据获取失败</span>
  </div>
</template>

<script setup>
import { getOpenMeteo } from "@/api";
import { Error } from "@icon-park/vue-next";
import { h } from "vue";

const weatherLoaded = ref(false);

const weatherData = reactive({
  adCode: { city: null },
  weather: { weather: null, temperature: null, winddirection: null, windpower: null },
});

const getWeatherDesc = (code) => {
  const map = {
    0: "晴天", 1: "少云", 2: "多云", 3: "阴天",
    45: "雾", 48: "雾",
    51: "小毛毛雨", 53: "毛毛雨", 55: "大毛毛雨",
    56: "冻毛毛雨", 57: "冻毛毛雨",
    61: "小雨", 63: "中雨", 65: "大雨",
    66: "冻雨", 67: "冻雨",
    71: "小雪", 73: "中雪", 75: "大雪",
    77: "雪粒",
    80: "阵雨", 81: "中阵雨", 82: "大阵雨",
    85: "小阵雪", 86: "大阵雪",
    95: "雷暴", 96: "雷暴+冰雹", 99: "雷暴+冰雹",
  };
  return map[code] || "未知";
};

const getWindDir = (deg) => {
  if (deg === undefined || deg === null) return "";
  const dirs = ["北风", "东北风", "东风", "东南风", "南风", "西南风", "西风", "西北风"];
  return dirs[Math.round(deg / 45) % 8];
};

const getWeatherData = async () => {
  try {
    let city = null, lat = null, lon = null;
    try {
      const res = await fetch("http://ip-api.com/json/?lang=zh-CN");
      const data = await res.json();
      if (data.city) { city = data.city; lat = data.lat; lon = data.lon; }
    } catch {}
    if (!lat || !lon) {
      const res = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      city = data.city || null;
      lat = data.latitude || null;
      lon = data.longitude || null;
    }
    if (lat && lon) {
      const om = await getOpenMeteo(lat, lon);
      const cur = om.current_weather;
      weatherData.adCode.city = city || "未知";
      weatherData.weather.weather = cur.weathercode !== undefined ? getWeatherDesc(cur.weathercode) : "";
      weatherData.weather.temperature = cur.temperature !== undefined ? Math.round(cur.temperature) : "";
      weatherData.weather.winddirection = getWindDir(cur.winddirection);
      weatherData.weather.windpower = cur.windspeed !== undefined ? Math.round(cur.windspeed) + "" : "";
    }
    weatherLoaded.value = true;
  } catch (error) {
    console.error("Weather failed:" + error);
    weatherLoaded.value = true;
  }
};

onMounted(() => { getWeatherData(); });
</script>
