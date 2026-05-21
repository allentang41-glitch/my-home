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

// 英文城市名 → 中文映射
const cnCityMap = {
  "Beijing": "北京", "Shanghai": "上海", "Guangzhou": "广州", "Shenzhen": "深圳",
  "Hangzhou": "杭州", "Nanjing": "南京", "Chengdu": "成都", "Wuhan": "武汉",
  "Chongqing": "重庆", "Tianjin": "天津", "Shenyang": "沈阳", "Dalian": "大连",
  "Xi'an": "西安", "Changsha": "长沙", "Zhengzhou": "郑州", "Jinan": "济南",
  "Qingdao": "青岛", "Xiamen": "厦门", "Fuzhou": "福州", "Hefei": "合肥",
  "Kunming": "昆明", "Guiyang": "贵阳", "Nanning": "南宁", "Haikou": "海口",
  "Lanzhou": "兰州", "Lhasa": "拉萨", "Yinchuan": "银川", "Xining": "西宁",
  "Taiyuan": "太原", "Shijiazhuang": "石家庄", "Harbin": "哈尔滨", "Changchun": "长春",
  "Suzhou": "苏州", "Wuxi": "无锡", "Ningbo": "宁波", "Wenzhou": "温州",
  "Dongguan": "东莞", "Foshan": "佛山", "Zhuhai": "珠海", "Huizhou": "惠州",
  "Zhongshan": "中山", "Shantou": "汕头", "Zhanjiang": "湛江", "Zhuzhou": "株洲",
  "Yangzhou": "扬州", "Zhenjiang": "镇江", "Nantong": "南通", "Xuzhou": "徐州",
  "Changzhou": "常州", "Jiaxing": "嘉兴", "Shaoxing": "绍兴", "Jinhua": "金华",
  "Taizhou_ZJ": "台州", "Huzhou": "湖州", "Zhoushan": "舟山", "Lishui": "丽水",
  "Quanzhou": "泉州", "Zhangzhou": "漳州", "Guilin": "桂林", "Liuzhou": "柳州",
  "Baoding": "保定", "Tangshan": "唐山", "Qinhuangdao": "秦皇岛", "Handan": "邯郸",
  "Yantai": "烟台", "Weihai": "威海", "Rizhao": "日照", "Linyi": "临沂",
  "Luoyang": "洛阳", "Kaifeng": "开封", "Anyang": "安阳", "Xiangyang": "襄阳",
  "Yichang": "宜昌", "Jingzhou": "荆州", "Yuyao": "余姚", "Cixi": "慈溪",
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
      const res = await fetch("https://ipinfo.io/json");
      const data = await res.json();
      if (data.loc) {
        const [lati, loni] = data.loc.split(",");
        lat = parseFloat(lati);
        lon = parseFloat(loni);
      }
      city = cnCityMap[data.city] || data.city || null;
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
