// storage.js

let owned = JSON.parse(localStorage.getItem("owned") || "{}");

export function getOwned() {
  return owned;
}

export function toggleOwned(id) {
  owned[id] = !owned[id];
  localStorage.setItem("owned", JSON.stringify(owned));
}

export function exportData(cards) {
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

export function importData() {
  let data = prompt("復元コードまたはURLを貼ってね");
  if (!data) return;

  try {
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

export function loadFromURL() {
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
}
