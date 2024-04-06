import { SetStateAction, useEffect, useState } from "react";
import { cloneDeep } from "lodash";

const transform = (data, parent) => {
  return Object.keys(data).map((key) => {
    const value = data[key];
    const node = {
      label: key,
      checked: false,
      childrenNodes: [],
      parent: parent,
    };

    if (typeof value === "boolean") {
      node.checked = value;
    } else {
      const children = transform(value, node);
      node.childrenNodes = children;
      if (children.every((node) => node.checked)) {
        node.checked = true;
      }
    }

    return node;
  });
};

const reverseTransform = (nodes) => {
  return nodes.reduce((acc, node) => {
    if (node.childrenNodes.length === 0) {
      acc[node.label] = node.checked;
    } else {
      acc[node.label] = reverseTransform(node.childrenNodes);
    }
    return acc;
  }, {});
};

const updateAncestors = (node) => {
  if (!node.parent) {
    return;
  }

  const parent = node.parent;
  if (parent.checked && !node.checked) {
    parent.checked = false;
    updateAncestors(parent);
    return;
  }

  if (!parent.checked && node.checked) {
    if (parent.childrenNodes.every((node) => node.checked)) {
      parent.checked = true;
      updateAncestors(parent);
      return;
    }
  }

  return;
};

const toggleDescendants = (node) => {
  const checked = node.checked;

  node.childrenNodes.forEach((node) => {
    node.checked = checked;
    toggleDescendants(node);
  });
};

const findNode = (nodes, label, ancestors) => {
  let node = undefined;
  if (ancestors.length === 0) {
    return nodes.filter((node) => node.label === label)[0];
  }

  for (let ancestor of ancestors) {
    const candidates = node ? node.childrenNodes : nodes;
    node = candidates.filter((node) => node.label === ancestor)[0];
  }
  return node?.childrenNodes.filter((node) => node.label === label)[0];
};

const NestedCheckbox = ({ data, setAreas }) => {
  const initialNodes = transform(data);
  const [nodes, setNodes] = useState(initialNodes);

  useEffect(() => {
    setAreas(reverseTransform(nodes));
  }, [nodes]);

  const handleBoxChecked = (e, ancestors) => {
    const checked = e.currentTarget.checked;
    const node = findNode(nodes, e.currentTarget.value, ancestors);

    node.checked = checked;
    toggleDescendants(node);
    updateAncestors(node);

    setNodes(cloneDeep(nodes));
  };

  return (
    <NestedCheckboxHelper
      nodes={nodes}
      ancestors={[]}
      onBoxChecked={handleBoxChecked}
    />
  );
};

const NestedCheckboxHelper = ({ nodes, ancestors, onBoxChecked }) => {
  const prefix = ancestors.join(".");
  return (
    <ul>
      {nodes.map(({ label, checked, childrenNodes }) => {
        const id = `${prefix}.${label}`;
        let children = null;
        if (childrenNodes.length > 0) {
          children = (
            <NestedCheckboxHelper
              nodes={childrenNodes}
              ancestors={[...ancestors, label]}
              onBoxChecked={onBoxChecked}
            />
          );
        }

        return (
          <li key={id}>
            <input
              type="checkbox"
              name={id}
              value={label}
              checked={checked}
              onChange={(e) => onBoxChecked(e, ancestors)}
            />
            <label htmlFor={id}>{label}</label>
            {children}
          </li>
        );
      })}
    </ul>
  );
};

function App() {
  const [toggleGroupByInstitution, setToggleGroupByInstitution] =
    useState(false);

  const [startYear, setStartYear] = useState(2020);
  const [endYear, setEndYear] = useState(2024);
  const [areas, setAreas] = useState<any>({
    systems: {
      security: {
        ccs: false,
        ndss: false,
      },
      hpc: {
        sc: false,
        hpdc: true,
      },
    },
    ai: {
      ml: {
        nips: false,
        kdd: false,
        icml: false,
      },
    },
  });
  const [confs, setConfs] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [generatedAuthorInfo, setGeneratedAuthorInfo] = useState<any[]>([]);

  const [authors, setAuthors] = useState<any>([]);
  const [institutions, setInstitutions] = useState<any>([]);

  const [sortAuthorsBy, setSortAuthorsBy] = useState("adj");
  const [sortInstitutionsBy, setSortInstitutionsBy] = useState("adjPubs");

  useEffect(() => {
    let activeConfs: SetStateAction<any[]> = [];
    Object.keys(areas).forEach((area) => {
      Object.keys(areas[area]).forEach((subarea) => {
        Object.keys(areas[area][subarea]).forEach((conf) => {
          if (areas[area][subarea][conf]) {
            activeConfs.push(conf);
          }
        });
      });
    });
    setConfs(activeConfs);
  }, [areas]);

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

      setGeneratedAuthorInfo(
        (
          await (
            await fetch(
              "https://raw.githubusercontent.com/emeryberger/CSrankings/gh-pages/generated-author-info.csv"
            )
          ).text()
        )
          .trim()
          .split("\n")
          .slice(1)
          .map((line) => {
            let [name, dept, conf, count, adj, year] = line.split(",");
            return {
              name,
              dept,
              conf,
              count: parseInt(count),
              adj: parseFloat(adj),
              year: parseInt(year),
            };
          })
      );

      // const authorInfo: any = {};

      // generatedAuthorInfo.forEach((line) => {
      //   let [name, dept, area, count, adjcount, year] = line.split(",");
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
      //   if (!authorInfo[dept]) {
      //     authorInfo[dept] = [];
      //   }

      //   authorInfo[dept].push({
      //     name,
      //     area,
      //     count,
      //     adjcount,
      //     year,
      //   });
      // });
    })();
  }, []);

  useEffect(() => {
    if (generatedAuthorInfo && generatedAuthorInfo.length > 0) {
      const processedAuthors: any = {};

      generatedAuthorInfo
        .filter(
          (author: any) =>
            author.year >= startYear &&
            author.year <= endYear &&
            confs.includes(author.conf)
        )
        .forEach((author: any) => {
          if (!processedAuthors[author.name]) {
            processedAuthors[author.name] = {
              name: author.name,
              dept: author.dept,
              count: 0,
              adj: 0,
            };
          }
          processedAuthors[author.name].count += author.count;
          processedAuthors[author.name].adj += author.adj;
        });

      const processedInstitutions: any = {};

      Object.values(processedAuthors).forEach((author: any) => {
        if (!processedInstitutions[author.dept]) {
          processedInstitutions[author.dept] = {
            faculty: [],
            size: 0,
            pubs: 0,
            adjPubs: 0,
          };
        }
        processedInstitutions[author.dept]["faculty"].push(author);
        processedInstitutions[author.dept]["pubs"] += author.count;
        processedInstitutions[author.dept]["adjPubs"] += author.adj;
        processedInstitutions[author.dept]["size"] += 1;
      });

      Object.keys(processedInstitutions).forEach((dept) => {
        processedInstitutions[dept]["faculty"].sort(
          (a: any, b: any) => b[sortAuthorsBy] - a[sortAuthorsBy]
        );
      });

      setAuthors(
        Object.values(processedAuthors).sort(
          (a: any, b: any) => b[sortAuthorsBy] - a[sortAuthorsBy]
        )
      );
      setInstitutions(processedInstitutions);

      setLoadingData(false);
    }
  }, [generatedAuthorInfo, startYear, endYear, confs]);

  return (
    <>
      <h1>Open CS Rankings 🇮🇳</h1>
      {loadingData ? (
        <p>Loading data...</p>
      ) : (
        <div>
          <p>Loaded data! {authors.length}</p>

          <NestedCheckbox data={areas} setAreas={setAreas} />

          <button
            onClick={() =>
              setToggleGroupByInstitution(!toggleGroupByInstitution)
            }
          >
            Toggle Group By Insitutions
          </button>

          <input
            type="number"
            value={startYear}
            onChange={(e) => setStartYear(parseInt(e.target.value))}
          />

          <input
            type="number"
            value={endYear}
            onChange={(e) => setEndYear(parseInt(e.target.value))}
          />

          <select
            value={sortInstitutionsBy}
            onChange={(e) => setSortInstitutionsBy(e.target.value)}
          >
            <option value="size">Size</option>
            <option value="pubs">Pubs</option>
            <option value="adjPubs">Adj Pubs</option>
          </select>

          <select
            value={sortAuthorsBy}
            onChange={(e) => setSortAuthorsBy(e.target.value)}
          >
            <option value="count">Count</option>
            <option value="adj">Adj</option>
          </select>

          {/* {generatedAuthorInfo &&
            Object.keys(generatedAuthorInfo).map((dept) => (
              <div key={dept}>
                <h2>{dept}</h2>
                {generatedAuthorInfo[dept].map((author: any) => (
                  <p>
                    {author.name} | {author.conf} | {author.count} |{" "}
                    {author.adjcount} | {author.year}
                  </p>
                ))}
              </div>
            ))} */}

          {authors &&
            toggleGroupByInstitution &&
            authors.map((author: any, i) => {
              return (
                <p>
                  #{i + 1} | {author.name} | {author.count} | {author.adj} |{" "}
                  {author.dept}
                </p>
              );
            })}

          {institutions &&
            !toggleGroupByInstitution &&
            Object.keys(institutions)
              .sort(
                (a: any, b: any) =>
                  institutions[b][sortInstitutionsBy] -
                  institutions[a][sortInstitutionsBy]
              )
              .map((dept, i) => {
                return (
                  <div>
                    <h2>
                      #{i + 1} | {dept} | Faculty Count:{" "}
                      {institutions[dept]["size"]} | Pubs Count:{" "}
                      {institutions[dept]["pubs"]} | Adj Pubs Count:{" "}
                      {institutions[dept]["adjPubs"]}
                    </h2>
                    {institutions[dept]["faculty"].map((author: any) => (
                      <p>
                        {author.name} | {author.count}
                      </p>
                    ))}
                  </div>
                );
              })}
        </div>
      )}
    </>
  );
}

export default App;
