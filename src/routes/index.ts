import { useRoutes } from "react-router-dom";

import AdminRoutes from "./AdminRoutes";
import BasicRoutes from "./BasicRoutes";
import DefaultRoutes from "./DefaultRoutes";
import MainRoutes from "./MainRoutes";

export default function Routes() {
  return useRoutes([MainRoutes, AdminRoutes, BasicRoutes, DefaultRoutes]);
}
