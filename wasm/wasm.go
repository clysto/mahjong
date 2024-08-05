//go:build wasm

package main

import (
	"errors"
	"reflect"
	"syscall/js"

	"github.com/clysto/mahjong"
)

var game *mahjong.Game

func startGame(this js.Value, args []js.Value) (interface{}, error) {
	config := mahjong.DefaultGameConfig()
	config.AvailableTiles = []mahjong.TileSet{mahjong.Characters, mahjong.Honors}
	config.Players = []mahjong.Wind{mahjong.East, mahjong.West}
	game = mahjong.NewGame(config)
	game.Deal()
	if len(args) > 0 {
		game.Turn = mahjong.Wind(args[0].String())
		game.Draw(mahjong.Wind(args[0].String()))
	} else {
		game.Draw(mahjong.East)
	}
	obj := js.Global().Get("wasm")
	obj.Set("game", GenerateJSValue(game))
	return nil, nil
}

func pushEvent(this js.Value, args []js.Value) (interface{}, error) {
	eventType := args[0].String()
	eventTypeMap := map[string]reflect.Type{
		"discard": reflect.TypeOf(mahjong.DiscardEvent{}),
		"pong":    reflect.TypeOf(mahjong.PongEvent{}),
		"kong":    reflect.TypeOf(mahjong.KongEvent{}),
		"win":     reflect.TypeOf(mahjong.WinEvent{}),
		"skip":    reflect.TypeOf(mahjong.SkipEvent{}),
	}
	eventTypeReflect, ok := eventTypeMap[eventType]
	if !ok {
		return nil, errors.New("invalid event type")
	}

	event := reflect.New(eventTypeReflect).Interface()
	err := UnmarshalJSValue(args[1], event)
	if err != nil {
		return nil, err
	}
	err = game.PushEvent(event.(mahjong.Event))
	obj := js.Global().Get("mahjong")
	obj.Set("game", GenerateJSValue(game))
	return nil, err
}

func checkWinningHand(this js.Value, args []js.Value) (interface{}, error) {
	var hand []mahjong.Tile
	err := UnmarshalJSValue(args[0], &hand)
	if err != nil {
		return false, nil
	}
	return mahjong.CheckWinningHand(hand), nil
}

func main() {
	done := make(chan int, 0)
	global := js.Global()
	wasm := global.Get("Object").New()
	global.Set("wasm", wasm)

	RegisterFunc(wasm, "startGame", startGame)
	RegisterFunc(wasm, "pushEvent", pushEvent)
	RegisterFunc(wasm, "checkWinningHand", checkWinningHand)

	<-done
}
