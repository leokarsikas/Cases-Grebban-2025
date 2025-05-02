import React, { useState } from 'react';

interface SlidingPuzzleProps {
  size?: number;
}

function shuffle<T>(array: T[]): T[] {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function CheckList(tiles:number[]): boolean {
  for (let i =0; i < tiles.length -1; i++){
     if(tiles[i] !== i+1){
      return false;
     }
  }
  return tiles[tiles.length -1 ] === 0;
}

const SlidingPuzzle: React.FC<SlidingPuzzleProps> = ({ size = 3 }) => {
  // Initialize tiles: numbers 1..size*size-1, with 0 representing the empty slot
  const [tiles, setTiles] = useState<number[]>(() => {
    let list = Array.from({ length: size * size }, (_, i) => i + 1);
    console.log("list before shuffle", list)
    list[size * size - 1] = 0;
    console.log("list reduction", list)
    list = shuffle(list)
    console.log("after shuffle", list )
    console.log("test shuffle", shuffle([1,2,3,4,5,6,7,8,0]))
    return list;

  });
  // Helper to compute row/col from index
  const toRowCol = (index: number) => ({
    row: Math.floor(index / size),
    col: index % size,
  });

  

  //console.log("Clicked toRowCol", toRowCol(0))

  const handleClick = (index: number) => {
    const emptyIndex = tiles.indexOf(0); //searches for the empty index through the list 
    //console.log("emptyIndex", emptyIndex)
    const { row: emptyRow, col: emptyColumn } = toRowCol(emptyIndex); // deconstructes the emptyIndex to the tuple format 
    //console.log("desonstraced emptyIndex", { row: er, col: ec })
    const { row: row, col: col } = toRowCol(index);
    //console.log("clicked tile", { row: r, col: c })

    // Only move if in same row or column
    const diffRow = row - emptyRow; //calcaltes the difference from the clicked tile to the empty in the r(row)
    const diffCol = col - emptyColumn; //calculates the difference from the clicked tile to the empty in the c(com)
    if (diffRow !== 0 && diffCol !== 0) return; //if any of the constants above aren't 0 then it a diagonal nad the fuction is aborted

    const dist = Math.abs(diffRow || diffCol); //turns negative values into positive using the abs function 
    const stepR = diffRow === 0 ? 0 : diffRow / dist;
    const stepC = diffCol === 0 ? 0 : diffCol / dist;

    // Create new array to update
    const newTiles = [...tiles];
    let curEmpty = emptyIndex;

    // Slide intervening tiles
    for (let i = 1; i <= dist; i++) {
      const clickedIndex = (emptyRow + stepR * i) * size + (emptyColumn + stepC * i);
      //console.log("distance", dist)
      //console.log("clickedIndex", clickedIndex)
      newTiles[curEmpty] = tiles[clickedIndex];
      curEmpty = clickedIndex;
    }
    // Final empty
    newTiles[curEmpty] = 0;

    setTiles(newTiles);
    //console.log("setTiles", newTiles)

    if (CheckList(newTiles)) {
      console.log("is solved");
    }
  };

  const handleShuffle = () => {
    setTiles(shuffle(Array.from({ length: size * size }, (_, i) => i)));
  };

  

  return (
    <div>
  
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${size}, 100px)`,
        gridAutoRows: '100px',
        gap: '4px',
        width: 'max-content',
        margin: '40px auto',
      }}
    >
      {tiles.map((tile, idx) => (
        <div
          key={idx}
          onClick={() => tile !== 0 && handleClick(idx)}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: tile === 0 ? 'transparent' : '#3498db',
            color: 'white',
            fontSize: '1.5em',
            cursor: tile === 0 ? 'default' : 'pointer',
            userSelect: 'none',
          }}
        >
          {tile !== 0 ? tile : null}
        </div>
      ))}
    </div>
    <button
        onClick={handleShuffle}
        style={{
          margin: '20px',
          padding: '10px 20px',
          fontSize: '1rem',
          cursor: 'pointer'
        }}
      >
        Shuffle
      </button>
    </div>
  );
};

export default SlidingPuzzle;