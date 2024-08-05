import m from 'mithril';
import MahjongTile from './MahjongTile';
import classes from './components.module.css';

export default class MahjongHiddenHand {
  view(vnode) {
    return m(
      'div',
      { className: classes.hand },
      vnode.attrs.tiles.map((tile) => m(MahjongTile, { tile: tile, hidden: true }))
    );
  }
}
