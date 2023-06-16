import Box from "@mui/material/Box";
import {
  DataGrid,
  GridColDef,
  gridClasses,
  GridOverlay,
} from "@mui/x-data-grid";

type DataTableProps = {
  columns: GridColDef[];
  rows: any[];
};

function DataTable(props: DataTableProps) {
  const { columns, rows } = props;
  return (
    <Box sx={{ width: "100%" }}>
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
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        autoHeight
        density="compact"
        pageSizeOptions={[10, 20, 50, 100]}
        disableColumnMenu
        disableColumnSelector
        disableDensitySelector
        disableRowSelectionOnClick
        hideFooterSelectedRowCount
        slots={{
          noRowsOverlay: () => <GridOverlay>No data</GridOverlay>,
        }}
      />
    </Box>
  );
}

export default DataTable;
