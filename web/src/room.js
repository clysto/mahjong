import m from 'mithril';
import Peer from 'peerjs';

const ICE_CONFIG = {
  iceServers: [{ url: 'stun:stun.l.google.com:19302' }],
};

if (import.meta.env.VITE_TURN_URL) {
  ICE_CONFIG.iceServers.push({
    url: import.meta.env.VITE_TURN_URL,
    username: import.meta.env.VITE_TURN_USERNAME,
    credential: import.meta.env.VITE_TURN_CREDENTIAL,
  });
}

const room = {
  connect(serverId) {
    this.id = undefined;
    this.ready = false;
    this.players = {};
    this.role = serverId ? 'client' : 'server';
    console.log(this.role);

    if (this.peer) {
      this.peer.destroy();
    }

    try {
      const peerjsInfo = JSON.parse(localStorage.getItem('peerjs'));
      this.peer = new Peer({
        host: peerjsInfo.host,
        port: peerjsInfo.port,
        path: peerjsInfo.path,
        secure: peerjsInfo.tls,
        config: ICE_CONFIG,
      });
    } catch (e) {
      this.peer = new Peer({
        config: ICE_CONFIG,
      });
    }

    this.peer.on('open', (id) => {
      this.id = id;
      m.redraw();
      console.log(this.id);
      if (this.role === 'server') {
        this.dealer = 'E';
        wasm.startGame(this.dealer);
        this.peer.on('connection', (conn) => {
          this.conn = conn;
          console.log('Client connected: ' + conn.peer);
          this.ready = true;
          m.redraw();
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
        this.conn.on('close', () => {
          console.log('Server disconnected');
          m.route.set('/home');
        });
      }
    });
  },

  pushEvent(eventType, event) {
    if (this.role === 'client') {
      this.conn.send({ type: 'pushEvent', eventType, event });
    } else {
      mahjong.pushEvent(eventType, event);
      // localStorage.setItem('game', JSON.stringify(mahjong.game));
      this.conn.send({ type: 'state', game: mahjong.game });
    }
  },

  handleData(data) {
    if (import.meta.env.DEV) {
      console.log(data);
    }
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
        this.pushEvent(data.eventType, data.event);
        m.redraw();
      } else if (data.type === 'restart') {
        this.restart();
        m.redraw();
      }
    }
  },

  restart() {
    if (this.role === 'server') {
      this.dealer = { E: 'W', W: 'E' }[this.dealer];
      wasm.startGame(this.dealer);
      this.conn.send({ type: 'state', game: mahjong.game });
    } else {
      this.conn.send({ type: 'restart' });
    }
  },
};

export default room;
