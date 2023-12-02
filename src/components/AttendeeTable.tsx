import React from "react";

import type { GridColDef } from "@mui/x-data-grid";

import DataTable from "components/DataTable";

export type AttendanceTableRow = {
  id: number;
  index: number;
  walletAddress: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  tokenId?: string;
  claimed?: boolean;
};

export type AttendanceTableProps = {
  rows: AttendanceTableRow[];
};

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
        width: 300,
      },
      {
        field: "tokenId",
        headerName: "NFToken ID",
        type: "string",
        flex: 1,
        // width: 320,
      },
      {
        field: "claimed",
        headerName: "Claimed",
        type: "boolean",
        width: 80,
      },
    ],
    []
  );

  return <DataTable columns={columns} rows={rows} />;
}

export default AttendanceTable;
