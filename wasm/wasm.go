//go:build wasm

package main

import (
	"encoding/json"
	"syscall/js"

	"github.com/clysto/mahjong"
)

func main() {
	var game *mahjong.Game
	done := make(chan int, 0)
	js.Global().Set("startGame", js.FuncOf(func(this js.Value, p []js.Value) interface{} {
		config := mahjong.DefaultGameConfig()
		config.AvailableTiles = []mahjong.TileSet{mahjong.Characters, mahjong.Bamboo, mahjong.Honors}
		config.Players = []mahjong.Wind{mahjong.East, mahjong.West}

		game = mahjong.NewGame(config)

		// game.Players[mahjong.East].Hand = mahjong.ParseHand("1m 2m 3m 4m 5m 6m 7m 8m 9m 1111z")
		// game.Players[mahjong.West].Hand = mahjong.ParseHand("1m 3m 4m 5m 6m 7m 8m 9m 1m 1m 1m 2m 2m")

		game.Deal()
		game.Draw(mahjong.East)
		return nil
	}))
	js.Global().Set("gameState", js.FuncOf(func(this js.Value, p []js.Value) interface{} {
		state, err := json.Marshal(game)
		if err != nil {
			return err.Error()
		}
		return string(state)
	}))
	js.Global().Set("canSteal", js.FuncOf(func(this js.Value, p []js.Value) interface{} {
		playerWind := mahjong.Wind(p[0].String())
		return game.CanSteal(playerWind)
	}))
	js.Global().Set("pushEvent", js.FuncOf(func(this js.Value, p []js.Value) interface{} {
		eventType := p[0].String()
		switch eventType {
		case "discard":
			var event mahjong.DiscardEvent
			err := json.Unmarshal([]byte(p[1].String()), &event)
			if err != nil {
				goto end
			}
			game.PushEvent(event)
		case "pong":
			var event mahjong.PongEvent
			err := json.Unmarshal([]byte(p[1].String()), &event)
			if err != nil {
				goto end
			}
			game.PushEvent(event)
		case "kong":
			var event mahjong.KongEvent
			err := json.Unmarshal([]byte(p[1].String()), &event)
			if err != nil {
				goto end
			}
			game.PushEvent(event)
		case "win":
			var event mahjong.WinEvent
			err := json.Unmarshal([]byte(p[1].String()), &event)
			if err != nil {
				goto end
			}
			game.PushEvent(event)
		case "skip":
			var event mahjong.SkipEvent
			err := json.Unmarshal([]byte(p[1].String()), &event)
			if err != nil {
				goto end
			}
			game.PushEvent(event)
		}

	end:
		state, err := json.Marshal(game)
		if err != nil {
			return err.Error()
		}
		return string(state)
	}))
	js.Global().Set("lastDiscarded", js.FuncOf(func(this js.Value, p []js.Value) interface{} {
		if len(game.Players[game.Turn].Discards) == 0 {
			return ""
		}
		return game.Players[game.Turn].Discards[len(game.Players[game.Turn].Discards)-1].String()
	}))

	js.Global().Set("checkWinningHand", js.FuncOf(func(this js.Value, p []js.Value) interface{} {
		var hand []mahjong.Tile
		err := json.Unmarshal([]byte(p[0].String()), &hand)
		if err != nil {
			return false
		}
		return mahjong.CheckWinningHand(hand)
	}))
	<-done
}
