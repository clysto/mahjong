import m from 'mithril';
import room from '../room';

import './GamePage.css';
import '../components/components.css';

import ConnectDialog from '../components/ConnectDialog.jsx';
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
    const id = m.route.param('id');

    if (id) {
      room.connect(id);
    }

    if (!room.peer) {
      m.route.set('/home');
      return;
    }

    if (room.role === 'server') {
      this.myWind = 'E';
    } else {
      this.myWind = 'W';
    }
  }

  view() {
    return room.ready ? (
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
        {mahjong.game.ended && <StatisticBoard game={mahjong.game} />}
      </div>
    ) : (
      room.role === 'server' && (
        <div className="connection">
          <div className="board">
            <h1>等待玩家加入......</h1>
            <p className="label">分享以下房间号给你的朋友：</p>
            <input type="text" className="input" value={room.id} readOnly placeholder="创建中......" />
            <div className="spacer"></div>
            <button className="button">返回大厅</button>
          </div>
        </div>
      )
    );
  }
}
