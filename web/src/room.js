import m from 'mithril';
import Peer from 'peerjs';

const HOST = 'localhost';
const PORT = 9000;
const PATH = '/myapp';

const room = {
  connect(serverId) {
    this.ready = false;
    this.role = serverId ? 'client' : 'server';
    console.log(this.role);

    if (this.role === 'server') {
      wasm.startGame();
    }

    if (this.peer) {
      this.peer.destroy();
    }

    this.peer = new Peer({
      host: HOST,
      port: PORT,
      path: PATH,
    });

    this.peer.on('open', (id) => {
      this.id = id;
      m.redraw();
      console.log(this.id);
      if (this.role === 'server') {
        this.peer.on('connection', (conn) => {
          console.log('Client connected: ' + conn.peer);
          this.ready = true;
          m.redraw();
          this.conn = conn;
          this.conn.on('data', this.handleData.bind(this));
        });
      } else {
        this.conn = this.peer.connect(serverId);
        this.conn.on('open', () => {
          console.log('Connected to server: ' + serverId);
          m.redraw();
          this.conn.on('data', this.handleData.bind(this));
          this.conn.send({ type: 'state' });
        });
      }
    });
  },

  pushEvent(eventType, event) {
    if (this.role === 'client') {
      this.conn.send({ type: 'pushEvent', eventType, event });
    } else {
      wasm.pushEvent(eventType, event);
      this.conn.send({ type: 'state', game: mahjong.game });
    }
  },

  handleData(data) {
    console.log(data);
    if (this.role === 'client') {
      if (data.type === 'state') {
        this.ready = true;
        wasm.game = data.game;
        m.redraw();
      }
    } else {
      if (data.type === 'state') {
        this.conn.send({ type: 'state', game: mahjong.game });
      } else if (data.type === 'pushEvent') {
        wasm.pushEvent(data.eventType, data.event);
        this.conn.send({ type: 'state', game: mahjong.game });
        m.redraw();
      }
    }
  },
};

export default room;