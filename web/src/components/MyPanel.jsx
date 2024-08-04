import m from 'mithril';
import MahjongHand from './MahjongHand';
import MahjongTile from './MahjongTile';

function haveConcealedKong(hand) {
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

function countTiles(hand, tile) {
  return hand.filter((t) => t === tile).length;
}

export default class MyPanel {
  constructor(vnode) {
    this.myWind = vnode.attrs.wind;
    this.buttons = [
      { text: '过', show: true },
      { text: '杠', show: true },
      { text: '碰', show: true },
      { text: '和', show: true },
    ];
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

  handleAction(action) {
    switch (action) {
      case '过':
        mahjong.pushEvent('skip', { playerWind: this.myWind });
        break;
      case '杠':
        mahjong.pushEvent('kong', { playerWind: this.myWind });
        break;
      case '碰':
        mahjong.pushEvent('pong', { playerWind: this.myWind });
        break;
      case '和':
        mahjong.pushEvent('win', { playerWind: this.myWind });
        break;
    }
  }

  displayButtons() {
    const lastDiscarded = this.lastDiscarded();
    const hand = mahjong.game.players[this.myWind].hand;
    const myTurn = mahjong.game.turn === this.myWind;
    this.buttons.forEach((button) => {
      switch (button.text) {
        case '过':
          button.show = this.canSteal();
          break;
        case '杠':
          // 明杠或者暗杠
          button.show =
            (this.canSteal() && countTiles(hand, lastDiscarded) >= 3) || (myTurn && haveConcealedKong(hand));
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

  view() {
    this.displayButtons();
    return (
      <div className="panel">
        <div className="bar">
          {this.buttons.map(
            (button) =>
              button.show && (
                <div className="button" onclick={() => this.handleAction(button.text)}>
                  {button.text}
                </div>
              )
          )}
        </div>
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
