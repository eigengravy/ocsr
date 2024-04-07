import { SetStateAction, useEffect, useState } from "react";
import { cloneDeep, range } from "lodash";
import InsitutionItem from "./components/InstitutionItem";
import AuthorList from "./components/AuthorList";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const displayNames = {
  all: "All Areas",
  systems: "Systems",
  ai: "Artificial Intelligence",
  security: "Security",
  hpc: "High Performance Computing",
  ml: "Machine Learning",
  ccs: "CCS",
  ndss: "NDSS",
  sc: "SC",
  hpdc: "HPDC",
  nips: "NIPS",
  kdd: "KDD",
  icml: "ICML",
};

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
    <ol className="list-inside">
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
          <li key={id} className="ml-5">
            <input
              type="checkbox"
              name={id}
              value={label}
              checked={checked}
              onChange={(e) => onBoxChecked(e, ancestors)}
            />
            <label htmlFor={id} className="text-lg pl-2">
              {displayNames[label]}
            </label>
            {children}
          </li>
        );
      })}
    </ol>
  );
};

function App() {
  const [toggleGroupByInstitution, setToggleGroupByInstitution] =
    useState(false);

  const [startYear, setStartYear] = useState(2020);
  const [endYear, setEndYear] = useState(2024);
  const [areas, setAreas] = useState<any>({
    all: {
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
    Object.keys(areas["all"]).forEach((area) => {
      Object.keys(areas["all"][area]).forEach((subarea) => {
        Object.keys(areas["all"][area][subarea]).forEach((conf) => {
          if (areas["all"][area][subarea][conf]) {
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
    <div className="flex flex-col p-2">
      <div className="text-5xl w-full pl-5">Open CS Rankings 🇮🇳</div>
      {!loadingData && (
        <div className="flex flex-row w-full justify-between">
          <div className="flex flex-col gap-5 w-100 pt-5 pl-5">
            <div className="flex flex-row gap-5 align-bottom">
              <Switch
                id="toggleGroupByInstitution"
                checked={toggleGroupByInstitution}
                onCheckedChange={() =>
                  setToggleGroupByInstitution(!toggleGroupByInstitution)
                }
              />
              <p>
                {toggleGroupByInstitution
                  ? "List Institutions"
                  : "List Authors"}
              </p>
            </div>

            {!toggleGroupByInstitution && (
              <div className="flex flex-row gap-3 w-full justify-between align-bottom">
                <Select
                  value={sortInstitutionsBy}
                  onValueChange={(e) => setSortInstitutionsBy(e)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="size">Count</SelectItem>
                    <SelectItem value="pubs">Pubs</SelectItem>
                    <SelectItem value="adjPubs">Adj Pubs</SelectItem>
                  </SelectContent>
                </Select>
                <p className="align-middle">Sort Authors By</p>
              </div>
            )}

            {toggleGroupByInstitution && (
              <div className="flex flex-row gap-3 w-full justify-between align-bottom">
                <Select
                  value={sortAuthorsBy}
                  onValueChange={(e) => setSortAuthorsBy(e)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={endYear} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="count">Count</SelectItem>
                    <SelectItem value="adj">Adj</SelectItem>
                  </SelectContent>
                </Select>
                <p className="align-middle">Sort Institutions By</p>
              </div>
            )}

            <div className="flex flex-row gap-3 w-full  justify-start align-bottom">
              <p>Start Year</p>
              <Select
                value={startYear.toString()}
                onValueChange={(e) => setStartYear(parseInt(e))}
                defaultValue="2014"
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={startYear} />
                </SelectTrigger>
                <SelectContent>
                  {range(1970, new Date().getFullYear() + 1).map((year) => (
                    <SelectItem value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-row gap-3 justify-start align-bottom">
              <p>End Year</p>
              <Select
                value={endYear.toString()}
                onValueChange={(e) => setStartYear(parseInt(e))}
                defaultValue="2024"
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={endYear} />
                </SelectTrigger>
                <SelectContent>
                  {range(1980, new Date().getFullYear() + 1).map((year) => (
                    <SelectItem value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="text-2xl pb-3">Domains</p>
              <NestedCheckbox data={areas} setAreas={setAreas} />
            </div>
          </div>

          <div>
            {authors && toggleGroupByInstitution && (
              <ScrollArea className="h-[85vh] w-[50vw] rounded-md border p-4">
                <AuthorList authors={authors} />
              </ScrollArea>
            )}

            {institutions && !toggleGroupByInstitution && (
              <ScrollArea className="h-[85vh] w-[50vw] rounded-md border p-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Count</TableHead>
                      <TableHead>Pubs</TableHead>
                      <TableHead>Adj Pubs</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.keys(institutions)
                      .sort(
                        (a: any, b: any) =>
                          institutions[b][sortInstitutionsBy] -
                          institutions[a][sortInstitutionsBy]
                      )
                      .map((dept, i) => (
                        <InsitutionItem
                          rank={i + 1}
                          name={dept}
                          size={institutions[dept]["size"]}
                          pubs={institutions[dept]["pubs"]}
                          adjPubs={institutions[dept]["adjPubs"]}
                          faculty={institutions[dept]["faculty"]}
                        />
                      ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </div>
        </div>
      )}

      <footer className="w-full text-sm text-gray-500 text-center dark:text-gray-400 mt-6">
        2024, Open CS Rankings
      </footer>
    </div>
  );
}

export default App;
