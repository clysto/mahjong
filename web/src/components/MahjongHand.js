import m from 'mithril';
import classNames from 'classnames';
import MahjongTile from './MahjongTile';

export default class MahjongHand {
  constructor(vnode) {
    this.tiles = vnode.attrs.tiles;
    this.selectedIndex = -1;
    this.ondiscard = vnode.attrs.ondiscard;
    // onclick outside
    window.addEventListener('click', (e) => {
      if (!e.target.closest('.hand')) {
        this.selectedIndex = -1;
        m.redraw();
      }
    });
  }

  handleTileClick(index) {
    if (this.ondiscard && index === this.selectedIndex) {
      this.selectedIndex = -1;
      this.ondiscard(this.tiles[index]);
      return;
    }
    this.selectedIndex = index;
  }

  view(vnode) {
    this.tiles = vnode.attrs.tiles;
    return m(
      'div.hand',
      {
        className: classNames({ turn: vnode.attrs.turn }),
      },
      this.tiles.map((tile, index) =>
        m(MahjongTile, {
          key: `${tile}-${index}`,
          tile: tile,
          selected: this.selectedIndex === index,
          onclick: () => this.handleTileClick(index),
        })
      )
    );
  }
}
