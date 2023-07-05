import React from "react";

import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import {
  GridActionsCellItem,
  GridColDef,
  GridTreeNodeWithRender,
  GridValueGetterParams,
} from "@mui/x-data-grid";

import DataTable from "components/DataTable";

export type AttendanceTableRow = {
  id: number;
  index: number;
  walletAddress: string;
  firstName?: string;
  lastName?: string;
  email?: string;
};

export type AttendanceTableProps = {
  rows: AttendanceTableRow[];
};

type GetterParamsType = GridValueGetterParams<
  AttendanceTableRow,
  any,
  GridTreeNodeWithRender
>;

export function AttendanceTable(props: AttendanceTableProps) {
  const { rows } = props;

  const columns = React.useMemo<GridColDef<AttendanceTableRow>[]>(
    () => [
      {
        field: "index",
        headerName: "#",
        type: "number",
        width: 45,
        minWidth: 45,
      },
      {
        field: "walletAddress",
        headerName: "Wallet Address",
        type: "string",
        width: 320,
      },
      {
        field: "name",
        headerName: "Name",
        type: "string",
        flex: 1,
        valueGetter: ({ row }: GetterParamsType) => {
          let name = "";
          if (row.firstName) {
            name += row.firstName;
          }
          if (row.lastName) {
            name += ` ${row.lastName}`;
          }
          return name.trim();
        },
      },
      {
        field: "actions",
        type: "actions",
        width: 50,
        getActions: (params) => [
          <GridActionsCellItem
            icon={<EmailOutlinedIcon />}
            label="Send Email"
            disabled={!params.row.email}
            onClick={() =>
              (window.location.href = `mailto:${params.row.email}`)
            }
          />,
        ],
      },
    ],
    []
  );

  return <DataTable columns={columns} rows={rows} />;
}

export default AttendanceTable;
