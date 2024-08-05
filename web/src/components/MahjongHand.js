import m from 'mithril';
import classNames from 'classnames';
import MahjongTile from './MahjongTile';
import classes from './components.module.css';

export default class MahjongHand {
  constructor(vnode) {
    this.selectedIndex = -1;
    this.ondiscard = vnode.attrs.ondiscard;

    window.addEventListener('click', (e) => {
      if (!e.target.closest('.' + classes.hand)) {
        this.selectedIndex = -1;
        m.redraw();
      }
    });
  }

  handleTileClick(index) {
    if (this.ondiscard && index === this.selectedIndex) {
      this.ondiscard(this.tiles[index]);
      this.selectedIndex = -1;
      this.tiles = this.tiles.filter((_, i) => i !== index);
      return;
    }
    this.selectedIndex = index;
  }

  view(vnode) {
    this.tiles = vnode.attrs.tiles;
    return m(
      'div',
      {
        className: classNames(classes.hand, { [classes.separatedLastTile]: vnode.attrs.separatedLastTile }),
      },
      vnode.attrs.tiles.map((tile, index) =>
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
