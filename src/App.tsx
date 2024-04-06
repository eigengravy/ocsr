import { useEffect, useState } from "react";

function App() {
  const [toggleGroupByInstitution, setToggleGroupByInstitution] =
    useState(false);

  const [loadingData, setLoadingData] = useState(true);

  const [authorInfo, setAuthorInfo] = useState<any[]>([]);
  useEffect(() => {
    console.log("Loading user data");

    (async () => {
      // const dblpAliases = (
      //   await (
      //     await fetch(
      //       "https://raw.githubusercontent.com/emeryberger/CSrankings/gh-pages/dblp-aliases.csv"
      //     )
      //   ).text()
      // )
      //   .trim()
      //   .split("\n")
      //   .slice(1);

      // const dblpAliasesMap = new Map<string, string>(
      //   dblpAliases.map((line) => [line.split(",")[0], line.split(",")[1]])
      // );

      // console.log(dblpAliasesMap);

      const generatedAuthorInfo = (
        await (
          await fetch(
            "https://raw.githubusercontent.com/emeryberger/CSrankings/gh-pages/generated-author-info.csv"
          )
        ).text()
      )
        .trim()
        .split("\n")
        .slice(1);

      const authorInfo: any = {};

      generatedAuthorInfo.forEach((line) => {
        let [name, dept, area, count, adjcount, year] = line.split(",");
        // name = dblpAliasesMap.get(name) || name;

        // if (dblpAliasesMap.get(name)) {
        //   console.log("Found alias");
        //   console.log(name, dept, count, adjcount, year);
        //   console.log(
        //     authorInfo[dept].find(
        //       (author: any) => author.name === dblpAliasesMap.get(name)
        //     )
        //   );
        // }
        if (!authorInfo[dept]) {
          authorInfo[dept] = [];
        }

        authorInfo[dept].push({
          name,
          area,
          count,
          adjcount,
          year,
        });
      });

      console.log(authorInfo);
      setAuthorInfo(authorInfo);

      setLoadingData(false);
    })();
  }, []);
  return (
    <>
      <h1>Open CS Rankings</h1>
      {loadingData ? (
        <p>Loading data...</p>
      ) : (
        <div>
          <p>Loaded data!</p>
          <button
            onClick={() =>
              setToggleGroupByInstitution(!toggleGroupByInstitution)
            }
          >
            Toggle Group By Insitutions
          </button>

          {authorInfo &&
            Object.keys(authorInfo).map((dept) => (
              <div key={dept}>
                <h2>{dept}</h2>
                {authorInfo[dept].map((author: any) => (
                  <p>
                    {author.name} | {author.area} | {author.count} |{" "}
                    {author.adjcount} | {author.year}
                  </p>
                ))}
              </div>
            ))}
        </div>
      )}
    </>
  );
}

export default App;
