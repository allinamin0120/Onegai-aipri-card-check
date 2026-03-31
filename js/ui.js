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
import { toggleOwned } from './storage.js';
import { render } from './render.js';

// モーダル開く
window.openModal = (card) => {
  const modal = document.getElementById("modal");
  modal.style.display = "flex";

  document.getElementById("modalImg").src = card.img;
  document.getElementById("modalText").textContent =
    "入手方法：" + (card.how || "不明");

  const btn = document.getElementById("modalBtn");
  btn.onclick = () => {
    toggleOwned(card.id);
    render();
  };
};

// モーダル閉じる
window.closeModal = () => {
  document.getElementById("modal").style.display = "none";
};
