import { useState } from "react";

function App() {
  const [username, setUsername] = useState("");
  const [server, setServer] = useState("");
  const [specs, setSpecs] = useState(new Set());

  const onUsernameChange = (event) => setUsername(event.target.value);
  const onServerChange = (event) => setServer(event.target.value);

  const getSpecs = async () => {
    const json = await (
      await fetch("https://ko.fflogs.com/api/v2/client", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `{
              characterData {
                  character(name: "${username}", serverSlug: "${server}", serverRegion: "KR") {
                      en88: encounterRankings(encounterID: 88, difficulty: 101, metric: rdps)
                      en89: encounterRankings(encounterID: 89, difficulty: 101, metric: rdps)
                      en90: encounterRankings(encounterID: 90, difficulty: 101, metric: rdps)
                      en91: encounterRankings(encounterID: 91, difficulty: 101, metric: rdps)
                      en92: encounterRankings(encounterID: 92, difficulty: 101, metric: rdps)
                  }
              }
          }`,
        }),
      })
    ).json();
    setSpecs(new Set());
    console.log(json.data.characterData.character);
  };

  const onSubmit = (event) => {
    event.preventDefault();
    if (username === "" || server === "") {
      return;
    }
    getSpecs();
  };

  return (
    <div>
      <div>
        <input type="text" placeholder="닉네임" onChange={onUsernameChange} />
        <label>@</label>
        <select onChange={onServerChange} defaultValue="">
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
        {[...specs].map((spec) => (
          <button>{spec}</button>
        ))}
      </div>
    </div>
  );
}

export default App;
