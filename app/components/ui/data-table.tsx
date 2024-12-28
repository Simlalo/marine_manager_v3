import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  RowSelectionState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { useState } from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageIndex: number;
  pageSize: number;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onRowSelectionChange?: (rows: TData[]) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onRowSelectionChange,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    onRowSelectionChange: (updater) => {
      let newSelection: RowSelectionState;
      if (typeof updater === 'function') {
        newSelection = updater(rowSelection);
      } else {
        newSelection = updater;
      }
      setRowSelection(newSelection);
      if (onRowSelectionChange) {
        const selectedRows = Object.keys(newSelection)
          .filter(key => newSelection[key])
          .map(key => data[parseInt(key)])
          .filter(Boolean);
        onRowSelectionChange(selectedRows);
      }
    },
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
      rowSelection,
    },
    onPaginationChange: updater => {
      if (typeof updater === 'function') {
        const newPagination = updater({ pageIndex, pageSize });
        onPageChange(newPagination.pageIndex);
        onPageSizeChange(newPagination.pageSize);
      } else {
        onPageChange(updater.pageIndex);
        onPageSizeChange(updater.pageSize);
      }
    },
  });

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Aucun résultat.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">
            Page {pageIndex + 1} sur {table.getPageCount()}
          </p>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 w-[70px] rounded-md border border-input bg-background"
          >
            {[10, 20, 30, 40, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <p className="text-sm text-muted-foreground">lignes par page</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(0)}
            disabled={!table.getCanPreviousPage()}
            className="rounded-md border border-input px-2 py-1 disabled:opacity-50"
          >
            {"<<"}
          </button>
          <button
            onClick={() => onPageChange(pageIndex - 1)}
            disabled={!table.getCanPreviousPage()}
            className="rounded-md border border-input px-2 py-1 disabled:opacity-50"
          >
            {"<"}
          </button>
          <button
            onClick={() => onPageChange(pageIndex + 1)}
            disabled={!table.getCanNextPage()}
            className="rounded-md border border-input px-2 py-1 disabled:opacity-50"
          >
            {">"}
          </button>
          <button
            onClick={() => onPageChange(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="rounded-md border border-input px-2 py-1 disabled:opacity-50"
          >
            {">>"}
          </button>
        </div>
      </div>
    </div>
  );
}
