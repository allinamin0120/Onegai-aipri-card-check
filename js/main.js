// main.js

const MAINTENANCE = false; // trueでメンテ画面falseで開く

function isAdmin() {
  const params = new URLSearchParams(location.search);
  return params.get("admin") === "0120";
}

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

// ===== スプシ読み込み追加 =====
async function loadCardsFromSheet() {
  const res = await fetch("https://opensheet.elk.sh/1LF5BUzBjZNjIoXPfV82kE1amqrfp6qV39RA4n8OUZ1E/おねがいアイプリ1だん");
  const data = await res.json();

  const newCards = data.map(row => ({
    id: row.id,
    name: row.name,
    char: row.char,
    rarity: Number(row.rarity),
    series: row.series,
    image: row.image,
    how: row.how || "",
    type: row.type || ""
  }));

  cards.push(...newCards);
}

// ===== 他JS読み込み =====
import { render } from './render.js';
import { setupUI } from './ui.js';
import { loadFromURL } from './storage.js';

window.render = render;

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

  await loadCardsFromSheet();

  loadFromURL();
  render();
  setupUI();
}

init();
