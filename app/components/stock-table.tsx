'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  CircularProgress,
  Box,
} from '@mui/material'
import { StockData, ColumnConfig } from '@/app/types/stock'
import { formatCellValue } from '@/app/lib/formatters'

interface StockTableProps {
  data: StockData[]
  columns: ColumnConfig[]
  page: number
  rowsPerPage: number
  loading: boolean
  onPageChange: (event: unknown, newPage: number) => void
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export function StockTable({
  data,
  columns,
  page,
  rowsPerPage,
  loading,
  onPageChange,
  onRowsPerPageChange,
}: StockTableProps) {
  const visibleColumns = columns.filter(col => col.visible).sort((a, b) => a.order - b.order)
  const displayedRows = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  if (loading && data.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <TableContainer component={Paper}>
      <Table stickyHeader>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            {visibleColumns.map(col => (
              <TableCell
                key={col.key}
                align="right"
                sx={{
                  fontWeight: 'bold',
                  backgroundColor: '#f5f5f5',
                  minWidth: 100,
                }}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {displayedRows.map((row, idx) => (
            <TableRow key={`${row.code}-${idx}`} hover>
              {visibleColumns.map(col => (
                <TableCell key={`${row.code}-${col.key}`} align="right">
                  {formatCellValue(col.key, row[col.key])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        labelRowsPerPage="每页行数:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
      />
    </TableContainer>
  )
}
