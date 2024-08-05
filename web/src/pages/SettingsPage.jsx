import m from 'mithril';
import classNames from 'classnames';
import classes from './pages.module.css';
import Board from '../components/Board';

export default function SettingsPage() {
  let peerjs = JSON.parse(localStorage.getItem('peerjs')) || { host: '', port: '', path: '' };

  const confirm = () => {
    peerjs.host = document.getElementById('host-input').value;
    if (!peerjs.host) {
      localStorage.removeItem('peerjs');
      m.route.set('/home');
      return;
    }
    peerjs.path = document.getElementById('path-input').value;
    peerjs.port = document.getElementById('port-input').value;

    if (!peerjs.path.startsWith('/')) {
      peerjs.path = '/' + peerjs.path;
    }

    localStorage.setItem('peerjs', JSON.stringify(peerjs));
    m.route.set('/home');
  };

  return {
    view() {
      return (
        <div className={classes.game}>
          <Board title="设置">
            <label htmlFor="host-input">服务器地址</label>
            <div className={classes.inputGroup}>
              <input
                id="host-input"
                className={classNames('mb-10', classes.hostInput)}
                type="text"
                placeholder="0.peerjs.com"
                value={peerjs.host}
              />
              <input
                id="port-input"
                className={classNames('mb-10', classes.portInput)}
                type="text"
                placeholder="443"
                value={peerjs.port}
              />
            </div>
            <label htmlFor="path-input">路径</label>
            <input id="path-input" type="text" placeholder="/" value={peerjs.path} />
            <hr />
            <button onclick={confirm}>确定</button>
          </Board>
        </div>
      );
    },
  };
}
