import m from 'mithril';
import MahjongHand from './MahjongHand';
import MahjongTile from './MahjongTile';

function concealedKongs(hand) {
  const count = {};
  for (const tile of hand) {
    if (!count[tile]) {
      count[tile] = 1;
    } else {
      count[tile]++;
    }
  }
  return Object.entries(count)
    .filter(([_, n]) => n >= 4)
    .map(([tile, _]) => tile);
}

function countTiles(hand, tile) {
  return hand.filter((t) => t === tile).length;
}

export default class MyPanel {
  constructor(vnode) {
    this.myWind = vnode.attrs.wind;
    this.buttons = [
      { text: '过', show: true, eventType: 'skip' },
      { text: '杠', show: true, eventType: 'kong' },
      { text: '碰', show: true, eventType: 'pong' },
      { text: '和', show: true, eventType: 'win' },
    ];
    this.concealedKongs = [];
  }

  canSteal() {
    return mahjong.game.turn !== this.myWind && mahjong.game.players[this.myWind].stealingConfirm;
  }

  lastDiscarded() {
    return mahjong.game.players[mahjong.game.turn].discards.slice(-1)[0];
  }

  handleDiscard(tile) {
    if (mahjong.game.turn === this.myWind) {
      mahjong.pushEvent('discard', {
        playerWind: this.myWind,
        discardedTile: tile,
      });
    }
  }

  handleAction(eventType) {
    if (eventType === 'kong' && this.concealedKongs.length > 0) {
      return;
    }
    const e = {
      playerWind: this.myWind,
    };
    mahjong.pushEvent(eventType, e);
  }

  displayButtons() {
    const lastDiscarded = this.lastDiscarded();
    const hand = mahjong.game.players[this.myWind].hand;
    const myTurn = mahjong.game.turn === this.myWind;
    this.concealedKongs = myTurn ? concealedKongs(hand) : [];
    this.buttons.forEach((button) => {
      switch (button.text) {
        case '过':
          button.show = this.canSteal();
          break;
        case '杠':
          // 明杠或者暗杠
          button.show =
            (this.canSteal() && countTiles(hand, lastDiscarded) >= 3) || (myTurn && this.concealedKongs.length > 0);
          break;
        case '碰':
          button.show = this.canSteal() && countTiles(hand, lastDiscarded) >= 2;
          break;
        case '和':
          if (myTurn) {
            button.show = mahjong.checkWinningHand(hand);
          } else {
            if (lastDiscarded) {
              button.show = mahjong.checkWinningHand([...hand, lastDiscarded]);
            } else {
              button.show = false;
            }
          }
          break;
      }
    });
  }

  handleConcealedKong(tile) {
    mahjong.pushEvent('kong', {
      playerWind: this.myWind,
      kongTile: tile,
    });
  }

  view() {
    this.displayButtons();
    return (
      <div className="panel">
        <div className="bar">
          {this.buttons.map(
            (button) =>
              button.show && (
                <div className="button" onclick={() => this.handleAction(button.eventType)}>
                  {button.text}
                </div>
              )
          )}
        </div>
        {this.concealedKongs.length > 0 && (
          <div className="choosen">
            <div className="dialog">
              {this.concealedKongs.map((tile) => (
                <div className="kong" onclick={() => this.handleConcealedKong(tile)}>
                  <MahjongTile tile={tile} small={true} shadow={false} />
                  <MahjongTile tile={tile} small={true} shadow={false} />
                  <MahjongTile tile={tile} small={true} shadow={false} />
                  <MahjongTile tile={tile} small={true} shadow={false} />
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="hand-wrapper">
          <MahjongHand
            tiles={mahjong.game.players[this.myWind].hand}
            separatedLastTile={false}
            ondiscard={(tile) => this.handleDiscard(tile)}
          />
          <div className="melds">
            {mahjong.game.players[this.myWind].melds.map((meld) => (
              <div className="meld">
                {meld.tiles.map((tile) => (
                  <MahjongTile tile={tile} small={true} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}
