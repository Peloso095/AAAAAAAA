import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
}

export function DataTable<T extends { id: string }>({ 
  data, 
  columns, 
  onRowClick 
}: DataTableProps<T>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-xl border border-border bg-card overflow-hidden shadow-card"
    >
      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {columns.map((column) => (
                <TableHead 
                  key={column.key} 
                  className={`${column.className || ''} ${column.hideOnMobile ? 'hidden sm:table-cell' : ''} text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4`}
                >
                  <span className="font-semibold">{column.header}</span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.03 }}
                className="table-row-hover cursor-pointer border-b border-border/50 last:border-0"
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <TableCell 
                    key={column.key} 
                    className={`${column.className || ''} ${column.hideOnMobile ? 'hidden sm:table-cell' : ''} text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-4`}
                  >
                    {column.render 
                      ? column.render(item) 
                      : String((item as Record<string, unknown>)[column.key] ?? '')
                    }
                  </TableCell>
                ))}
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {data.length === 0 && (
        <div className="text-center py-8 sm:py-12 text-muted-foreground">
          <p className="text-base sm:text-lg">Nenhum registro encontrado</p>
          <p className="text-xs sm:text-sm">Tente ajustar os filtros ou adicione novos dados</p>
        </div>
      )}
    </motion.div>
  );
}
