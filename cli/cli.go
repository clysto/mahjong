package main

import (
	"fmt"
	"unicode"

	"github.com/clysto/mahjong"
)

func main() {
	config := mahjong.DefaultGameConfig()
	config.AvailableTiles = []mahjong.TileSet{mahjong.Characters, mahjong.Honors}
	config.Players = []mahjong.Wind{mahjong.East, mahjong.West}
	game := mahjong.NewGame(config)

	game.Deal()
	game.Draw(mahjong.East)

	for {
		fmt.Print("\033[H\033[2J")
		game.Print()
		if game.Ended {
			break
		}
		cmd := ""
		fmt.Scanf("%s", &cmd)
		if unicode.IsDigit(rune(cmd[0])) {
			tile := mahjong.ParseTile(cmd)
			err := game.PushEvent(mahjong.DiscardEvent{PlayerWind: game.Turn, DiscardedTile: tile})
			if err != nil {
				fmt.Println(err)
				break
			}
		} else {
			playerWind := mahjong.Wind(-1)
			switch cmd[0] {
			case 'W':
				playerWind = mahjong.West
			case 'N':
				playerWind = mahjong.North
			case 'E':
				playerWind = mahjong.East
			case 'S':
				playerWind = mahjong.South
			}
			switch cmd[1] {
			case 'P':
				err := game.PushEvent(mahjong.PongEvent{PlayerWind: playerWind})
				if err != nil {
					fmt.Println(err)
					return
				}
			case 'K':
				err := game.PushEvent(mahjong.KongEvent{PlayerWind: playerWind})
				if err != nil {
					fmt.Println(err)
					return
				}
			case 'W':
				err := game.PushEvent(mahjong.WinEvent{PlayerWind: playerWind})
				if err != nil {
					fmt.Println(err)
					return
				}
			}
		}
	}
}
