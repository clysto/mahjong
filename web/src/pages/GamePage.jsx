import m from 'mithril';
import './GamePage.css';

import '../components/components.css';

import MyPanel from '../components/MyPanel.jsx';
import MahjongTile from '../components/MahjongTile';
import MahjongIndicator from '../components/MahjongIndicator';
import MahjongHiddenHand from '../components/MahjongHiddenHand';
import StatisticBoard from '../components/StatisticBoard.jsx';

export default class GamePage {
  constructor() {
    mahjong.startGame();
  }

  restart() {
    mahjong.startGame();
    m.redraw();
  }

  view() {
    return (
      <div>
        <div className="game">
          <div className="oponent">
            <div className="melds">
              {mahjong.game.players['W'].melds.map((meld) => (
                <div className="meld">
                  {meld.tiles.map((tile) => (
                    <MahjongTile tile={tile} small={true} />
                  ))}
                </div>
              ))}
            </div>
            <MahjongHiddenHand tiles={mahjong.game.players['W'].hand} />
          </div>
          <div className="discarded">
            {mahjong.game.players['W'].discards.map((tile) => (
              <MahjongTile tile={tile} small={true} />
            ))}
          </div>
          <div className="center">
            <MahjongIndicator wind={mahjong.game.turn} tiles={mahjong.game.wall.length} />
          </div>
          <div className="discarded">
            {mahjong.game.players['E'].discards.map((tile) => (
              <MahjongTile tile={tile} small={true} />
            ))}
          </div>
          <MyPanel wind="E" />
        </div>
        <MyPanel wind="W" />
        {mahjong.game.ended && <StatisticBoard game={mahjong.game} onrestart={() => this.restart()} />}
      </div>
    );
  }
}
