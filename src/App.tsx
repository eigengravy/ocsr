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
import { arch } from "os";

const displayNames = {
  all: "All Areas",
  systems: "Systems",
  ai: "Artificial Intelligence",
  security: "Computer Security",
  hpc: "High Performance Computing",
  ml: "Machine Learning",
  cv: "Computer Vision",
  nlp: "Natural Language Processing",
  web: "The Web & Information Retrieval",
  theory: "Theory",
  arch: "Computer Architecture",
  networks: "Computer Networks",
  db: "Databases",
  eda: "Design Automation",
  embedded: "Embedded & Real-Time Systems",
  mobile: "Mobile Computing",
  measurement: "Measurement & Performance Analysis",
  os: "Operating Systems",
  proglang: "Programming Languages",
  software: "Software Engineering",
  algo: "Algorithms & Complexity",
  crypto: "Cryptography",
  logic: "Logic & Verification",
  graphics: "Computer Graphics",
  inter: "Interdisciplinary Area",
  bio: "Computational Biology & Bioinformatics",
  edu: "Computer Science Education",
  ecocomp: "Economics & Computation",
  hci: "Human-Computer Interaction",
  robotics: "Robotics",
  visualisation: "Visualization",
};

const confsByArea = {
  systems: {
    arch: ["asplos", "hpca", "isca", "micro"],
    security: ["ccs", "ndss", "oakland", "usenixsec", "pets", "tifs", "tdsc"],
    hpc: ["sc", "hpdc", "ics", "tpds", "podc"],
    db: ["vldb", "sigmod", "icde", "pods"],
    eda: ["dac", "iccad"],
    embedded: ["emsoft", "rtas", "rtss"],
    measurement: ["imc", "sigmetrics"],
    mobile: ["mobicom", "mobisys", "sensys", "tmc"],
    networks: [
      "sigcomm",
      "nsdi",
      "tcns",
      "tnsm",
      "tgc",
      "tnse",
      "infocom",
      "tsipn",
    ],
    os: ["sosp", "osdi", "eurosys", "fast", "usenixatc"],
    proglang: ["pldi", "popl", "oopsla", "icfp"],
    software: ["fse", "icse", "ase", "issta", "tse"],
  },
  ai: {
    ml: ["nips", "kdd", "icml", "iclr", "tnnls", "colt"],
    nlp: ["acl", "emnlp", "naacl"],
    web: ["www", "sigir", "icdm"],
    ai: ["aaai", "ijcai", "tai", "aamas"],
    cv: ["cvpr", "eccv", "iccv"],
  },
  inter: {
    bio: ["ismb", "recomb"],
    ecocomp: ["ec", "wine"],
    edu: ["sigcse"],
    graphics: ["siggraph", "eurographics", "siggraph-asia"],
    hci: ["chiconf", "uist", "ubicomp", "tcss", "taffc", "percom"],
    robotics: ["icra", "iros", "rss", "trob"],
    visualisation: ["vis", "vr"],
  },
  theory: {
    algo: ["focs", "soda", "stoc"],
    crypto: ["crypto", "eurocrypt"],
    logic: ["lics", "cav"],
  },
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
  const initialNodes = transform(data, null);
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

  const [startYear, setStartYear] = useState(2014);
  const [endYear, setEndYear] = useState(2024);
  const [areas, setAreas] = useState<any>({
    all: {
      ai: {
        ml: true,
        ai: true,
        cv: true,
        nlp: true,
        web: true,
      },
      systems: {
        arch: true,
        networks: true,
        security: true,
        db: true,
        eda: true,
        embedded: true,
        hpc: true,
        mobile: true,
        measurement: true,
        os: true,
        proglang: true,
        software: true,
      },
      theory: {
        algo: true,
        crypto: true,
        logic: true,
      },
      inter: {
        bio: true,
        graphics: true,
        edu: true,
        ecocomp: true,
        hci: true,
        robotics: true,
        visualisation: true,
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
        if (areas["all"][area][subarea]) {
          activeConfs.push(...confsByArea[area][subarea]);
        }
      });
    });

    setConfs(activeConfs);
  }, [areas]);

  useEffect(() => {
    console.log("Loading user data");

    (async () => {
      const affiliations = (
        await (
          await fetch(
            import.meta.env.VITE_AFFILIATIONS ||
              "https://raw.githubusercontent.com/emeryberger/CSrankings/gh-pages/csrankings.csv"
          )
        ).text()
      )
        .trim()
        .split("\n")
        .slice(1)
        .map((line) => line.split(","))
        .reduce((acc, [name, dept, homepage, scholar]) => {
          acc[name] = {
            dept,
            homepage,
            scholar,
          };
          return acc;
        }, {});

      console.log(affiliations);

      setGeneratedAuthorInfo(
        (
          await (
            await fetch(
              import.meta.env.VITE_DBLP ||
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
              homepage: affiliations[name]?.homepage,
              scholar: affiliations[name]?.scholar,
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
              homepage: author.homepage,
              scholar: author.scholar,
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
    <div className="flex flex-col pl-20 pr-20 pt-5">
      <div className="text-5xl w-full">Open CS Rankings</div>
      {!loadingData && (
        <div className="flex flex-row w-full justify-between">
          <div className="flex flex-col gap-5 w-100 pt-5 pl-5">
            <div>
              <p className="text-2xl pb-3">Domains</p>
              <NestedCheckbox data={areas} setAreas={setAreas} />
            </div>
          </div>

          <div>
            <div className="flex flex-row justify-between pb-5">
              <div className="flex flex-col gap-3">
                <div className="flex flex-row gap-3">
                  <p className="w-[80px]">Start Year</p>
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

                <div className="flex flex-row gap-3">
                  <p className="w-[80px]">End Year</p>
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
              </div>
              <div className="flex flex-col gap-3 justify-between">
                <div className="flex flex-row gap-3">
                  <p className="w-[200px]">
                    {toggleGroupByInstitution
                      ? "List Institutions"
                      : "List Authors"}
                  </p>
                  <Switch
                    id="toggleGroupByInstitution"
                    checked={toggleGroupByInstitution}
                    onCheckedChange={() =>
                      setToggleGroupByInstitution(!toggleGroupByInstitution)
                    }
                  />
                </div>
                {!toggleGroupByInstitution && (
                  <div className="flex flex-row gap-5 align-bottom">
                    <p className="align-middle w-[150px]">Sort Authors By</p>
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
                  </div>
                )}
                {toggleGroupByInstitution && (
                  <div className="flex flex-row gap-5 align-bottom">
                    <p className="align-middle w-[150px]">
                      Sort Institutions By
                    </p>
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
                  </div>
                )}
              </div>
            </div>

            {authors && toggleGroupByInstitution && (
              <ScrollArea className="h-[100vh] w-[50vw] rounded-md border p-4">
                <AuthorList authors={authors} />
              </ScrollArea>
            )}

            {institutions && !toggleGroupByInstitution && (
              <ScrollArea className="h-[100vh] w-[50vw] rounded-md border p-4">
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

      <footer className="w-full text-sm text-gray-500 text-center dark:text-gray-400 m-6">
        © {new Date().getFullYear()},{" "}
        <a className="underline" href="https://github.com/eigengravy/ocsr">
          Open CS Rankings
        </a>
        . Made with ❤️ in 🇮🇳.
      </footer>
    </div>
  );
}

export default App;
