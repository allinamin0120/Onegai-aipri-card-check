// main.js

import { render } from './render.js';
import { setupUI } from './ui.js';
import { loadFromURL } from './storage.js';

// 初期処理
loadFromURL();
render();
setupUI();
