"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  getSortedRowModel,
  getPaginationRowModel,
  Row,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2 } from "lucide-react";
import { useConfirm } from "@/providers/confirm-provider";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  simplePagination?: boolean;
  simpleSearch?: boolean;
  searchKey?: string;
  className?: string;
  getRowId?: (originalRow: TData, index: number, parent?: Row<TData>) => string;
  onDelete?: (rows: Row<TData>[]) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  simplePagination = false,
  simpleSearch = false,
  searchKey,
  className,
  getRowId,
  onDelete,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const { confirm, setPending } = useConfirm();

  const [rowSelection, setRowSelection] = React.useState({});

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const showSimpleSearch = simpleSearch && searchKey;
  const showBulkDelete = onDelete && selectedRows.length > 0;
  const showToolbar = showSimpleSearch || showBulkDelete;

  return (
    <>
      {showToolbar && (
        <div
          className={cn(
            "flex items-center justify-between py-4 min-h-18",
            className,
          )}>
          {showSimpleSearch && (
            <div className="relative">
              <Search className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Procurar..."
                value={
                  (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn(searchKey)?.setFilterValue(event.target.value)
                }
                className="pl-8 pr-8 w-64 md:w-80"
              />
            </div>
          )}

          {showBulkDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                const confirmed = await confirm(
                  "Tem certeza que deseja deletar os itens selecionados?",
                  "Esta ação não pode ser desfeita.",
                );

                if (confirmed) {
                  setPending(true);
                  onDelete(selectedRows);
                  table.resetRowSelection();
                }
              }}
              className="ml-auto">
              <Trash2 className="size-4 mr-2" />
              Excluir {selectedRows.length}{" "}
              {selectedRows.length === 1 ? "item" : "itens"}
            </Button>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-md border">
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
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <Spinner />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center">
                  Sem resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {onDelete && (
        <div className="text-muted-foreground flex-1 text-sm mt-2">
          {selectedRows.length} de {table.getFilteredRowModel().rows.length}{" "}
          linha(s) selecionadas.
        </div>
      )}
      {simplePagination && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}>
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}>
            Próxima
          </Button>
        </div>
      )}
    </>
  );
}
