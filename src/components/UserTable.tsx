import React from "react";
import clsx from "clsx";

import { GridColDef, GridRowClassNameParams } from "@mui/x-data-grid";

import DataTable from "components/DataTable";

export type UserTableRow = {
  id: number;
  walletAddress: string;
  isOrganizer: boolean;
  eventCount?: number;
  eventActiveCount?: number;
  totalDeposit?: string;
};

export type EventTableProps = {
  rows: UserTableRow[];
};

const columns: GridColDef<UserTableRow>[] = [
  {
    field: "walletAddress",
    headerName: "Wallet Address",
    type: "string",
    width: 320,
  },
  {
    field: "eventCount",
    headerName: "# Total Events",
    type: "number",
    width: 150,
  },
  {
    field: "eventActiveCount",
    headerName: "# Active Events",
    type: "number",
    width: 150,
  },
  {
    field: "totalDeposit",
    headerName: "Total XRP Deposit",
    type: "number",
    width: 170,
  },
];

export function UserTable({ rows }: EventTableProps) {
  const rowClassName = (params: GridRowClassNameParams<UserTableRow>) => {
    return clsx("data-table", {
      isOrganizer: params.row.isOrganizer,
    });
  };

  return (
    <DataTable
      sx={
        {
          // "& .data-table.isOrganizer": {
          //   color: (theme) => theme.palette.grey[500],
          // },
        }
      }
      columns={columns}
      rows={rows}
      rowClassName={rowClassName}
    />
  );
}

export default UserTable;
