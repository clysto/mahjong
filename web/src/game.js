import { Peer } from 'peerjs';

export class Game {
  constructor() {
    startGame();
    this.game = JSON.parse(gameState());

    // Create a proxy to delegate property access to this.game
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (prop in target) {
          return Reflect.get(target, prop, receiver);
        } else if (prop in target.game) {
          return target.game[prop];
        }
      },
      set: (target, prop, value, receiver) => {
        if (prop in target) {
          return Reflect.set(target, prop, value, receiver);
        } else if (prop in target.game) {
          target.game[prop] = value;
          return true;
        }
        return false;
      },
    });
  }

  pushEvent(event) {
    this.game = JSON.parse(window.pushEvent(event.type, JSON.stringify(event)));
  }

  canSteal(wind) {
    return window.canSteal(wind);
  }

  lastDiscarded() {
    return window.lastDiscarded();
  }
}

export function checkWinningHand(hand) {
  return window.checkWinningHand(JSON.stringify(hand));
}

export function haveConcealedKong(hand) {
  const count = {};
  for (const tile of hand) {
    if (!count[tile]) {
      count[tile] = 1;
    } else {
      count[tile]++;
    }
  }
  return Object.values(count).filter((v) => v === 4).length > 0;
}

export function nextWind(wind) {
  return { E: 'W', W: 'E' }[wind];
}

export class Server {
  constructor() {
    this.peer = new Peer();
    this.peer.on('open', (id) => {
      this.id = id;
      console.log('Server ID:', id);
    });
    this.peer.on('connection', (client) => {
      console.log('Client connected:', client.peer);
      this.client = client;
      client.on('data', (data) => {
        console.log(data);
        if (data.type === 'start') {
          startGame();
          this.game = JSON.parse(gameState());
          this.client.send({
            type: 'game',
            game: this.game,
            canSteal: this.canSteal(),
            lastDiscarded: this.lastDiscarded(),
          });
        } else if (data.type === 'event') {
          this.pushEvent(data.event);
        }
      });
    });

    // Create a proxy to delegate property access to this.game
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (prop in target) {
          return Reflect.get(target, prop, receiver);
        } else if (prop in target.game) {
          return target.game[prop];
        }
      },
      set: (target, prop, value, receiver) => {
        if (prop in target) {
          return Reflect.set(target, prop, value, receiver);
        } else if (prop in target.game) {
          target.game[prop] = value;
          return true;
        }
        return false;
      },
    });
  }

  pushEvent(event) {
    this.game = JSON.parse(window.pushEvent(event.type, JSON.stringify(event)));
    if (this.client) {
      this.client.send({
        type: 'game',
        game: this.game.game,
      });
    }
  }

  canSteal(wind) {
    return window.canSteal(wind);
  }

  lastDiscarded() {
    return window.lastDiscarded();
  }
}

export class Client {
  constructor(serverId) {
    this.peer = new Peer();
    this.peer.on('open', (id) => {
      this.id = id;
      this.server = this.peer.connect(serverId);

      this.server.on('data', (data) => {
        if (data.type === 'game') {
          this.game = data.game;
          this.canSteal = data.canSteal;
          this.lastDiscarded = data.lastDiscarded;
          console.log(data.game);
        }
      });
      this.server.on('open', () => {
        console.log('Connected to server');
        this.server.send({
          type: 'start',
        });
      });
    });

    // Create a proxy to delegate property access to this.game
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (prop in target) {
          return Reflect.get(target, prop, receiver);
        } else if (prop in target.game) {
          return target.game[prop];
        }
      },
      set: (target, prop, value, receiver) => {
        if (prop in target) {
          return Reflect.set(target, prop, value, receiver);
        } else if (prop in target.game) {
          target.game[prop] = value;
          return true;
        }
        return false;
      },
    });
  }

  pushEvent(event) {
    this.server.send({
      type: 'event',
      event: event,
    });
  }

  canSteal(wind) {
    return this.canSteal;
  }

  lastDiscarded() {
    return this.lastDiscarded;
  }
}
