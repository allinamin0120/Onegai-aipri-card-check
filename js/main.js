// main.js

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
}


// ===== 他JS読み込み =====
import { render } from './render.js';
import { setupUI } from './ui.js';
import { loadFromURL } from './storage.js';


// ===== 初期処理 =====
async function init() {
  await loadParts();   //
  loadFromURL();
  render();
  setupUI();
}

init();
