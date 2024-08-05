import m from 'mithril';
import room from '../room';

const { Link } = m.route;

import classes from './pages.module.css';

import MyPanel from '../components/MyPanel.jsx';
import MahjongTile from '../components/MahjongTile';
import MahjongIndicator from '../components/MahjongIndicator.jsx';
import MahjongHiddenHand from '../components/MahjongHiddenHand';
import StatisticBoard from '../components/StatisticBoard.jsx';
import Board from '../components/Board';

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
      <div className={classes.game}>
        <div className={classes.oponent}>
          <div className={classes.melds}>
            {mahjong.game.players[nextWind(this.myWind)].melds.map((meld) => (
              <div className={classes.meld}>
                {meld.tiles.map((tile) => (
                  <MahjongTile tile={tile} small={true} />
                ))}
              </div>
            ))}
          </div>
          <MahjongHiddenHand tiles={mahjong.game.players[nextWind(this.myWind)].hand} />
        </div>
        <div className={`${classes.discarded} ${classes.rotate}`}>
          {mahjong.game.players[nextWind(this.myWind)].discards.map((tile) => (
            <MahjongTile tile={tile} small={true} />
          ))}
        </div>
        <div className={classes.center}>
          <MahjongIndicator wind={mahjong.game.turn} tiles={mahjong.game.wall.length} myWind={this.myWind} />
        </div>
        <div className={classes.discarded}>
          {mahjong.game.players[this.myWind].discards.map((tile) => (
            <MahjongTile tile={tile} small={true} />
          ))}
        </div>
        <MyPanel wind={this.myWind} />
        {mahjong.game.ended && <StatisticBoard game={mahjong.game} />}
      </div>
    ) : (
      room.role === 'server' && (
        <div className={classes.game}>
          <Board title="等待玩家加入......">
            <p className="mb-10">分享以下房间号给你的朋友：</p>
            <input className="mb-10" type="text" value={room.id} readOnly placeholder="创建中......" />
            <hr />
            <Link href="/home" className="button">
              返回大厅
            </Link>
          </Board>
        </div>
      )
    );
  }
}
