import { Box, SxProps, Theme } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  gridClasses,
  GridOverlay,
  GridRowClassNameParams,
} from "@mui/x-data-grid";

type DataTableProps = {
  sx?: SxProps<Theme>;
  columns: GridColDef[];
  rows: any[];
  rowClassName?: (params: GridRowClassNameParams<any>) => string;
};

function DataTable(props: DataTableProps) {
  const { sx, columns, rows, rowClassName } = props;
  return (
    <Box sx={{ width: "100%", ...sx }}>
      <DataGrid
        sx={{
          [`& .${gridClasses.cell}:focus, & .${gridClasses.cell}:focus-within`]:
            {
              outline: "none",
            },
          [`& .${gridClasses.columnHeader}:focus, & .${gridClasses.columnHeader}:focus-within`]:
            {
              outline: "none",
            },
        }}
        columns={columns}
        rows={rows}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 20 },
          },
        }}
        autoHeight
        density="compact"
        pageSizeOptions={[20, 50, 100]}
        disableColumnMenu={false}
        disableColumnSelector
        disableDensitySelector
        disableRowSelectionOnClick
        hideFooterSelectedRowCount
        slots={{
          noRowsOverlay: () => <GridOverlay>No data</GridOverlay>,
        }}
        getRowClassName={rowClassName}
      />
    </Box>
  );
}

export default DataTable;
