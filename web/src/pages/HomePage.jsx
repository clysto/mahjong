import m from 'mithril';
import Board from '../components/Board.jsx';
import room from '../room.js';

const { Link } = m.route;

import classes from './pages.module.css';

export default function HomePage() {
  const joinRoom = () => {
    const roomId = document.getElementById('room-input').value;
    if (!roomId) {
      return;
    }
    room.connect(roomId);
    m.route.set('/game');
  };

  const createRoom = () => {
    room.connect();
    m.route.set('/game');
  };

  return {
    view() {
      return (
        <div className={classes.game}>
          <Board title="双人麻将">
            <input className="mb-10" id="room-input" type="text" placeholder="房间号" />
            <button className="mb-10" onclick={joinRoom}>
              加入房间
            </button>
            <hr />
            <button onclick={createRoom}>创建房间</button>
            <Link href="/settings" className={classes.settingsIcon}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                fill="currentColor"
                class="bi bi-gear-wide-connected"
                viewBox="0 0 16 16"
              >
                <path d="M7.068.727c.243-.97 1.62-.97 1.864 0l.071.286a.96.96 0 0 0 1.622.434l.205-.211c.695-.719 1.888-.03 1.613.931l-.08.284a.96.96 0 0 0 1.187 1.187l.283-.081c.96-.275 1.65.918.931 1.613l-.211.205a.96.96 0 0 0 .434 1.622l.286.071c.97.243.97 1.62 0 1.864l-.286.071a.96.96 0 0 0-.434 1.622l.211.205c.719.695.03 1.888-.931 1.613l-.284-.08a.96.96 0 0 0-1.187 1.187l.081.283c.275.96-.918 1.65-1.613.931l-.205-.211a.96.96 0 0 0-1.622.434l-.071.286c-.243.97-1.62.97-1.864 0l-.071-.286a.96.96 0 0 0-1.622-.434l-.205.211c-.695.719-1.888.03-1.613-.931l.08-.284a.96.96 0 0 0-1.186-1.187l-.284.081c-.96.275-1.65-.918-.931-1.613l.211-.205a.96.96 0 0 0-.434-1.622l-.286-.071c-.97-.243-.97-1.62 0-1.864l.286-.071a.96.96 0 0 0 .434-1.622l-.211-.205c-.719-.695-.03-1.888.931-1.613l.284.08a.96.96 0 0 0 1.187-1.186l-.081-.284c-.275-.96.918-1.65 1.613-.931l.205.211a.96.96 0 0 0 1.622-.434zM12.973 8.5H8.25l-2.834 3.779A4.998 4.998 0 0 0 12.973 8.5m0-1a4.998 4.998 0 0 0-7.557-3.779l2.834 3.78zM5.048 3.967l-.087.065zm-.431.355A4.98 4.98 0 0 0 3.002 8c0 1.455.622 2.765 1.615 3.678L7.375 8zm.344 7.646.087.065z" />
              </svg>
            </Link>
          </Board>
        </div>
      );
    },
  };
}
