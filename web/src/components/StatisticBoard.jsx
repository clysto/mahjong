import m from 'mithril';
import room from '../room';
import MahjongTile from './MahjongTile';
import Board from './Board.jsx';
import classes from './components.module.css';

const { Link } = m.route;

function gameStatistic(game) {
  const statistic = {};
  const lastDiscarded = game.players[mahjong.game.turn].discards.slice(-1)[0];
  for (const player of Object.values(game.players)) {
    const hand = player.hand;
    if (mahjong.checkWinningHand(hand)) {
      statistic.winner = player.wind;
    } else if (mahjong.checkWinningHand([...hand, lastDiscarded])) {
      statistic.winner = player.wind;
      statistic.winningTile = lastDiscarded;
    }
  }
  return statistic;
}

export default function StatisticBoard() {
  const restart = () => {
    room.restart();
  };

  const statistic = gameStatistic(mahjong.game)

  return {
    view() {
      return (
        <Board title="游戏结束">
          <div className={classes.winTiles}>
            {mahjong.game.players[statistic.winner].hand.map((tile) => (
              <MahjongTile tile={tile} />
            ))}
            {
              statistic.winningTile && <div className={classes.winningTile}>
                <MahjongTile tile={statistic.winningTile} />
              </div>
            }
            {mahjong.game.players[statistic.winner].melds.map((meld) => (
              <div className={classes.meld}>
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
