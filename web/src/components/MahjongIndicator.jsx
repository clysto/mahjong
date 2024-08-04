import m from 'mithril';
import classNames from 'classnames';

export default function MahjongIndicator() {
  return {
    view(vnode) {
      return (
        <div className="indicator">
          <div className={classNames('winds', { rotate: vnode.attrs.myWind === 'W' })}>
            <div className={classNames('west', { active: vnode.attrs.wind === 'W' })}>西</div>
            <div className="row">
              <div className={classNames('south', { active: vnode.attrs.wind === 'S' })}>南</div>
              <div className={classNames('north', { active: vnode.attrs.wind === 'N' })}>北</div>
            </div>
            <div className={classNames('east', { active: vnode.attrs.wind === 'E' })}>东</div>
          </div>
          <div className="info">
            剩余<span className="number">{vnode.attrs.tiles}</span>张
          </div>
        </div>
      );
    },
  };
}
