import m from 'mithril';

export default class StatisticBoard {
  constructor(vnode) {
    this.game = vnode.attrs.game;
    this.onrestart = vnode.attrs.onrestart;
  }

  view(vnode) {
    this.game = vnode.attrs.game;
    return m('div.statistic', [
      m('div.board', [
        m('h1', '游戏结束'),
        m('div.win-tiles', [
          this.game.players['W'].hand.map((tile) => m(MahjongTile, { tile: tile })),
          this.game.players['W'].melds.map((meld) =>
            m(
              'div.meld',
              meld.tiles.map((tile) => m(MahjongTile, { tile: tile, small: true }))
            )
          ),
        ]),
        m('button.button', { onclick: () => this.onrestart() }, '再来一局'),
      ]),
    ]);
  }
}
