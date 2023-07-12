import React from "react";
import { useNavigate, Link as NavLink } from "react-router-dom";
import { useSetAtom } from "jotai";

import Link from "@mui/material/Link";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import InfoIcon from "@mui/icons-material/Info";
import {
  GridActionsCellItem,
  GridColDef,
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
  offerIndex?: string;
};

export type EventTableProps = {
  rows: EventTableRow[];
  isOwner?: boolean;
  isAttendee?: boolean;
};

type GetterParamsType = GridValueGetterParams<
  EventTableRow,
  any,
  GridTreeNodeWithRender
>;

export function EventTable(props: EventTableProps) {
  const { rows, isOwner, isAttendee } = props;
  const { isActive } = useWeb3();
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
        renderCell: (params) => (
          <Link
            sx={{ textDecoration: "none" }}
            component={NavLink}
            to={`/event/${params.row.id}`}
          >
            {params.value}
          </Link>
        ),
      },
      {
        field: "dateStart",
        headerName: "Start",
        type: "date",
        width: 100,
      },
      { field: "dateEnd", headerName: "End", type: "date", width: 100 },
      ...(isAttendee
        ? [
            {
              field: "claimed",
              headerName: "Claimed",
              type: "boolean",
              width: 80,
            },
          ]
        : [
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
          ]),
      {
        field: "actions",
        type: "actions",
        width: 45,
        minWidth: 45,
        getActions: (params) => [
          <GridActionsCellItem
            icon={<GroupAddIcon />}
            label="Add Participant"
            onClick={() => handleAdd(params.row.id)}
            disabled={!(isActive && isOwner)}
            showInMenu
          />,
          <GridActionsCellItem
            icon={<EventAvailableIcon />}
            label="Join Event"
            onClick={() => handleJoin(params.row.id, params.row.title)}
            disabled={!(isActive && !isAttendee)}
            showInMenu
          />,
          <GridActionsCellItem
            icon={<FileCopyIcon />}
            label="Claim NFT"
            onClick={() => handleClaim(params.row.id)}
            disabled={!(isActive && isAttendee && !params.row.claimed)}
            showInMenu
          />,
          <GridActionsCellItem
            icon={<InfoIcon />}
            label="Show Details"
            onClick={() => navigate(`/event/${params.row.id}`)}
            showInMenu
          />,
        ],
      },
    ],
    [
      isActive,
      isOwner,
      isAttendee,
      handleAdd,
      handleClaim,
      handleJoin,
      navigate,
    ]
  );

  return <DataTable columns={columns} rows={rows} />;
}

export default EventTable;
