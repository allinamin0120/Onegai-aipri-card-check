// ui.js

import { render } from './render.js';
import { exportData, importData } from './storage.js';
import { cards } from './render.js';

export function setupUI() {
  const menu = document.getElementById("sideMenu");
  const app = document.getElementById("app");
  const overlay = document.getElementById("overlay");

  window.toggleMenu = () => {
    menu.classList.toggle("open");
    app.classList.toggle("shift");
    overlay.classList.toggle("active");
  };

  window.closeMenu = () => {
    menu.classList.remove("open");
    app.classList.remove("shift");
    overlay.classList.remove("active");
  };

  window.exportData = () => exportData(cards);
  window.importData = importData;

  window.toggleFilter = (type) => {
    const unowned = document.getElementById("onlyUnowned");
    const ownedCheck = document.getElementById("onlyOwned");

    if (type === "unowned" && unowned.checked) {
      ownedCheck.checked = false;
    }

    if (type === "owned" && ownedCheck.checked) {
      unowned.checked = false;
    }

    render();
  };

  overlay.addEventListener("click", window.closeMenu);

  // スワイプ
  let startX = 0;
  let currentX = 0;
  let isTouching = false;

  document.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    const isOpen = menu.classList.contains("open");
    if (startX < 50 || isOpen) isTouching = true;
  });

  document.addEventListener("touchmove", (e) => {
    if (!isTouching) return;
    currentX = e.touches[0].clientX;
  });

  document.addEventListener("touchend", () => {
    if (!isTouching) return;

    const diff = currentX - startX;

    if (diff > 80) {
      menu.classList.add("open");
      app.classList.add("shift");
      overlay.classList.add("active");
    }

    if (diff < -80) {
      menu.classList.remove("open");
      app.classList.remove("shift");
      overlay.classList.remove("active");
    }

    isTouching = false;
  });
}


// モーダル開く
import { setOwned } from './storage.js';

window.openModal = (card) => {
  const modal = document.getElementById("modal");
  modal.style.display = "flex";

  // 外クリックで閉じる
  modal.onclick = (e) => {
    if (e.target.id === "modal") {
      closeModal();
    }
  };

  document.getElementById("modalImg").src = card.image;
  document.getElementById("modalText").textContent =
    "入手方法：" + (card.how || "不明");

  const owned = JSON.parse(localStorage.getItem("owned") || "{}");

  const btn = document.getElementById("modalBtn");
  const removeBtn = document.getElementById("modalRemoveBtn");

  // 状態でボタン切り替え
  if (owned[card.id]) {
    btn.style.display = "none";
    removeBtn.style.display = "inline-block";
  } else {
    btn.style.display = "inline-block";
    removeBtn.style.display = "none";
  }

  // 所持
  btn.onclick = () => {
    setOwned(card.id, true);
    render();
    closeModal();
  };

  // 未所持
  removeBtn.onclick = () => {
    setOwned(card.id, false);
    render();
    closeModal();
  };
};


// モーダル閉じる
window.closeModal = () => {
  document.getElementById("modal").style.display = "none";
};
