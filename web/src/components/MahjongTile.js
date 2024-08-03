import m from 'mithril';
import classNames from 'classnames';

// prettier-ignore
export const TILES = [
  '1m', '2m', '3m', '4m', '5m', '6m', '7m', '8m', '9m',
  '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p',
  '1s', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s',
  '1z', '2z', '3z', '4z', '5z', '6z', '7z'
];

const TILEIMAGES = import.meta.glob('./tiles/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});

export default class MahjongTile {
  constructor(vnode) {
    const t = vnode.attrs.tile;
    if (!TILES.includes(t)) {
      throw new Error(`Invalid tile: ${t}`);
    }
    this.tile = t;
    this.selected = vnode.attrs.selected ? true : false;
    this.small = vnode.attrs.small ? true : false;
    this.handleClick = vnode.attrs.onclick;
  }

  view(vnode) {
    return m(
      'div',
      {
        className: classNames('tile', {
          selected: vnode.attrs.selected,
          hidden: vnode.attrs.hidden,
          small: this.small,
        }),
        onclick: this.handleClick,
      },
      vnode.attrs.hidden || m.trust(TILEIMAGES[`./tiles/${this.tile}.svg`])
    );
  }
}
