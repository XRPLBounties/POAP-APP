import React from "react";
import type { RouteObject } from "react-router-dom";

import Loadable from "components/Loadable";
import BasicLayout from "layouts/BasicLayout";

const ClaimPage = Loadable(React.lazy(() => import("pages/ClaimPage")));
const ErrorPage = Loadable(React.lazy(() => import("pages/ErrorPage")));
const EventInfoPage = Loadable(React.lazy(() => import("pages/EventInfoPage")));

const MainRoutes: RouteObject = {
  path: "/",
  element: <BasicLayout />,
  errorElement: <ErrorPage />,
  children: [
    {
      path: "/claim/:id",
      element: <ClaimPage />,
    },
    {
      path: "/eventm/:id",
      element: <EventInfoPage />,
    },
  ],
};

export default MainRoutes;
