// render.js
export const cards = [];

import { getOwned, isOwned, setOwned } from './storage.js';

let displayCount = 100;

// レア度変換
function getRarityValue(card) {
  const r = String(card.rarity || "");

  if (r.includes("4")) return 4;
  if (r.includes("3")) return 3;
  if (r.includes("2")) return 2;

  return 0;
}

// ===== メイン描画 =====
export function render() {
  const owned = getOwned();

  const list = document.getElementById("cardList");
  list.innerHTML = "";

  const params = new URLSearchParams(location.search);
  const seriesFilter = params.get("series") || "all";

  const seriesLabel = {
    "1弾": "1だん",
    "SP": "スペシャル"
  };

  const search = document.getElementById("search").value.toLowerCase().replace(/\s/g, "");
  const onlyUnowned = document.getElementById("onlyUnowned").checked;
  const onlyOwned = document.getElementById("onlyOwned").checked;
  const rarityFilter = document.getElementById("rarityFilter").value;

  let totalAll = cards.length;
  let countAll = 0;

  // ===== カード描画 =====
  cards.forEach((card, index) => {
    if (index >= displayCount) return;

    const ownedFlag = !!owned[card.id];
    if (ownedFlag) countAll++;

    if (seriesFilter !== "all" && card.series !== seriesFilter) return;

    if (search) {
      const name = card.name.toLowerCase().replace(/\s/g, "");
      const char = card.char.toLowerCase();
      if (!name.includes(search) && !char.includes(search)) return;
    }

    if (onlyUnowned && ownedFlag) return;
    if (onlyOwned && !ownedFlag) return;

    if (rarityFilter !== "all") {
      if (getRarityValue(card) !== Number(rarityFilter)) return;
    }

    const div = document.createElement("div");
    div.className = "card";

    if (ownedFlag) {
      div.classList.add("owned");
    }

    // ===== クリック処理（完全版）=====
    div.onclick = () => {
      if (card.series === "SP") {
        openModal(card);
        return;
      }

      const newState = !isOwned(card.id);
      setOwned(card.id, newState);

      // 見た目だけ更新（超軽量）
      div.classList.toggle("owned", newState);

      // 数値更新（render使わない）
      updateStats();
      updateSeriesStats();
    };

    // ===== HTML =====
    div.innerHTML =
      (card.image ? `<img src="${card.image}" loading="lazy">` : "") +
      `<div class="card-info">★${card.rarity} ${card.char}</div>` +
      `<div class="card-name">${card.name}</div>`;

    list.appendChild(div);
  });

  // 初回だけ数値表示
  updateStats();
  updateSeriesStats();
}

// ===== 全体所持率 =====
function updateStats() {
  const owned = getOwned();

  let total = cards.length;
  let count = 0;

  cards.forEach(card => {
    if (owned[card.id]) count++;
  });

  const rate = total ? Math.round((count / total) * 100) : 0;

  document.getElementById("rate").textContent =
    `${rate}% (${count} / ${total})`;
}

// ===== 弾ごと =====
function updateSeriesStats() {
  const owned = getOwned();
  const seriesStats = {};

  cards.forEach(card => {
    const s = card.series;

    if (!seriesStats[s]) {
      seriesStats[s] = { total: 0, owned: 0 };
    }

    seriesStats[s].total++;
    if (owned[card.id]) seriesStats[s].owned++;
  });

  const container = document.getElementById("seriesStats");
  container.innerHTML = "";

  const order = ["1弾", "SP"];

  order.forEach(series => {
    if (!seriesStats[series]) return;

    const { total, owned } = seriesStats[series];
    const percent = total ? Math.round((owned / total) * 100) : 0;

    const label = series === "1弾" ? "1だん" : "スペシャル";

    const div = document.createElement("div");
    div.className = "series-stat";
    div.textContent = `${label}：${percent}%（${owned} / ${total}）`;

    container.appendChild(div);
  });
}
