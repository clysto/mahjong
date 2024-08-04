package mahjong

import (
	"fmt"
	"math/rand"
	"time"

	"github.com/fatih/color"
)

type Player struct {
	Hand            []Tile           `json:"hand"`
	Discards        []Tile           `json:"discards"`
	Melds           []Meld           `json:"melds"`
	Wind            Wind             `json:"wind"`
	StealingConfirm *StealingConfirm `json:"stealingConfirm"`
}

type GameConfig struct {
	Players        []Wind    `json:"players"`
	AllowChow      bool      `json:"allowChow"`
	AvailableTiles []TileSet `json:"availableTiles"`
}

type Game struct {
	Turn    Wind             `json:"turn"`
	Wall    []Tile           `json:"wall"`
	Players map[Wind]*Player `json:"players"`
	Config  GameConfig       `json:"config"`
	Ended   bool             `json:"ended"`
}

func DefaultGameConfig() GameConfig {
	return GameConfig{
		Players:        []Wind{East, South, West, North},
		AllowChow:      false,
		AvailableTiles: []TileSet{Characters, Dots, Bamboo, Honors},
	}
}

func NewGame(config GameConfig) *Game {
	game := new(Game)
	game.Config = config
	game.Turn = East
	game.Wall = make([]Tile, 0)
	game.Players = make(map[Wind]*Player)
	for _, wind := range config.Players {
		game.Players[wind] = &Player{Wind: wind}
		game.Players[wind].Hand = make([]Tile, 0)
		game.Players[wind].Discards = make([]Tile, 0)
		game.Players[wind].Melds = make([]Meld, 0)
	}
	for _, s := range config.AvailableTiles {
		rankMax := 9
		if s == Honors {
			rankMax = 7
		}
		for i := 1; i <= rankMax; i++ {
			game.Wall = append(game.Wall, Tile{Set: s, Rank: i})
			game.Wall = append(game.Wall, Tile{Set: s, Rank: i})
			game.Wall = append(game.Wall, Tile{Set: s, Rank: i})
			game.Wall = append(game.Wall, Tile{Set: s, Rank: i})
		}
	}
	random := rand.New(rand.NewSource(time.Now().UnixNano()))
	random.Shuffle(len(game.Wall), func(i, j int) {
		game.Wall[i], game.Wall[j] = game.Wall[j], game.Wall[i]
	})
	return game
}

// move to the next player, the order is East -> South -> West -> North
func (g *Game) NextTurn() {
	if len(g.Wall) == 0 {
		g.Ended = true
		return
	}

	order := map[Wind]Wind{
		East:  South,
		South: West,
		West:  North,
		North: East,
	}
	ok := false
	wind := g.Turn
	for !ok {
		wind = order[wind]
		_, ok = g.Players[wind]
	}
	g.Turn = wind
}

// deal 13 tiles to each player
func (g *Game) Deal() {
	for i := 0; i < 13; i++ {
		for _, p := range g.Players {
			p.Hand = append(p.Hand, g.Wall[0])
			SortHand(p.Hand)
			g.Wall = g.Wall[1:]
		}
	}
}

// draw a tile from the wall for the player
func (g *Game) Draw(playerWind Wind) {
	if len(g.Wall) == 0 {
		return
	}
	player := g.Players[playerWind]
	player.Hand = append(player.Hand, g.Wall[0])
	g.Wall = g.Wall[1:]
}

// check who can steal last discarded tile, chow, pong, kong, or win
func (g *Game) CheckStealing() {
	lastDiscarded := g.Players[g.Turn].Discards[len(g.Players[g.Turn].Discards)-1]
	for _, p := range g.Players {
		if g.Turn == p.Wind {
			// cannot steal yourself
			p.StealingConfirm = nil
		} else {
			count := CountTiles(p.Hand, lastDiscarded)
			canWin := CheckWinningHand(append(p.Hand, lastDiscarded))
			if count >= 2 || canWin {
				p.StealingConfirm = &StealingConfirm{Declared: false, Type: -1}
			} else {
				p.StealingConfirm = nil
			}
		}
	}
}

func (g *Game) CanSteal(playerWind Wind) bool {
	if g.Players[playerWind] == nil {
		return false
	}
	return g.Players[playerWind].StealingConfirm != nil
}

func (g *Game) AllPlayersConfirmedStealing() bool {
	for _, p := range g.Players {
		if p.StealingConfirm != nil && !p.StealingConfirm.Declared {
			return false
		}
	}
	return true
}

func (g *Game) ApplyStealing() {
	if !g.AllPlayersConfirmedStealing() {
		return
	}
	// find player who can steal the tile
	var whoCanSteal Wind
	stealType := -1
	for _, p := range g.Players {
		if p.StealingConfirm != nil {
			// if someone can win, then the game ends
			if p.StealingConfirm.Type == Win {
				g.Ended = true
				return
			}
			// if the stealing priority is higher than the current one
			if p.StealingConfirm.Type > stealType {
				stealType = p.StealingConfirm.Type
				whoCanSteal = p.Wind
			}
		}
	}

	if stealType == -1 {
		// no one wants to steal the tile
		for _, p := range g.Players {
			p.StealingConfirm = nil
		}
		g.NextTurn()
		g.Draw(g.Turn)
		return
	}

	// apply the stealing
	lastDiscarded := g.Players[g.Turn].Discards[len(g.Players[g.Turn].Discards)-1]
	player := g.Players[whoCanSteal]
	count := CountTiles(player.Hand, lastDiscarded)
	switch stealType {
	case Chow:
		// TODO
	case Pong:
		if count < 2 {
			break
		}
		g.Players[g.Turn].Discards = g.Players[g.Turn].Discards[:len(g.Players[g.Turn].Discards)-1]
		player.Hand = RemoveTiles(player.Hand, lastDiscarded, 2)
		player.Melds = append(player.Melds,
			Meld{Tiles: []Tile{lastDiscarded, lastDiscarded, lastDiscarded}, Discarder: g.Turn})
		g.Turn = whoCanSteal
	case Kong:
		if count < 3 {
			break
		}
		g.Players[g.Turn].Discards = g.Players[g.Turn].Discards[:len(g.Players[g.Turn].Discards)-1]
		player.Hand = RemoveTiles(player.Hand, lastDiscarded, 3)
		player.Melds = append(player.Melds,
			Meld{Tiles: []Tile{lastDiscarded, lastDiscarded, lastDiscarded, lastDiscarded}, Discarder: g.Turn})
		SortHand(player.Hand)
		g.Turn = whoCanSteal
		g.Draw(g.Turn)
	}

	for _, p := range g.Players {
		p.StealingConfirm = nil
	}
}

func (g *Game) PushEvent(event Event) error {
	if g.Ended {
		return fmt.Errorf("game has ended")
	}
	return event.Apply(g)
}

func (g *Game) Print() {
	cyanBold := color.New(color.FgCyan, color.Bold)
	gray := color.New(color.FgHiBlack)
	green := color.New(color.FgGreen)
	red := color.New(color.FgRed)
	gray.Printf("Wall   %d\n", len(g.Wall))
	for _, wind := range []Wind{East, South, West, North} {
		if _, ok := g.Players[wind]; !ok {
			continue
		}
		p := g.Players[wind]
		out := gray
		if p.Wind == g.Turn {
			out = cyanBold
			out.Printf("%-6s %s ", fmt.Sprintf("%s%s", p.Wind, "*"), p.Hand)
			gray.Printf("%s ", p.Discards)
		} else {
			out.Printf("%-6s %s %s ", p.Wind, p.Hand, p.Discards)
		}
		out.Print("[")
		for i, t := range p.Melds {
			out.Printf("%s", t)
			if i < len(p.Melds)-1 {
				out.Print(" ")
			}
		}
		out.Print("]\n")
		if p.StealingConfirm != nil {
			if p.StealingConfirm.Declared {
				green.Printf("       confirmed steal: %v", p.StealingConfirm.Declared)
				if p.StealingConfirm.Type == Win {
					green.Printf(" (win)\n")
				} else {
					green.Printf("\n")
				}
			} else {
				red.Printf("       confirmed steal: %v\n", p.StealingConfirm.Declared)
			}
		}
	}
}
