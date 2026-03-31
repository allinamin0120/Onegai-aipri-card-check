// storage.js

const STORAGE_KEY = "owned";

/**
 * 内部キャッシュ（高速化）
 */
let owned = load();

/**
 * 初期ロード
 */
function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    console.warn("データ破損 → 初期化");
    return {};
  }
}

/**
 * 保存（共通処理）
 */
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(owned));
}

/**
 * 全取得（参照用）
 */
export function getOwned() {
  return owned;
}

/**
 * 所持判定（安全）
 */
export function isOwned(id) {
  return !!owned[id];
}

/**
 * 所持状態セット（唯一の更新手段）
 */
export function setOwned(id, value) {
  owned[id] = !!value;
  save();
}

/**
 * 一括セット（今後用）
 */
export function setOwnedBulk(ids, value = true) {
  ids.forEach(id => {
    owned[id] = value;
  });
  save();
}

/**
 * 全削除（リセット用）
 */
export function clearOwned() {
  owned = {};
  save();
}

/**
 * データエクスポート（URLコピー）
 */
export function exportData(cards) {
  const ownedIds = cards
    .filter(card => owned[card.id])
    .map(card => card.id);

  if (ownedIds.length === 0) {
    alert("まだカードが登録されてないよ！");
    return;
  }

  const encoded = btoa(ownedIds.join(","));
  const url = `${location.origin}${location.pathname}?data=${encoded}`;

  navigator.clipboard.writeText(url).then(() => {
    alert("URLコピーしたよ！");
  }).catch(() => {
    alert("コピー失敗…手動でコピーしてね\n" + url);
  });
}

/**
 * データインポート（手動）
 */
export function importData() {
  let input = prompt("復元コードまたはURLを貼ってね");
  if (!input) return;

  try {
    if (input.includes("data=")) {
      input = input.split("data=")[1];
    }

    const decoded = atob(input);
    const ids = decoded ? decoded.split(",") : [];

    owned = {};
    ids.forEach(id => {
      owned[id] = true;
    });

    save();

    alert("復元したよ！");
    location.reload();

  } catch (e) {
    alert("コードが間違ってる！");
  }
}

/**
 * URLから自動復元（初回アクセス時）
 */
export function loadFromURL() {
  const params = new URLSearchParams(location.search);
  const data = params.get("data");
  if (!data) return;

  try {
    const decoded = atob(data);
    const ids = decoded ? decoded.split(",") : [];

    owned = {};
    ids.forEach(id => {
      owned[id] = true;
    });

    save();

  } catch (e) {
    console.log("URLデータ読み込み失敗");
  }
}
