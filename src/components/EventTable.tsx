import React from "react";
import { useNavigate, Link as NavLink } from "react-router-dom";
import { useSetAtom } from "jotai";
import clsx from "clsx";

import Link from "@mui/material/Link";
import BlockIcon from "@mui/icons-material/Block";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import InfoIcon from "@mui/icons-material/Info";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import {
  GridActionsCellItem,
  GridColDef,
  GridRowClassNameParams,
  GridTreeNodeWithRender,
  GridValueGetterParams,
} from "@mui/x-data-grid";

import { useWeb3 } from "connectors/context";
import { DialogIdentifier, EventStatus } from "types";
import DataTable from "components/DataTable";
import { activeDialogAtom } from "states/atoms";

export type EventTableRow = {
  id: number;
  status: EventStatus;
  title: string;
  dateStart: Date;
  dateEnd: Date;
  slotsTaken?: number;
  slotsTotal: number;
  claimed?: boolean;
  offerIndex?: string | null;
};

export type EventTableProps = {
  rows: EventTableRow[];
};

type GetterParamsType = GridValueGetterParams<
  EventTableRow,
  any,
  GridTreeNodeWithRender
>;

export function EventTable({ rows }: EventTableProps) {
  const setActiveDialog = useSetAtom(activeDialogAtom);
  const navigate = useNavigate();

  const handleAdd = React.useCallback(
    (id: number) => {
      setActiveDialog({
        type: DialogIdentifier.DIALOG_ADD,
        data: { eventId: id },
      });
    },
    [setActiveDialog]
  );

  const handleLink = React.useCallback(
    (id: number) => {
      setActiveDialog({
        type: DialogIdentifier.DIALOG_LINK,
        data: { eventId: id },
      });
    },
    [setActiveDialog]
  );

  const handleJoin = React.useCallback(
    (id: number, title: string) => {
      setActiveDialog({
        type: DialogIdentifier.DIALOG_JOIN,
        data: { eventId: id, title: title },
      });
    },
    [setActiveDialog]
  );

  const handleClaim = React.useCallback(
    (id: number) => {
      setActiveDialog({
        type: DialogIdentifier.DIALOG_CLAIM,
        data: { eventId: id },
      });
    },
    [setActiveDialog]
  );

  const handleCancel = React.useCallback(
    (id: number) => {
      setActiveDialog({
        type: DialogIdentifier.DIALOG_CANCEL,
        data: { eventId: id },
      });
    },
    [setActiveDialog]
  );

  const rowClassName = (params: GridRowClassNameParams<EventTableRow>) => {
    return clsx("data-table", {
      expired: params.row.status !== EventStatus.ACTIVE,
    });
  };

  const columns = React.useMemo<GridColDef<EventTableRow>[]>(
    () => [
      {
        field: "id",
        headerName: "ID",
        type: "number",
        width: 45,
        minWidth: 45,
      },
      {
        field: "title",
        headerName: "Title",
        type: "string",
        flex: 1,
        renderCell: (params) => {
          if (params.row.status === EventStatus.ACTIVE) {
            return (
              <Link
                sx={{ textDecoration: "none" }}
                component={NavLink}
                to={`/event/${params.row.id}`}
              >
                {params.value}
              </Link>
            );
          } else {
            return <div>{params.value}</div>;
          }
        },
      },
      {
        field: "dateStart",
        headerName: "Start",
        type: "date",
        width: 100,
      },
      {
        field: "dateEnd",
        headerName: "End",
        type: "date",
        width: 100,
      },
      {
        field: "slots",
        headerName: "Slots",
        type: "number",
        width: 60,
        valueGetter: ({ row }: GetterParamsType) => {
          if (row.slotsTaken !== undefined) {
            return `${row.slotsTaken}/${row.slotsTotal}`;
          } else {
            return row.slotsTotal;
          }
        },
      },
      {
        field: "actions",
        type: "actions",
        width: 45,
        minWidth: 45,
        getActions: (params) => {
          const active = params.row.status === EventStatus.ACTIVE;
          const cancellable = [
            EventStatus.PENDING,
            EventStatus.PAID,
            EventStatus.ACTIVE,
          ].includes(params.row.status);
          return [
            <GridActionsCellItem
              icon={<GroupAddIcon />}
              label="Add Participant"
              onClick={() => handleAdd(params.row.id)}
              disabled={!active}
              showInMenu
            />,
            <GridActionsCellItem
              icon={<QrCodeScannerIcon />}
              label="Create Link"
              onClick={() => handleLink(params.row.id)}
              disabled={!active}
              showInMenu
            />,
            <GridActionsCellItem
              icon={<EventAvailableIcon />}
              label="Join Event"
              onClick={() => handleJoin(params.row.id, params.row.title)}
              disabled={!active}
              showInMenu
            />,
            <GridActionsCellItem
              icon={<FileCopyIcon />}
              label="Claim NFT"
              onClick={() => handleClaim(params.row.id)}
              disabled={!active}
              showInMenu
            />,
            <GridActionsCellItem
              icon={<BlockIcon />}
              label="Cancel Event"
              onClick={() => handleCancel(params.row.id)}
              disabled={!cancellable}
              showInMenu
            />,
            <GridActionsCellItem
              icon={<InfoIcon />}
              label="Show Details"
              onClick={() => navigate(`/event/${params.row.id}`)}
              showInMenu
            />,
          ];
        },
      },
    ],
    [
      handleAdd,
      handleCancel,
      handleClaim,
      handleJoin,
      handleLink,
      navigate,
    ]
  );

  return (
    <DataTable
      sx={{
        "& .data-table.expired": {
          color: (theme) => theme.palette.grey[500],
        },
      }}
      columns={columns}
      rows={rows}
      rowClassName={rowClassName}
    />
  );
}

export default EventTable;
