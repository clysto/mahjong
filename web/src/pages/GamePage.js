import './GamePage.css';
import m from 'mithril';
import { Game } from '../game';

import '../components/components.css';

import MyPanel from '../components/MyPanel';
import MahjongTile from '../components/MahjongTile';
import MahjongIndicator from '../components/MahjongIndicator';
import MahjongHiddenHand from '../components/MahjongHiddenHand';
import StatisticBoard from '../components/StatisticBoard';

export default class GamePage {
  constructor() {
    this.game = new Game();
    console.log(this.game.game);
  }

  restart() {
    this.game = new Game();
    console.log(this.game.game);
    m.redraw();
  }

  view() {
    return m('div', [
      m('div.game', [
        m('div.oponent', [
          m('div.melds', [
            this.game.players['W'].melds.map((meld) =>
              m(
                'div.meld',
                meld.tiles.map((tile) => m(MahjongTile, { tile: tile, small: true }))
              )
            ),
          ]),
          m(MahjongHiddenHand, { tiles: this.game.players['W'].hand }),
        ]),
        m('div.discarded', [
          this.game.players['W'].discards.map((tile) => m(MahjongTile, { tile: tile, small: true })),
        ]),
        m('div.center', [m(MahjongIndicator, { wind: this.game.turn, game: this.game })]),
        m('div.discarded', [
          this.game.players['E'].discards.map((tile) => m(MahjongTile, { tile: tile, small: true })),
        ]),
        m(MyPanel, {
          game: this.game,
          wind: 'E',
        }),
      ]),
      m(MyPanel, {
        game: this.game,
        wind: 'W',
      }),
      this.game.ended && m(StatisticBoard, { game: this.game, onrestart: () => this.restart() }),
    ]);
  }
}
