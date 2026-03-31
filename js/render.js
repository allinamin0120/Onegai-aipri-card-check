// render.js

import { cards1 } from '../data/series1.js';
import { cardsSP } from '../data/seriesSP.js';
import { getOwned, isOwned, setOwned } from './storage.js';

export const cards = [...cards1, ...cardsSP];

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

  let totalAll = cards.length;
  let countAll = 0;

  let count = 0;
  let total = 0;

  cards.forEach(card => {
    const ownedFlag = !!owned[card.id];

    // 全体所持数カウント
    if (ownedFlag) countAll++;

    // フィルター
    if (seriesFilter !== "all" && card.series !== seriesFilter) return;

    if (search) {
      const name = card.name.toLowerCase().replace(/\s/g, "");
      const char = card.char.toLowerCase();
      if (!name.includes(search) && !char.includes(search)) return;
    }

    if (onlyUnowned && ownedFlag) return;
    if (onlyOwned && !ownedFlag) return;

    total++;

    const div = document.createElement("div");
    div.className = "card";

    // 👇 クリック処理（toggle完全排除）
    div.onclick = () => {
      if (card.series === "SP") {
        openModal(card);
      } else {
        setOwned(card.id, !isOwned(card.id));
        render();
      }
    };

    // 所持状態UI
    if (ownedFlag) {
      count++;
      div.classList.add("owned");
    }

    div.innerHTML =
      (card.img ? '<img src="' + card.img + '">' : '') +
      '<div class="card-info">★' + card.rarity + ' ' + card.char + '</div>' +
      '<div class="card-name">' + card.name + '</div>';

    list.appendChild(div);
  });

  // 全体所持率
  const rate = totalAll ? Math.round((countAll / totalAll) * 100) : 0;
  document.getElementById("rate").textContent =
    `${rate}% (${countAll} / ${totalAll})`;

  // ===== 弾ごとの所持率 =====
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

    const label = seriesLabel[series] || series;

    const div = document.createElement("div");
    div.className = "series-stat";
    div.textContent = `${label}：${percent}%（${owned} / ${total}）`;

    container.appendChild(div);
  });
}
