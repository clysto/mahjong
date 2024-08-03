package mahjong

import (
	"fmt"
	"testing"
)

func TestParseHand(t *testing.T) {
	hand := "123m 456p 789s 22z"
	tiles := ParseHand(hand)
	print(tiles)
	if len(tiles) != 11 {
		t.Errorf("Expected 11 tiles, got %d", len(tiles))
	}
	if tiles[0].Set != Characters || tiles[0].Rank != 1 {
		t.Errorf("Expected 1m, got %v", tiles[0])
	}
	if tiles[4].Set != Dots || tiles[4].Rank != 5 {
		t.Errorf("Expected 5p, got %v", tiles[4])
	}
	if tiles[8].Set != Bamboo || tiles[8].Rank != 9 {
		t.Errorf("Expected 9s, got %v", tiles[8])
	}
	if tiles[9].Set != Honors || tiles[9].Rank != 2 {
		t.Errorf("Expected 2z, got %v", tiles[9])
	}
	if tiles[10].Set != Honors || tiles[10].Rank != 2 {
		t.Errorf("Expected 2z, got %v", tiles[10])
	}
}

func TestNewGame(t *testing.T) {
	game := NewGame(DefaultGameConfig())
	fmt.Printf("Game: %+v\n", game)
	if len(game.Wall) != 136 {
		t.Errorf("Expected 136 tiles, got %d", len(game.Wall))
	}
}

func TestDealAndDiscard(t *testing.T) {
	game := NewGame(DefaultGameConfig())
	game.Deal()
	fmt.Printf("Game: %+v\n", game)
	if len(game.Wall) != 84 {
		t.Errorf("Expected 84 tiles, got %d", len(game.Wall))
	}
	for _, player := range game.Players {
		if len(player.Hand) != 13 {
			t.Errorf("Expected 13 tiles, got %d", len(player.Hand))
		}
	}
	game.Draw(East)
	fmt.Printf("East hand: %+v\n", game.Players[East].Hand)
	err := game.PushEvent(DiscardEvent{PlayerWind: East, DiscardedTile: game.Players[East].Hand[0]})
	if err != nil {
		t.Errorf("Error: %v", err)
	}
}

func TestDiscard(t *testing.T) {
	game := NewGame(DefaultGameConfig())
	game.Deal()
	game.Draw(East)
	game.Print()
}

func TestCheckWinningHand(t *testing.T) {
	samples := map[string]bool{
		"123m 456p 789s 234s 22z": true,
		"111m 22z":                true,
		"567m 1z":                 false,
		"11m22s33m44m55m66m22z":   true,
		"11m22s33m44m55m66m":      false,
		"11123334456678s":         true,
		"111s456p2z":              false,
		"111s456p22z":             true,
		"12356799m 123567z":       false,
	}

	for hand, expected := range samples {
		tiles := ParseHand(hand)
		if CheckWinningHand(tiles) != expected {
			t.Errorf("Failed for %v, expected %v", tiles, expected)
		}
	}
}
