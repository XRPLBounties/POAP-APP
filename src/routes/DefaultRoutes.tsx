import React from "react";
import Loadable from "components/Loadable";

const NotFoundPage = Loadable(React.lazy(() => import("pages/NotFoundPage")));

const DefaultRoutes = {
  path: "*",
  element: <NotFoundPage />,
};

export default DefaultRoutes;
