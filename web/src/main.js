import m from 'mithril';
import './wasm_exec.js';
import HomePage from './pages/HomePage.js';
import GamePage from './pages/GamePage.js';

const go = new Go();
WebAssembly.instantiateStreaming(fetch('index.wasm'), go.importObject).then((result) => {
  go.run(result.instance);
  startGame();
  m.route(document.getElementById('app'), '/game', {
    '/': HomePage,
    '/game': GamePage,
  });
});
