import React, { useState } from 'react';

interface ReactNPuzzleProps {
  rows?: number;
  cols?: number;
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


/** For changing the dimentions of he game, to choose between the amount of rows and columns:
 * 
 * Change the values in the arguemnt of the props ({ rows = 2, cols = 3 })
 * 
 * Where you can insert the desired amount of rows and columns
 */

const ReactNPuzzle: React.FC<ReactNPuzzleProps> = ({ rows = 2, cols = 3 }) => {
  
  const [solved, setSolved] = useState<boolean>(false);
  const [tiles, setTiles] = useState<number[]>(() => {
    let list = Array.from({ length: rows * cols }, (_, i) => i + 1);
    list[rows * cols - 1] = 0;
    list = shuffle(list)
    return list;

  });
  
  // For calculating row and column
  const toRowCol = (index: number) => ({
    row: Math.floor(index / cols),
    col: index % cols,
  });

  

  //console.log("Clicked toRowCol", toRowCol(0))

  const handleClick = (index: number) => {
    const emptyIndex = tiles.indexOf(0); //searches for the empty index through the list 
    const { row: emptyRow, col: emptyColumn } = toRowCol(emptyIndex); // deconstructes the emptyIndex to the tuple format 
    const { row: row, col: col } = toRowCol(index); // Every other tile
    

    // Only move if in same row or column
    const diffRow = row - emptyRow; //calcaltes the difference from the clicked tile to the empty in the r(row)
    const diffCol = col - emptyColumn; //calculates the difference from the clicked tile to the empty in the c(com)
    if (diffRow !== 0 && diffCol !== 0) return; //if any of the constants above aren't 0 then it a diagonal nad the fuction is aborted

    const dist = Math.abs(diffRow || diffCol); //turns negative values into positive using the abs function 
    const stepRow = diffRow === 0 ? 0 : diffRow / dist;
    const stepCol = diffCol === 0 ? 0 : diffCol / dist;

    // Create new array to update
    const newTiles = [...tiles];
    let curEmpty = emptyIndex;

    // Slide intervening tiles
    for (let i = 1; i <= dist; i++) {
      const clickedIndex = (emptyRow + stepRow * i) * cols + (emptyColumn + stepCol * i);
      newTiles[curEmpty] = tiles[clickedIndex];
      curEmpty = clickedIndex;
    }
    // Final empty
    newTiles[curEmpty] = 0;

    setTiles(newTiles);

    if (CheckList(newTiles)) {
      console.log("is solved");
      setSolved(true)
    }
  };

  const handleShuffle = () => {
    setTiles(shuffle(Array.from({ length: rows * cols }, (_, i) => i)));
  };

  

  return (
    <div style={{position: "relative"}}>
      {solved && <div className='congratulations'> Grattis! </div>}
    <div
      className='wireframe-div'
      style={{
        aspectRatio: `${cols}/${rows}`, 
        gridTemplateColumns: `repeat(${cols}, 100px)`,
      }}
    >
      
      {tiles.map((tile, idx) => (
        <div
          key={idx}
          onClick={() => tile !== 0 && handleClick(idx)}
          className='tile'
          style={{
            background: tile === 0 ? 'transparent' : '#3498db',
            cursor: tile === 0 ? 'default' : 'pointer',
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

export default ReactNPuzzle;