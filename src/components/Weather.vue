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
import { getIpCity, getOtherWeather, getOpenMeteo } from "@/api";
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
    const ipInfo = await getIpCity();

    // 国内用 60s API，国外用 Open-Meteo
    if (ipInfo.countryCode === "CN") {
      const fixedCity = import.meta.env.VITE_WEATHER_CITY;
      const cityName = fixedCity || ipInfo.city;
      if (cityName) {
        const result = await getOtherWeather(cityName);
        if (result.code === 200 && result.data) {
          const d = result.data;
          weatherData.adCode.city = d.location.city || cityName;
          weatherData.weather.weather = d.weather.condition;
          weatherData.weather.temperature = d.weather.temperature;
          weatherData.weather.winddirection = d.weather.wind_direction;
          weatherData.weather.windpower = d.weather.wind_power;
          weatherLoaded.value = true;
          return;
        }
      }
    }

    // 国外或国内 API 失败，用 Open-Meteo
    if (ipInfo.lat && ipInfo.lon) {
      const om = await getOpenMeteo(ipInfo.lat, ipInfo.lon);
      const cur = om.current_weather;
      weatherData.adCode.city = ipInfo.city || "Unknown";
      weatherData.weather.weather = cur.weathercode !== undefined ? getWeatherDesc(cur.weathercode) : "";
      weatherData.weather.temperature = cur.temperature !== undefined ? Math.round(cur.temperature) : "";
      weatherData.weather.winddirection = getWindDir(cur.winddirection);
      weatherData.weather.windpower = cur.windspeed !== undefined ? Math.round(cur.windspeed) + "" : "";
    } else {
      weatherData.adCode.city = "Unknown";
      weatherData.weather.weather = "Unable to fetch weather";
      weatherData.weather.temperature = "";
    }
    weatherLoaded.value = true;
  } catch (error) {
    console.error("Weather failed:" + error);
    weatherLoaded.value = true;
    ElMessage({ message: "天气获取失败", icon: h(Error, { theme: "filled", fill: "#efefef" }) });
  }
};

onMounted(() => { getWeatherData(); });
</script>
