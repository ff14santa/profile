import { useState, useEffect } from "react";
import { getZoneRankings } from "./utils/getAPI";

function App() {
  const [name, setName] = useState(""); // 캐릭터 닉네임
  const [serverSlug, setServerSlug] = useState(""); // 캐릭터 서버
  const [zoneID, setZoneID] = useState(54); // fflogs zone ID

  const [characterData, setCharacterData] = useState(); // API data
  const [specs, setSpecs] = useState(new Set()); // 클리어 직업군

  const onNameChange = (event) => setName(event.target.value);
  const onServerSlugChange = (event) => setServerSlug(event.target.value);

  const onSubmit = (event) => {
    event.preventDefault();
    if (name === "" || serverSlug === "") {
      return;
    }
    getZoneRankings(name, serverSlug, zoneID).then((r) => {
      setCharacterData(r);
    });
  };

  useEffect(() => {
    if (characterData) {
      setSpecs(new Set());
      if (characterData.All.allStars.length) {
        characterData.All.allStars.map(({ spec }) =>
          setSpecs((prev) => prev.add(spec))
        );
      }
    }
  }, [characterData]);

  return (
    <div>
      <div>
        <input type="text" placeholder="닉네임" onChange={onNameChange} />
        <label>@</label>
        <select onChange={onServerSlugChange} defaultValue="">
          <option value="" disabled>
            서버
          </option>
          <option value="moogle">모그리</option>
          <option value="chocobo">초코보</option>
          <option value="carbuncle">카벙클</option>
          <option value="tonberry">톤베리</option>
          <option value="fenrir">펜리르</option>
        </select>
        <button onClick={onSubmit}>검색</button>
      </div>
      <div>
        {specs.size
          ? ["All", ...specs].map((spec) => <button>{spec}</button>)
          : null}
      </div>
    </div>
  );
}

export default App;
