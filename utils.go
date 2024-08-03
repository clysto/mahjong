package mahjong

import (
	"sort"
	"unicode"
)

var TAB3N map[uint]struct{}
var TAB3N2 map[uint]struct{}

func init() {
	TAB3N = make(map[uint]struct{})
	TAB3N2 = make(map[uint]struct{})
	initialHand := make([]int, 9)
	TAB3N[joinInts(initialHand)] = struct{}{}
	Gen3N(initialHand, 1, TAB3N)
	Gen3N2(TAB3N2)
}

func joinInts(a []int) uint {
	// 27 bits, 3bits for each rank
	var result uint
	for rank := 0; rank < 9; rank++ {
		result = result << 3
		result |= (uint(a[rank]) & 0x7)
	}
	return result
}

func Gen3N(a []int, level int, table map[uint]struct{}) {
	if level > 4 {
		return
	}

	// add a triplet
	for i := 0; i < 9; i++ {
		if a[i]+3 > 4 {
			continue
		}
		b := append([]int(nil), a...)
		b[i] += 3
		key := joinInts(b)
		table[key] = struct{}{}
		Gen3N(b, level+1, table)
	}

	// add a sequence
	for i := 0; i < 7; i++ {
		if a[i]+1 > 4 || a[i+1]+1 > 4 || a[i+2]+1 > 4 {
			continue
		}
		b := append([]int(nil), a...)
		b[i] += 1
		b[i+1] += 1
		b[i+2] += 1
		key := joinInts(b)
		table[key] = struct{}{}
		Gen3N(b, level+1, table)
	}
}

func Gen3N2(table map[uint]struct{}) {
	for i := 0; i < 9; i++ {
		a := make([]int, 9)
		a[i] += 2
		key := joinInts(a)
		table[key] = struct{}{}
		Gen3N(a, 1, table)
	}
}

func CheckWinningHand(tiles []Tile) bool {
	// m p s z1 z2 z3 z4 z5 z6 z7
	hand := [10][9]int{}
	for _, t := range tiles {
		if t.Set == Honors {
			hand[Honors+t.Rank-1][0]++
		} else {
			hand[t.Set][t.Rank-1]++
		}
	}

	if len(tiles) == 14 {
		// check if the hand is a seven pairs
		pairs := 0
		for s := 0; s < 10; s++ {
			for r := 0; r < 9; r++ {
				if hand[s][r] == 2 {
					pairs++
				}
			}
		}
		if pairs == 7 {
			return true
		}
	}

	have3n2 := false
	for s := 0; s < 10; s++ {
		a := joinInts(hand[s][:])
		if _, ok := TAB3N2[a]; ok {
			if have3n2 {
				return false
			} else {
				have3n2 = true
			}
		} else if _, ok := TAB3N[a]; !ok {
			return false
		}
	}
	return true
}

func ParseTile(tile string) Tile {
	m := make(map[rune]TileSet)
	m['m'] = Characters
	m['p'] = Dots
	m['s'] = Bamboo
	m['z'] = Honors
	return Tile{Set: m[rune(tile[1])], Rank: int(tile[0] - '0')}
}

func ParseHand(hand string) []Tile {
	m := make(map[rune]TileSet)
	m['m'] = Characters
	m['p'] = Dots
	m['s'] = Bamboo
	m['z'] = Honors
	tiles := make([]Tile, 0)
	ranks := make([]int, 0)
	for _, r := range hand {
		if unicode.IsSpace(r) {
			continue
		}
		if unicode.IsDigit(r) {
			ranks = append(ranks, int(r-'0'))
		}
		if _, ok := m[r]; ok {
			for _, rank := range ranks {
				tiles = append(tiles, Tile{Set: m[r], Rank: rank})
			}
			ranks = ranks[:0]
		}
	}
	return tiles
}

func SortHand(hand []Tile) {
	sort.Slice(hand, func(i, j int) bool {
		if hand[i].Set != hand[j].Set {
			return hand[i].Set < hand[j].Set
		}
		return hand[i].Rank < hand[j].Rank
	})
}

func CountTiles(hand []Tile, tile Tile) int {
	count := 0
	for _, t := range hand {
		if t == tile {
			count++
		}
	}
	return count
}

// RemoveTiles removes count number of tiles from hand
func RemoveTiles(hand []Tile, tile Tile, count int) []Tile {
	result := make([]Tile, 0)
	for _, t := range hand {
		if t == tile && count > 0 {
			count--
			continue
		}
		result = append(result, t)
	}
	return result
}
