import { useState } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  const handleRandom = () => {};

  return (
    <body>
      <div className="wireframe-div">
        <div className="card"></div>

      </div>
      <button className="button-slumpa" onClick={handleRandom}> <p> Slumpa</p></button>
    </body>
  );
}

export default App;
