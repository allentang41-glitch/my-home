<template>
  <div class="weather" v-if="weatherLoaded && weatherData.adCode.city && weatherData.weather.weather">
    <span>{{ weatherData.adCode.city }}&nbsp;</span>
    <span>{{ weatherData.weather.weather }}&nbsp;</span>
    <span v-if="weatherData.weather.temperature !== ''">{{ weatherData.weather.temperature }}℃</span>
    <span class="sm-hidden" v-if="weatherData.weather.winddirection">
      &nbsp;{{
        weatherData.weather.winddirection?.endsWith("风")
          ? weatherData.weather.winddirection
          : weatherData.weather.winddirection + "风"
      }}&nbsp;
    </span>
    <span class="sm-hidden" v-if="weatherData.weather.windpower">{{ weatherData.weather.windpower }}&nbsp;级</span>
  </div>
  <div class="weather" v-else-if="weatherLoaded">
    <span>天气数据获取失败</span>
  </div>
</template>

<script setup>
import { getAdcode, getWeather, getOtherWeather, getIpCity, getOpenMeteo } from "@/api";
import { Error } from "@icon-park/vue-next";

// 高德开发者 Key
const mainKey = import.meta.env.VITE_WEATHER_KEY;

// 是否加载完成
const weatherLoaded = ref(false);

// 天气数据
const weatherData = reactive({
  adCode: {
    city: null, // 城市
    adcode: null, // 城市编码
  },
  weather: {
    weather: null, // 天气现象
    temperature: null, // 实时气温
    winddirection: null, // 风向描述
    windpower: null, // 风力级别
  },
});

// 取出天气平均值
const getTemperature = (min, max) => {
  try {
    // 计算平均值并四舍五入
    const average = (Number(min) + Number(max)) / 2;
    return Math.round(average);
  } catch (error) {
    console.error("计算温度出现错误：", error);
    return "NaN";
  }
};

// 获取天气数据
const getWeatherData = async () => {
  try {
    // 获取地理位置信息
    if (!mainKey) {
      console.log("未配置，使用备用天气接口");
      // 获取 IP 所在城市，若 .env 中指定了城市则优先使用
      const fixedCity = import.meta.env.VITE_WEATHER_CITY;
      let ipInfo = { city: null, countryCode: null };
      if (!fixedCity) {
        ipInfo = await getIpCity();
      }
      const cityName = fixedCity || ipInfo.city;
      // 非中国 IP 使用 Open-Meteo 全球天气
      if (ipInfo.countryCode && ipInfo.countryCode !== "CN") {
        if (ipInfo.lat && ipInfo.lon) {
          try {
            const om = await getOpenMeteo(ipInfo.lat, ipInfo.lon);
            const cur = om.current_weather;
            weatherData.adCode.city = ipInfo.city || "未知地区";
            weatherData.weather.weather = cur.weathercode !== undefined ? getWeatherDesc(cur.weathercode, cur.temperature) : "";
            weatherData.weather.temperature = cur.temperature !== undefined ? Math.round(cur.temperature) : "";
            const windDir = getWindDir(cur.winddirection);
            weatherData.weather.winddirection = windDir;
            weatherData.weather.windpower = cur.windspeed !== undefined ? Math.round(cur.windspeed) : "";
          } catch {
            weatherData.adCode.city = ipInfo.city || "国外地区";
            weatherData.weather.weather = "天气获取失败";
            weatherData.weather.temperature = "";
          }
        } else {
          weatherData.adCode.city = "国外地区";
          weatherData.weather.weather = "天气获取失败";
          weatherData.weather.temperature = "";
        }
        weatherLoaded.value = true;
        return;
      }
      console.log("IP 定位城市:", cityName);
      // 请求天气
      const result = await getOtherWeather(cityName);
      console.log(result);
      const data = result.data;
      weatherData.adCode = {
        city: data.location.city || "未知地区",
      };
      weatherData.weather = {
        weather: data.weather.condition,
        temperature: data.weather.temperature,
        winddirection: data.weather.wind_direction,
        windpower: data.weather.wind_power,
      };
      weatherLoaded.value = true;
    } else {
      // 获取 Adcode
      const adCode = await getAdcode(mainKey);
      console.log(adCode);
      if (adCode.infocode !== "10000") {
        throw "地区查询失败";
      }
      weatherData.adCode = {
        city: adCode.city,
        adcode: adCode.adcode,
      };
      // 获取天气信息
      const result = await getWeather(mainKey, weatherData.adCode.adcode);
      weatherData.weather = {
        weather: result.lives[0].weather,
        temperature: result.lives[0].temperature,
        winddirection: result.lives[0].winddirection,
        windpower: result.lives[0].windpower,
      };
      weatherLoaded.value = true;
    }
  } catch (error) {
    console.error("天气信息获取失败:" + error);
    weatherLoaded.value = true;
    onError("天气信息获取失败");
  }
};

// 报错信息
const onError = (message) => {
  ElMessage({
    message,
    icon: h(Error, {
      theme: "filled",
      fill: "#efefef",
    }),
  });
  console.error(message);
};

// Open-Meteo 天气代码转文字
const getWeatherDesc = (code, temp) => {
  const map = {
    0: "晴天", 1: "少云", 2: "多云", 3: "阴天",
    45: "雾", 48: "雾凇",
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

// 风向角度转文字
const getWindDir = (deg) => {
  if (deg === undefined || deg === null) return "";
  const dirs = ["北风", "东北风", "东风", "东南风", "南风", "西南风", "西风", "西北风"];
  return dirs[Math.round(deg / 45) % 8];
};

onMounted(() => {
  // 调用获取天气
  getWeatherData();
});
</script>
