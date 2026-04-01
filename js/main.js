// main.js

const MAINTENANCE = false;

function isAdmin() {
  const params = new URLSearchParams(location.search);
  return params.get("admin") === "0120";
}

// ===== 他JS読み込み =====
import { render, cards } from './render.js'; 
import { setupUI } from './ui.js';
import { loadFromURL } from './storage.js';

window.render = render;

// ===== パーツ読み込み =====
async function loadParts() {
  const load = async (id, path) => {
    const res = await fetch(path);
    if (!res.ok) {
      console.error("読み込み失敗:", path);
      return;
    }
    const html = await res.text();
    document.getElementById(id).innerHTML = html;
  };

  await load("headerArea", "../parts/header.html");
  await load("menuArea", "../parts/menu.html");
  await load("overlayArea", "../parts/overlay.html");
  await load("filterArea", "../parts/filter.html");
  await load("updateArea", "../parts/update.html");
  await load("modalArea", "../parts/modal.html");
}

// ===== スプシ読み込み =====
const CACHE_TIME = 1000 * 60 * 60; // 1時間

async function loadSheet(sheetName) {
  const CACHE_KEY = "cards_" + sheetName;

  const cache = localStorage.getItem(CACHE_KEY);
  const time = localStorage.getItem(CACHE_KEY + "_time");

  // キャッシュがあれば使う
  if (cache && time && Date.now() - time < CACHE_TIME) {
    return JSON.parse(cache);
  }

  // なければ取得
  const url = `https://opensheet.elk.sh/1LF5BUzBjZNjIoXPfV82kE1amqrfp6qV39RA4n8OUZ1E/${sheetName}`;
  const res = await fetch(url);
  const data = await res.json();

  // 保存
  localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  localStorage.setItem(CACHE_KEY + "_time", Date.now());

  return data;
}

// ===== 初期処理 =====
async function init() {

  if (MAINTENANCE && !isAdmin()) {
    document.body.innerHTML = `
      <div style="
        display:flex;
        height:100vh;
        justify-content:center;
        align-items:center;
        flex-direction:column;
        font-family:sans-serif;
      ">
        <h1>メンテナンス中</h1>
        <p>しばらくお待ちください</p>
      </div>
    `;
    return;
  }

  await loadParts();

cards.length = 0;

const [sheet1, sheet2] = await Promise.all([
  loadSheet("おねがいアイプリ1だん"),
  loadSheet("スペシャル")
]);

cards.push(...sheet1, ...sheet2);

  loadFromURL();
  render();
  setupUI();
}

init();

let loading = false;

window.addEventListener("scroll", () => {
  if (loading) return;

  const scrollY = window.scrollY;
  const innerHeight = window.innerHeight;
  const fullHeight = document.body.offsetHeight;

  if (scrollY + innerHeight >= fullHeight - 200) {
    loading = true;

    window.dispatchEvent(new Event("loadMore"));

    setTimeout(() => {
      loading = false;
    }, 300);
  }
});
