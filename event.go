package mahjong

import (
	"errors"
	"slices"
)

type Event interface {
	Apply(*Game) error
}

type DiscardEvent struct {
	PlayerWind    Wind `json:"playerWind"`
	DiscardedTile Tile `json:"discardedTile"`
}

type PongEvent struct {
	PlayerWind Wind `json:"playerWind"`
}

type KongEvent struct {
	PlayerWind Wind `json:"playerWind"`
	KongTile   Tile `json:"kongTile"` // only used for concealed kong or added kong
}

type WinEvent struct {
	PlayerWind Wind `json:"playerWind"`
}

type SkipEvent struct {
	PlayerWind Wind `json:"playerWind"`
}

func (e DiscardEvent) Apply(g *Game) error {
	if g.Turn != e.PlayerWind {
		return errors.New("not player's turn")
	}
	if len(g.Wall) == 0 {
		return errors.New("wall is empty")
	}
	player, ok := g.Players[e.PlayerWind]
	if !ok {
		return errors.New("player not found")
	}
	idx := slices.Index(player.Hand, e.DiscardedTile)
	if idx == -1 {
		return errors.New("tile not found in player's hand")
	}
	for _, p := range g.Players {
		if p.StealingConfirm != nil {
			return errors.New("you have discarded a tile that can be stolen")
		}
	}

	player.Hand = append(player.Hand[:idx], player.Hand[idx+1:]...)
	player.Discards = append(player.Discards, e.DiscardedTile)
	SortHand(player.Hand)

	// 检查是否有人想要玩家刚刚打出的牌(杠碰吃和)
	g.CheckStealing()

	for _, p := range g.Players {
		if p.StealingConfirm != nil {
			return nil
		}
	}

	g.NextTurn()
	g.Draw(g.Turn)

	return nil
}

func (e PongEvent) Apply(g *Game) error {
	if g.Turn == e.PlayerWind {
		return errors.New("cannot pong yourself")
	}
	if g.Players[e.PlayerWind].StealingConfirm == nil {
		return errors.New("player cannot pong")
	}

	player := g.Players[e.PlayerWind]
	lastDiscarded := g.Players[g.Turn].Discards[len(g.Players[g.Turn].Discards)-1]
	count := CountTiles(player.Hand, lastDiscarded)
	if count < 2 {
		return errors.New("not enough tiles to pong")
	}

	player.StealingConfirm.Declared = true
	player.StealingConfirm.Type = Pong

	if g.AllPlayersConfirmedStealing() {
		// all players have confirmed stealing
		g.ApplyStealing()
	}

	return nil
}

func (e KongEvent) Apply(g *Game) error {
	if g.Turn != e.PlayerWind {
		if g.Players[e.PlayerWind].StealingConfirm == nil {
			return errors.New("player cannot kong")
		}

		player := g.Players[e.PlayerWind]
		lastDiscarded := g.Players[g.Turn].Discards[len(g.Players[g.Turn].Discards)-1]
		count := CountTiles(player.Hand, lastDiscarded)
		if count < 3 {
			return errors.New("not enough tiles to kong")
		}
		// 牌墙为空时不能杠
		if len(g.Wall) == 0 {
			return errors.New("wall is empty")
		}

		player.StealingConfirm.Declared = true
		player.StealingConfirm.Type = Kong

		if g.AllPlayersConfirmedStealing() {
			// all players have confirmed stealing
			g.ApplyStealing()
		}
		return nil
	} else {
		// 暗杠或者补杠
		// TODO: added kong logic
		player := g.Players[e.PlayerWind]
		count := CountTiles(player.Hand, e.KongTile)
		if count < 4 {
			return errors.New("not enough tiles to kong")
		}

		player.Hand = RemoveTiles(player.Hand, e.KongTile, 4)
		player.Melds = append(player.Melds, Meld{Discarder: e.PlayerWind, Tiles: []Tile{e.KongTile, e.KongTile, e.KongTile, e.KongTile}})
		SortHand(player.Hand)
		g.Draw(g.Turn)
		return nil
	}
}

func (e WinEvent) Apply(g *Game) error {
	if g.Turn != e.PlayerWind {
		if g.Players[e.PlayerWind].StealingConfirm == nil {
			return errors.New("player cannot win")
		}

		player := g.Players[e.PlayerWind]
		player.StealingConfirm.Declared = true
		player.StealingConfirm.Type = Win

		if g.AllPlayersConfirmedStealing() {
			// all players have confirmed stealing
			g.ApplyStealing()
		}

		return nil
	} else {
		if CheckWinningHand(g.Players[e.PlayerWind].Hand) {
			// 自摸赢
			g.Ended = true
			return nil
		} else {
			return errors.New("cannot win")
		}
	}

}

func (e SkipEvent) Apply(g *Game) error {
	if g.Turn == e.PlayerWind {
		return errors.New("cannot skip yourself")
	}
	if g.Players[e.PlayerWind].StealingConfirm == nil {
		return errors.New("nothing to skip")
	}

	player := g.Players[e.PlayerWind]
	player.StealingConfirm.Declared = true
	player.StealingConfirm.Type = -1

	if g.AllPlayersConfirmedStealing() {
		// all players have confirmed stealing
		g.ApplyStealing()
	}

	return nil
}
