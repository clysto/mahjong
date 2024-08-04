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

export default function MahjongTile() {
  return {
    view(vnode) {
      return m(
        'div',
        {
          className: classNames('tile', {
            selected: vnode.attrs.selected ? true : false,
            hidden: vnode.attrs.hidden,
            small: vnode.attrs.small,
          }),
          onclick: vnode.attrs.onclick,
        },
        vnode.attrs.hidden || m.trust(TILEIMAGES[`./tiles/${vnode.attrs.tile}.svg`])
      );
    },
  };
}
