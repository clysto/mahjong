import m from 'mithril';
import classes from './components.module.css';

export default function Board() {
  return {
    view(vnode) {
      this.game = vnode.attrs.game;
      return (
        <div className={classes.boardBack}>
          <div className={classes.board}>
            <h1>{vnode.attrs.title}</h1>
            {vnode.children}
          </div>
        </div>
      );
    },
  };
}
