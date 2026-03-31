import { cards1 } from '../data/series1.js';
import { cardsSP } from '../data/seriesSP.js';


const cards = [...cards1, ...cardsSP];

let owned = JSON.parse(localStorage.getItem("owned") || "{}");

function render() {
  const list = document.getElementById("cardList");
  list.innerHTML = "";

const params = new URLSearchParams(location.search);
const seriesFilter = params.get("series") || "all";

const filter = "all";
const rarityFilter = "all";

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
  // 全体所持数
  if (owned[card.id]) countAll++;

  // フィルター
  if (seriesFilter !== "all" && card.series !== seriesFilter) return;
  if (filter !== "all" && card.char !== filter) return;
  if (rarityFilter !== "all" && card.rarity != rarityFilter) return;

  if (search) {
    const name = card.name.toLowerCase().replace(/\s/g, "");
    const char = card.char.toLowerCase();
    if (!name.includes(search) && !char.includes(search)) return;
  }

  if (onlyUnowned && owned[card.id]) return;
  if (onlyOwned && !owned[card.id]) return;

  total++;

  const div = document.createElement("div");
  div.className = "card";

  div.onclick = () => toggle(card.id);

  if (owned[card.id]) {
    count++;
    div.classList.add("owned");
  }

  div.innerHTML =
    (card.img ? '<img src="' + card.img + '">' : '') +
    '<div class="card-info">★' + card.rarity + ' ' + card.char + '</div>' +
    '<div class="card-name">' + card.name + '</div>';

  list.appendChild(div);
});

const rate = totalAll ? Math.round((countAll / totalAll) * 100) : 0;
document.getElementById("rate").textContent = rate + "% (" + countAll + " / " + totalAll + ")";


// ===== 弾ごとの所持率 =====
const seriesStats = {};

cards.forEach(card => {
  const s = card.series;

  if (!seriesStats[s]) {
    seriesStats[s] = { total: 0, owned: 0 };
  }

  seriesStats[s].total++;

  if (owned[card.id]) {
    seriesStats[s].owned++;
  }
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
  
function toggle(id) {
  owned[id] = !owned[id];
  localStorage.setItem("owned", JSON.stringify(owned));


render();
}

function toggleFilter(type) {
  const unowned = document.getElementById("onlyUnowned");
  const ownedCheck = document.getElementById("onlyOwned");

  if (type === "unowned" && unowned.checked) {
    ownedCheck.checked = false;
  }

  if (type === "owned" && ownedCheck.checked) {
    unowned.checked = false;
  }

  render();
}

function exportData() {
  let ownedIds = cards
    .filter(card => owned[card.id])
    .map(card => card.id)
    .join(",");

  if (!ownedIds) {
    alert("まだカードが登録されてないよ！");
    return;
  }

  let encoded = btoa(ownedIds);

  let url = location.origin + location.pathname + "?data=" + encoded;

  navigator.clipboard.writeText(url).then(() => {
    alert("URLコピーしたよ！");
  });
}

function importData() {
  let data = prompt("復元コードまたはURLを貼ってね");
  if (!data) return;

  try {
    // 🔥 URL対応
    if (data.includes("data=")) {
      data = data.split("data=")[1];
    }

    let decoded = atob(data);
    let ids = decoded ? decoded.split(",") : [];

    let newOwned = {};
    ids.forEach(id => {
      newOwned[id] = true;
    });

    localStorage.setItem("owned", JSON.stringify(newOwned));
    alert("復元したよ！");
    location.reload();

  } catch (e) {
    alert("コードが間違ってる！");
  }
}
  (function () {
  const params = new URLSearchParams(location.search);
  const data = params.get("data");
  if (!data) return;

  try {
    let decoded = atob(data);
    let ids = decoded ? decoded.split(",") : [];

    let newOwned = {};
    ids.forEach(id => {
      newOwned[id] = true;
    });

    localStorage.setItem("owned", JSON.stringify(newOwned));

  } catch (e) {
    console.log("URLデータ読み込み失敗");
  }
})();
 
render();

let newWorker;

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").then((reg) => {

    reg.onupdatefound = () => {
      newWorker = reg.installing;

      newWorker.onstatechange = () => {
        if (newWorker.state === "installed") {
          if (navigator.serviceWorker.controller) {
            document.getElementById("updateBox").style.display = "block";
          }
        }
      };
    };

  });
}


function updateApp() {
  if (!newWorker) return;

  newWorker.postMessage({ type: "SKIP_WAITING" });
  location.reload();
}



const menu = document.getElementById("sideMenu");
const app = document.getElementById("app");
const overlay = document.getElementById("overlay");

function toggleMenu() {
  menu.classList.toggle("open");
  app.classList.toggle("shift");
  overlay.classList.toggle("active");
}

function closeMenu() {
  menu.classList.remove("open");
  app.classList.remove("shift");
  overlay.classList.remove("active");
}

// 背景クリックで閉じる（1回だけ！）
overlay.addEventListener("click", closeMenu);
  
// =======================
// スワイプ操作（overlay対応版）
// =======================
let startX = 0;
let currentX = 0;
let isTouching = false;

document.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;

  const isOpen = menu.classList.contains("open");

  if (startX < 50 || isOpen) {
    isTouching = true;
  }
});

document.addEventListener("touchmove", (e) => {
  if (!isTouching) return;
  currentX = e.touches[0].clientX;
});

document.addEventListener("touchend", () => {
  if (!isTouching) return;

  const diff = currentX - startX;

  // 開く
  if (diff > 80) {
    menu.classList.add("open");
    app.classList.add("shift");
    overlay.classList.add("active");
  }

  // 閉じる
  if (diff < -80) {
    menu.classList.remove("open");
    app.classList.remove("shift");
    overlay.classList.remove("active");
  }

  isTouching = false;
});
  window.toggleMenu = toggleMenu;
window.closeMenu = closeMenu;
window.exportData = exportData;
window.importData = importData;
window.toggleFilter = toggleFilter;
  
