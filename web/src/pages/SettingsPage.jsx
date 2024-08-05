import m from 'mithril';
import classes from './pages.module.css';
import Board from '../components/Board';

export default function SettingsPage() {
  const confirm = () => {
    let host = document.getElementById('host-input').value;
    if (!host) {
      localStorage.removeItem('peerjs');
      m.route.set('/home');
      return;
    }
    let path = document.getElementById('path-input').value;
    let port = '9000';
    const parsed = host.split(':');

    if (parsed.length === 2) {
      host = parsed[0];
      port = parsed[1];
    }

    if (!path.startsWith('/')) {
      path = '/' + path;
    }

    localStorage.setItem('peerjs', JSON.stringify({ host, port, path }));
    m.route.set('/home');
  };

  let peerjs = JSON.parse(localStorage.getItem('peerjs')) || { host: '', port: '', path: '' };
  let host = peerjs.host ? peerjs.host + ':' + peerjs.port : '';

  return {
    view() {
      return (
        <div className={classes.game}>
          <Board title="设置">
            <label htmlFor="host-input">服务器地址</label>
            <input id="host-input" className="mb-10" type="text" placeholder="PeerJS Official" value={host} />
            <label htmlFor="path-input">路径</label>
            <input id="path-input" type="text" placeholder="PeerJS Official" value={peerjs.path} />
            <hr />
            <button onclick={confirm}>确定</button>
          </Board>
        </div>
      );
    },
  };
}
