import m from 'mithril';
import MahjongHand from './MahjongHand';
import { checkWinningHand, haveConcealedKong, nextWind } from '../game';


export default class MyPanel {
  constructor(vnode) {
    this.game = vnode.attrs.game;
    this.myWind = vnode.attrs.wind;
    this.separatedLastTile = this.game.turn === this.myWind;
  }

  handleDiscard(tile) {
    if (this.game.turn === this.myWind) {
      this.game.pushEvent({
        type: 'discard',
        playerWind: this.myWind,
        discardedTile: tile,
      });
      m.redraw();
    }
  }

  showPong() {
    const lastDiscarded = this.game.lastDiscarded();
    if (!this.game.canSteal(this.myWind)) {
      return false;
    }
    return this.game.players[this.myWind].hand.filter((tile) => tile === lastDiscarded).length >= 2;
  }

  showKong() {
    if (this.game.turn === this.myWind) {
      return haveConcealedKong(this.game.players[this.myWind].hand);
    } else {
      const lastDiscarded = this.game.lastDiscarded();
      if (!this.game.canSteal(this.myWind)) {
        return false;
      }
      return this.game.players[this.myWind].hand.filter((tile) => tile === lastDiscarded).length === 3;
    }
  }

  showWin() {
    if (this.game.turn === this.myWind) {
      return checkWinningHand(this.game.players[this.myWind].hand);
    } else {
      const lastDiscarded = this.game.lastDiscarded();
      if (!this.game.canSteal(this.myWind)) {
        return false;
      }
      return checkWinningHand([...this.game.players[this.myWind].hand, lastDiscarded]);
    }
  }

  view(vnode) {
    this.game = vnode.attrs.game;
    this.separatedLastTile = this.game.turn === this.myWind && !this.game.canSteal(nextWind(this.myWind));
    return m('div.panel', [
      m('div.bar', [
        this.game.canSteal(this.myWind) &&
          m('div.button', { onclick: () => this.game.pushEvent({ type: 'skip', playerWind: this.myWind }) }, '过'),
        this.showKong() &&
          m(
            'div.button',
            { onclick: () => this.game.pushEvent({ type: 'kong', playerWind: this.myWind, kongTile: '1z' }) },
            '杠'
          ),
        this.showPong() &&
          m('div.button', { onclick: () => this.game.pushEvent({ type: 'pong', playerWind: this.myWind }) }, '碰'),
        this.showWin() &&
          m('div.button', { onclick: () => this.game.pushEvent({ type: 'win', playerWind: this.myWind }) }, '和'),
      ]),
      m('div.hand-wrapper', [
        m(MahjongHand, {
          tiles: this.game.players[this.myWind].hand,
          turn: this.separatedLastTile,
          ondiscard: (tile) => this.handleDiscard(tile),
        }),
        m('div.melds', [
          this.game.players[this.myWind].melds.map((meld) =>
            m(
              'div.meld',
              meld.tiles.map((tile) => m(MahjongTile, { tile: tile, small: true }))
            )
          ),
        ]),
      ]),
    ]);
  }
}
