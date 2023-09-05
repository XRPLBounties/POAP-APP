import React from "react";
import clsx from "clsx";

import {
  GridColDef,
  GridRowClassNameParams,
  GridTreeNodeWithRender,
  GridValueGetterParams,
} from "@mui/x-data-grid";

import DataTable from "components/DataTable";

export type UserTableRow = {
  id: number;
  walletAddress: string;
  isOrganizer: boolean;
  eventCount?: number;
  totalDeposit?: string;
};

export type EventTableProps = {
  rows: UserTableRow[];
};

type GetterParamsType = GridValueGetterParams<
  UserTableRow,
  any,
  GridTreeNodeWithRender
>;

export function UserTable({ rows }: EventTableProps) {
  const rowClassName = (params: GridRowClassNameParams<UserTableRow>) => {
    return clsx("data-table", {
      isOrganizer: params.row.isOrganizer,
    });
  };

  const columns = React.useMemo<GridColDef<UserTableRow>[]>(
    () => [
      {
        field: "walletAddress",
        headerName: "Wallet Address",
        type: "string",
        width: 320,
      },
      {
        field: "eventCount",
        headerName: "# Events",
        type: "number",
        width: 110,
      },
      {
        field: "totalDeposit",
        headerName: "Total XRP Deposit",
        type: "number",
        width: 170,
      },
      {
        field: "actions",
        type: "actions",
        width: 45,
        minWidth: 45,
        getActions: (params) => {
          return [];
        },
      },
    ],
    []
  );

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
