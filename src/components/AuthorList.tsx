import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";

const AuthorList = ({ authors }) => {
  return (
    <Table className="  ">
      <TableHeader>
        <TableRow>
          <TableHead>Rank</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Count</TableHead>
          <TableHead>Adj</TableHead>
          <TableHead>Institute</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {authors.map((author: any, i) => (
          <TableRow>
            <TableCell>{i + 1}</TableCell>
            <TableCell>
              <div className="flex flex-row gap-1">
                <p>{author.name}</p>

                <Badge variant="outline">
                  <a href={author.homepage}>🌐</a>
                </Badge>
                <Badge variant="outline">
                  <a
                    href={
                      "https://scholar.google.com/citations?user=" +
                      author.scholar
                    }
                  >
                    🎓
                  </a>
                </Badge>
              </div>
            </TableCell>
            <TableCell>{author.count}</TableCell>
            <TableCell>{author.adj.toFixed(1)}</TableCell>
            <TableCell>{author.dept}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AuthorList;
