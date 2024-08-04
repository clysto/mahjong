import m from 'mithril';
import room from '../room';

export default function ConnectDialog() {
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
        <div className="connection">
          <div className="board">
            <h1>双人麻将</h1>
            <input id="room-input" className="input" type="text" placeholder="房间号" />
            <button className="button" onclick={joinRoom}>
              加入房间
            </button>
            <div className="spacer"></div>
            <button className="button" onclick={createRoom}>
              创建房间
            </button>
          </div>
        </div>
      );
    },
  };
}
