import m from 'mithril';
import MahjongTile from './MahjongTile';

export default class MahjongHiddenHand {
  view(vnode) {
    return m(
      'div.hand',
      vnode.attrs.tiles.map((tile) => m(MahjongTile, { tile: tile, hidden: true }))
    );
  }
}
