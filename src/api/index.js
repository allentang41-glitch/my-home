// import axios from "axios";
import fetchJsonp from "fetch-jsonp";

/**
 * 音乐播放器
 */

// 获取音乐播放列表
export const getPlayerList = async (server, type, id) => {
  const res = await fetch(
    `${import.meta.env.VITE_SONG_API}?server=${server}&type=${type}&id=${id}`,
  );
  const data = await res.json();

  if (data[0].url.startsWith("@")) {
    // eslint-disable-next-line no-unused-vars
    const [handle, jsonpCallback, jsonpCallbackFunction, url] = data[0].url.split("@").slice(1);
    const jsonpData = await fetchJsonp(url).then((res) => res.json());
    const domain = (
      jsonpData.req_0.data.sip.find((i) => !i.startsWith("http://ws")) ||
      jsonpData.req_0.data.sip[0]
    ).replace("http://", "https://");

    return data.map((v, i) => ({
      name: v.name || v.title,
      artist: v.artist || v.author,
      url: domain + jsonpData.req_0.data.midurlinfo[i].purl,
      cover: v.cover || v.pic,
      lrc: v.lrc,
    }));
  } else {
    return data.map((v) => ({
      name: v.name || v.title,
      artist: v.artist || v.author,
      url: v.url,
      cover: v.cover || v.pic,
      lrc: v.lrc,
    }));
  }
};

/**
 * 一言
 */

// 获取一言数据
export const getHitokoto = async () => {
  const res = await fetch("https://v1.hitokoto.cn");
  return await res.json();
};

/**
 * 天气
 */

// 获取 IP 所在城市
export const getIpCity = async () => {
  try {
    // 优先用 ip-api.com（支持中文），失败则用 ipapi.co
    const res = await fetch("http://ip-api.com/json/?lang=zh-CN");
    const data = await res.json();
    if (data.city) {
      return { city: data.city, countryCode: data.countryCode, lat: data.lat, lon: data.lon };
    }
  } catch {}
  // 回退：ipapi.co（支持 HTTPS）
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    return { city: data.city || null, countryCode: data.country_code || null, lat: data.latitude, lon: data.longitude };
  } catch {
    return { city: null, countryCode: null, lat: null, lon: null };
  }
};

// 获取 Open-Meteo 全球天气
export const getOpenMeteo = async (lat, lon) => {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`
  );
  return await res.json();
};

// 获取 60s 天气（国内）
export const getOtherWeather = async (city) => {
  const baseUrl = import.meta.env.VITE_WEATHER_URL || "https://api.oioweb.cn/api/weather/GetWeather";
  const url = city
    ? `${baseUrl}?query=${encodeURIComponent(city)}&encoding=utf-8`
    : baseUrl;
  const res = await fetch(url);
  return await res.json();
};
