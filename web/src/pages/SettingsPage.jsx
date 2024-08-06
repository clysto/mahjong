import m from 'mithril';
import classNames from 'classnames';
import classes from './pages.module.css';
import Board from '../components/Board';

export default function SettingsPage() {
  let peerjs = JSON.parse(localStorage.getItem('peerjs')) || { host: '', port: '', path: '', tls: false };

  const confirm = () => {
    peerjs.host = document.getElementById('host-input').value;
    if (!peerjs.host) {
      localStorage.removeItem('peerjs');
      m.route.set('/home');
      return;
    }
    peerjs.path = document.getElementById('path-input').value;
    peerjs.port = document.getElementById('port-input').value;
    peerjs.tls = document.getElementById('tls-input').checked;

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
            <div className={classNames(classes.inputGroup, 'mb-10')}>
              <input
                id="host-input"
                className={classes.hostInput}
                type="text"
                placeholder="0.peerjs.com"
                value={peerjs.host}
              />
              <input id="port-input" className={classes.portInput} type="text" placeholder="443" value={peerjs.port} />
            </div>
            <div className={classNames(classes.inputGroup, 'mb-10')}>
              <div className="flex-1 mr-10 flex-1">
                <label htmlFor="path-input">路径</label>
                <input className={classes.pathInput} id="path-input" type="text" placeholder="/" value={peerjs.path} />
              </div>
              <div>
                <label htmlFor="tls-input">TLS</label>
                <input id="tls-input" type="checkbox" checked={peerjs.tls} />
              </div>
            </div>
            <hr />
            <button onclick={confirm}>确定</button>
          </Board>
        </div>
      );
    },
  };
}
