import room from '../room';
import m from 'mithril';
import classes from './components.module.css';
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
      room.pushEvent('discard', {
        playerWind: this.myWind,
        discardedTile: tile,
      });
    }
  }

  handleAction(eventType) {
    if (eventType === 'kong' && this.concealedKongs.length > 1) {
      return;
    } else if (eventType === 'kong' && this.concealedKongs.length === 1) {
      this.handleConcealedKong(this.concealedKongs[0]);
      return;
    }
    const e = {
      playerWind: this.myWind,
    };
    room.pushEvent(eventType, e);
  }

  displayButtons() {
    const lastDiscarded = this.lastDiscarded();
    const hand = mahjong.game.players[this.myWind].hand;
    const melds = mahjong.game.players[this.myWind].melds;
    const myTurn = mahjong.game.turn === this.myWind;
    const myTiles = [...hand];
    for (let meld of melds) {
      if (meld.tiles.length >= 4) {
        continue;
      }
      myTiles.push(...meld.tiles);
    }
    this.concealedKongs = myTurn ? concealedKongs(myTiles) : [];
    this.buttons.forEach((button) => {
      switch (button.text) {
        case '过':
          button.show = this.canSteal();
          break;
        case '杠':
          if (myTurn) {
            // 暗杠或者补杠
            if (mahjong.game.wall.length === 0) {
              // 没有牌了不能杠
              this.concealedKongs = [];
              button.show = false;
            } else {
              button.show = this.concealedKongs.length > 0;
            }
          } else {
            // 明杠
            button.show = mahjong.game.wall.length > 0 && this.canSteal() && countTiles(hand, lastDiscarded) >= 3;
          }
          break;
        case '碰':
          button.show = this.canSteal() && countTiles(hand, lastDiscarded) >= 2;
          break;
        case '和':
          if (mahjong.game.ended) {
            button.show = false;
          } else if (myTurn) {
            button.show = mahjong.checkWinningHand(hand);
          } else {
            if (lastDiscarded) {
              button.show = this.canSteal() && mahjong.checkWinningHand([...hand, lastDiscarded]);
            } else {
              button.show = false;
            }
          }
          break;
      }
    });
  }

  handleConcealedKong(tile) {
    room.pushEvent('kong', {
      playerWind: this.myWind,
      kongTile: tile,
    });
  }

  view() {
    this.displayButtons();
    const separatedLastTile = mahjong.game.players[this.myWind].hand.length % 3 === 2;
    return (
      <div className={classes.panel}>
        {!mahjong.game.ended && (
          <div className={classes.bar}>
            {this.buttons.map(
              (button) =>
                button.show && (
                  <div className="button" onclick={() => this.handleAction(button.eventType)}>
                    {button.text}
                  </div>
                )
            )}
          </div>
        )}
        {this.concealedKongs.length > 0 && (
          <div className={classes.choosen}>
            <div className={classes.dialog}>
              {this.concealedKongs.map((tile) => (
                <div className={classes.kong} onclick={() => this.handleConcealedKong(tile)}>
                  <MahjongTile tile={tile} small={true} shadow={false} />
                  <MahjongTile tile={tile} small={true} shadow={false} />
                  <MahjongTile tile={tile} small={true} shadow={false} />
                  <MahjongTile tile={tile} small={true} shadow={false} />
                </div>
              ))}
            </div>
          </div>
        )}
        <div className={classes.handWrapper}>
          <MahjongHand
            tiles={mahjong.game.players[this.myWind].hand}
            separatedLastTile={separatedLastTile}
            ondiscard={(tile) => this.handleDiscard(tile)}
          />
          <div className={classes.melds}>
            {mahjong.game.players[this.myWind].melds.map((meld) => (
              <div className={classes.meld}>
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
