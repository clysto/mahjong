package mahjong

import (
	"fmt"
)

type TileSet int
type Wind string

type Tile struct {
	Set  TileSet `json:"set"`
	Rank int     `json:"rank"`
}

type Meld struct {
	Tiles     []Tile `json:"tiles"`
	Discarder Wind   `json:"discarder"` // player who discarded the tile
}

type StealingConfirm struct {
	Declared bool `json:"declared"`
	Type     int  `json:"type"`
}

const (
	Chow = iota
	Pong
	Kong
	Win
)

const (
	Characters = iota
	Dots
	Bamboo
	Honors
)

const (
	East  = "E"
	South = "S"
	West  = "W"
	North = "N"
)

func (s TileSet) String() string {
	var t string
	switch s {
	case Characters:
		t = "m"
	case Dots:
		t = "p"
	case Bamboo:
		t = "s"
	case Honors:
		t = "z"
	}
	return t
}

func (s TileSet) MarshalJSON() ([]byte, error) {
	return []byte(fmt.Sprintf("\"%s\"", s.String())), nil
}

func (t Tile) String() string {
	var s string
	switch t.Set {
	case Characters:
		s = "m"
	case Dots:
		s = "p"
	case Bamboo:
		s = "s"
	case Honors:
		s = "z"
	}
	return fmt.Sprintf("%d%s", t.Rank, s)
}

func (t *Tile) MarshalJSON() ([]byte, error) {
	return []byte(fmt.Sprintf("\"%s\"", t.String())), nil
}

func (t *Tile) UnmarshalJSON(data []byte) error {
	data = data[1 : len(data)-1]
	tile := ParseTile(string(data))
	t.Set = tile.Set
	t.Rank = tile.Rank
	return nil
}
