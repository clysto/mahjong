import m from 'mithril';
import classNames from 'classnames';

export default class MahjongIndicator {
  view(vnode) {
    return m('div.indicator', [
      m('div.west', { className: classNames({ active: vnode.attrs.wind === 'W' }) }, '西'),
      m('div.row', [
        m('div.south', { className: classNames({ active: vnode.attrs.wind === 'S' }) }, '南'),
        m('div.north', { className: classNames({ active: vnode.attrs.wind === 'N' }) }, '北'),
      ]),
      m('div.east', { className: classNames({ active: vnode.attrs.wind === 'E' }) }, '东'),
      m('div.info', ['剩余', m('span.number', vnode.attrs.game.wall.length), '张']),
    ]);
  }
}
