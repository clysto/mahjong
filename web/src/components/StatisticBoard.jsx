import m from 'mithril';
import room from '../room';
import MahjongTile from './MahjongTile';
import Board from './Board.jsx';
import classes from './components.module.css';

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
        <Board title="游戏结束">
          <div className={classes.winTiles}>
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
          <div className={classes.buttons}>
            <Link href="/home" className="button">
              返回大厅
            </Link>
            <button onclick={restart}>再来一局</button>
          </div>
        </Board>
      );
    },
  };
}
