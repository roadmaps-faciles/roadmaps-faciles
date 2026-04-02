"use client";

import { cn, Table as ShadcnTable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@roadmaps-faciles/ui";

export type UITableHeader = Array<{
  children: React.ReactNode;
  className?: string;
}>;

export type UITableRow = Array<{
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}>;

export type UITableProps = {
  body: UITableRow[];
  className?: string;
  header: UITableHeader;
};

// Note: UITable renders shadcn Table in both themes. DSFR-zone callers should use TableCustom directly.
export const UITable = ({ header, body, className }: UITableProps) => {
  return (
    <ShadcnTable className={className}>
      <TableHeader>
        <TableRow>
          {header.map((cell, i) => (
            <TableHead key={i} className={cell.className}>
              {cell.children}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {body.map((row, rowIdx) => (
          <TableRow key={rowIdx}>
            {row.map((cell, cellIdx) => (
              <TableCell key={cellIdx} className={cn(cell.className)} colSpan={cell.colSpan}>
                {cell.children}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </ShadcnTable>
  );
};
