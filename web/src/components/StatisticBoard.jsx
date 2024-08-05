import m from 'mithril';
import room from '../room';
import MahjongTile from './MahjongTile';

const { Link } = m.route;

function gameStatistic(game) {
  // check who win
  let result = '';
  if (game.winner === 'E') {
    result = '东家胜';
  } else if (game.winner === 'S') {
    result = '南家胜';
  } else if (game.winner === 'W') {
    result = '西家胜';
  } else if (game.winner === 'N') {
    result = '北家胜';
  } else {
    result = '流局';
  }
  return result;
}

export default function StatisticBoard() {
  const restart = () => {
    room.restart();
  };

  return {
    view(vnode) {
      this.game = vnode.attrs.game;
      return (
        <div className="statistic">
          <div className="board">
            <h1>游戏结束</h1>
            <div className="win-tiles">
              {mahjong.game.players['E'].hand.map((tile) => (
                <MahjongTile tile={tile} />
              ))}
              {mahjong.game.players['E'].melds.map((meld) => (
                <div className="meld">
                  {meld.tiles.map((tile) => (
                    <MahjongTile tile={tile} small={true} />
                  ))}
                </div>
              ))}
            </div>
            <div className="info"></div>
            <div className="buttons">
              <Link href="/home" className="button">
                返回大厅
              </Link>
              <button className="button" onclick={restart}>
                再来一局
              </button>
            </div>
          </div>
        </div>
      );
    },
  };
}
