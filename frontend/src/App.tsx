import React, { useState } from "react";
import { NameBanner } from "./components/NameBanner";
import "./App.css";

function App() {
  const [currentName, setCurrentName] = useState("");
  const catchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentName(event.target.value);
  };

  return (
    <main>
      <div className="main-wrapper">
        <p>
          Input your name{" "}
          <input value={currentName} onChange={catchChange} type="text" />
        </p>
        <NameBanner name={currentName} />
      </div>
    </main>
  );
}

export default App;
