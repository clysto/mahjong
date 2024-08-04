import m from 'mithril';
import Peer from 'peerjs';
import './GamePage.css';

import '../components/components.css';

import MyPanel from '../components/MyPanel.jsx';
import MahjongTile from '../components/MahjongTile';
import MahjongIndicator from '../components/MahjongIndicator.jsx';
import MahjongHiddenHand from '../components/MahjongHiddenHand';
import StatisticBoard from '../components/StatisticBoard.jsx';

function nextWind(wind) {
  return { E: 'W', W: 'E' }[wind];
}

export default class GamePage {
  constructor() {
    this.ready = false;
    this.peer = new Peer({
      host: 'localhost',
      port: 9000,
      path: '/myapp',
    });
    const id = m.route.param('id');
    if (id) {
      this.isClient = true;
      this.serverId = id;
      this.myWind = 'W';

      this.peer.on('open', () => {
        this.conn = this.peer.connect(this.serverId);
        this.conn.on('open', () => {
          console.log('Connected to server');
          this.conn.send({ type: 'state' });
          mahjong.server = this.conn;

          this.conn.on('data', (data) => {
            console.log(data);
            mahjong.game = data;
            this.ready = true;
            m.redraw();
          });
        });
      });
    } else {
      mahjong.startGame();
      this.isClient = false;
      this.myWind = 'E';
      this.peer.on('open', (id) => {
        this.serverId = id;
        console.log(this.serverId);
      });

      this.peer.on('connection', (conn) => {
        this.conn = conn;
        mahjong.client = this.conn;
        console.log('Client connected');
        this.conn.on('data', (data) => {
          console.log(data);
          this.ready = true;
          m.redraw();
          if (data.type == 'pushEvent') {
            mahjong.pushEvent(data.eventType, data.event);
          }
          this.conn.send(mahjong.game);
        });
      });
    }
  }

  restart() {
    mahjong.startGame();
    m.redraw();
  }

  view() {
    return (
      this.ready && (
        <div>
          <div className="game">
            <div className="oponent">
              <div className="melds">
                {mahjong.game.players[nextWind(this.myWind)].melds.map((meld) => (
                  <div className="meld">
                    {meld.tiles.map((tile) => (
                      <MahjongTile tile={tile} small={true} />
                    ))}
                  </div>
                ))}
              </div>
              <MahjongHiddenHand tiles={mahjong.game.players[nextWind(this.myWind)].hand} />
            </div>
            <div className="discarded rotate">
              {mahjong.game.players[nextWind(this.myWind)].discards.map((tile) => (
                <MahjongTile tile={tile} small={true} />
              ))}
            </div>
            <div className="center">
              <MahjongIndicator wind={mahjong.game.turn} tiles={mahjong.game.wall.length} myWind={this.myWind} />
            </div>
            <div className="discarded">
              {mahjong.game.players[this.myWind].discards.map((tile) => (
                <MahjongTile tile={tile} small={true} />
              ))}
            </div>
            <MyPanel wind={this.myWind} />
          </div>
          {/* <MyPanel wind="W" /> */}
          {mahjong.game.ended && <StatisticBoard game={mahjong.game} onrestart={() => this.restart()} />}
        </div>
      )
    );
  }
}
