import { useRoutes } from "react-router-dom";

import DefaultRoutes from "./DefaultRoutes";
import MainRoutes from "./MainRoutes";

export default function Routes() {
  return useRoutes([MainRoutes, DefaultRoutes]);
}
