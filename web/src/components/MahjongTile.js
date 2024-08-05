import m from 'mithril';
import classes from './components.module.css';
import classNames from 'classnames';

// prettier-ignore
export const TILES = [
  '1m', '2m', '3m', '4m', '5m', '6m', '7m', '8m', '9m',
  '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p',
  '1s', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s',
  '1z', '2z', '3z', '4z', '5z', '6z', '7z'
];

const TILEIMAGES = import.meta.glob('./tiles/*.svg', {
  import: 'default',
  eager: true,
});

export default function MahjongTile() {
  return {
    view(vnode) {
      let shadow = true;
      if (vnode.attrs.shadow !== undefined) {
        shadow = vnode.attrs.shadow;
      }
      return m(
        'div',
        {
          className: classNames(classes.tile, {
            [classes.selected]: vnode.attrs.selected ? true : false,
            [classes.hidden]: vnode.attrs.hidden,
            [classes.small]: vnode.attrs.small,
            [classes.shadow]: shadow,
          }),
          onclick: vnode.attrs.onclick,
        },
        vnode.attrs.hidden || m('img', { draggable: false, src: TILEIMAGES[`./tiles/${vnode.attrs.tile}.svg`] })
      );
    },
  };
}
