import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { useState } from "react";

const InsitutionItem = ({ rank, name, size, pubs, adjPubs, faculty }) => {
  const [hidden, setHidden] = useState(true);
  //   onClick={() => setHidden(!hidden)}
  return (
    <Collapsible key={rank} asChild>
      <>
        <CollapsibleTrigger asChild>
          <TableRow>
            {/* <button >{hidden ? "➕" : "✖️"}</button> */}
            <TableCell>{rank}</TableCell>
            <TableCell>{name}</TableCell>
            <TableCell>{size}</TableCell>
            <TableCell>{pubs}</TableCell>
            <TableCell>{adjPubs.toFixed(1)}</TableCell>
          </TableRow>
        </CollapsibleTrigger>

        <CollapsibleContent asChild>
          <>
            <TableRow>
              <TableCell colSpan={5}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Faculty</TableHead>
                      <TableHead>Pubs</TableHead>
                      <TableHead>Adj Pubs</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faculty.map((author: any, i) => (
                      <TableRow>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{author.name}</TableCell>
                        <TableCell>{author.count}</TableCell>
                        <TableCell>{author.adj.toFixed(1)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableCell>
            </TableRow>
          </>
        </CollapsibleContent>
      </>
    </Collapsible>
  );

  return (
    <div>
      <h2>
        {rank} | {name} | Faculty Count: {size} | Pubs Count: {pubs} | Adj Pubs
        Count: {adjPubs}
      </h2>

      {!hidden && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Faculty</TableHead>
              <TableHead>Pubs</TableHead>
              <TableHead>Adj Pubs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {faculty.map((author: any) => (
              <TableRow>
                <TableCell>{author.name}</TableCell>
                <TableCell>{author.count}</TableCell>
                <TableCell>{author.adj}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default InsitutionItem;
