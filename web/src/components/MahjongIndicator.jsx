import m from 'mithril';
import classNames from 'classnames';
import classes from './components.module.css';

export default function MahjongIndicator() {
  return {
    view(vnode) {
      return (
        <div className={classes.indicator}>
          <div className={classNames(classes.winds, { [classes.rotate]: vnode.attrs.myWind === 'W' })}>
            <div className={classNames(classes.west, { [classes.active]: vnode.attrs.wind === 'W' })}>西</div>
            <div className={classes.row}>
              <div className={classNames(classes.south, { [classes.active]: vnode.attrs.wind === 'S' })}>南</div>
              <div className={classNames(classes.north, { [classes.active]: vnode.attrs.wind === 'N' })}>北</div>
            </div>
            <div className={classNames(classes.east, { [classes.active]: vnode.attrs.wind === 'E' })}>东</div>
          </div>
          <div className={classes.info}>
            剩余<span className={classes.number}>{vnode.attrs.tiles}</span>张
          </div>
        </div>
      );
    },
  };
}
