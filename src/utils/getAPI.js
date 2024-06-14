import classes from "../data/classes";

export const getZoneRankings = async (name, serverSlug, zoneID) => {
  const query = `{
    characterData {
      character(name: "${name}", serverSlug: "${serverSlug}", serverRegion: "KR") {
        All: zoneRankings(zoneID: ${zoneID}, difficulty: 101, metric: rdps)
        ${Object.keys(classes)
          .map(
            (e) =>
              `${e}: zoneRankings(zoneID: ${zoneID}, difficulty: 101, metric: rdps, specName: "${e}")`
          )
          .join("\n")}
      }
    }
  }`;
  const json = await (
    await fetch("https://ko.fflogs.com/api/v2/client", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
      }),
    })
  ).json();
  return json.data.characterData.character;
};
