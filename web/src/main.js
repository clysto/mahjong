import m from 'mithril';
import './wasm_exec.js';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';

const go = new Go();
WebAssembly.instantiateStreaming(fetch('index.wasm'), go.importObject).then((result) => {
  go.run(result.instance);

  window.mahjong = new Proxy(window.wasm, {
    get: (target, prop) => {
      if (target[prop] instanceof Function) {
        return new Proxy(target[prop], {
          apply: (target, thisArg, argumentsList) => {
            if (prop === 'pushEvent' && mahjong.server) {
              mahjong.server.send({ type: 'pushEvent', eventType: argumentsList[0], event: argumentsList[1] });
              return null;
            }

            const result = target.apply(thisArg, argumentsList);
            if (result.error) {
              throw new Error(result.error);
            }
            if (prop === 'pushEvent' && mahjong.client) {
              mahjong.client.send(mahjong.game);
            }
            return result.data;
          },
        });
      }
      return target[prop];
    },
  });

  m.route(document.getElementById('app'), '/home', {
    '/home': HomePage,
    '/game': GamePage,
  });
});
