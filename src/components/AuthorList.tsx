import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
            <TableCell>{author.name}</TableCell>
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
