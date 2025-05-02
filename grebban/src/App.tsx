import { useState } from "react";
import "./App.css";
import SlidingPuzzle from "./sliding";

function App() {
  const [count, setCount] = useState(0);

  const handleRandom = () => {
    console.log("count", count)
  };

  return (
    <body>
      <div >
        <SlidingPuzzle/>

      </div>
      {/*<button className="button-slumpa" onClick={handleRandom}> <p> Slumpa</p></button>*/}
    </body>
  );
}

export default App;
