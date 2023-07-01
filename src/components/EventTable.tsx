import React from "react";
import { useNavigate } from "react-router-dom";
import { useSetAtom } from "jotai";

import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import InfoIcon from "@mui/icons-material/Info";
import { GridActionsCellItem, GridColDef } from "@mui/x-data-grid";

import { useWeb3 } from "connectors/context";
import { DialogIdentifier } from "types";
import DataTable from "components/DataTable";
import { activeDialogAtom } from "states/atoms";

export type EventTableRow = {
  id: number;
  title: string;
  address: string;
  count: number;
};

export type EventTableProps = {
  rows: EventTableRow[];
  isOwner?: boolean;
  isAttendee?: boolean;
};

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
      { field: "title", headerName: "Title", type: "string", flex: 1 },
      {
        field: "address",
        headerName: "Owner Address",
        type: "string",
        width: 180,
      },
      { field: "count", headerName: "Slots", type: "number", width: 60 },
      {
        field: "actions",
        type: "actions",
        width: 45,
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
            disabled={!isActive}
            showInMenu
          />,
          <GridActionsCellItem
            icon={<FileCopyIcon />}
            label="Claim NFT"
            onClick={() => handleClaim(params.row.id)}
            disabled={!(isActive && isAttendee)}
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
