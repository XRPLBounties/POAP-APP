import React from "react";
import type { RouteObject } from "react-router-dom";

import Loadable from "components/Loadable";

const NotFoundPage = Loadable(React.lazy(() => import("pages/NotFoundPage")));

const DefaultRoutes: RouteObject = {
  path: "*",
  element: <NotFoundPage />,
};

export default DefaultRoutes;
