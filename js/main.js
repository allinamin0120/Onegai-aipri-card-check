// main.js
async function loadParts() {
  const load = async (id, path) => {
    const res = await fetch(path);
    const html = await res.text();
    document.getElementById(id).innerHTML = html;
  };

  await load("headerArea", "../parts/header.html");
  await load("menuArea", "../parts/menu.html");
  await load("overlayArea", "../parts/overlay.html");
  await load("filterArea", "../parts/filter.html");
  await load("updateArea", "../parts/update.html");
}

import { render } from './render.js';
import { setupUI } from './ui.js';
import { loadFromURL } from './storage.js';

// 初期処理
loadFromURL();
render();
setupUI();
