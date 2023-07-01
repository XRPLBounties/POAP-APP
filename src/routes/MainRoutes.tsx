import React from "react";
import { Navigate } from "react-router-dom";

import Loadable from "components/Loadable";
import MainLayout from "layouts/MainLayout";

const DebugPage = Loadable(React.lazy(() => import("pages/DebugPage")));
const ErrorPage = Loadable(React.lazy(() => import("pages/ErrorPage")));
const EventInfoPage = Loadable(React.lazy(() => import("pages/EventInfoPage")));
const EventsPage = Loadable(React.lazy(() => import("pages/EventsPage")));
const HomePage = Loadable(React.lazy(() => import("pages/HomePage")));
const OffersPage = Loadable(React.lazy(() => import("pages/OffersPage")));

const MainRoutes = {
  path: "/",
  element: <MainLayout />,
  errorElement: <ErrorPage />,
  children: [
    {
      path: "/",
      element: <HomePage />,
    },
    {
      path: "/event/:id",
      element: <EventInfoPage />,
    },
    {
      path: "/events",
      element: <EventsPage />,
    },
    {
      path: "/offers",
      element: <OffersPage />,
    },
    {
      path: "/debug",
      element: <DebugPage />,
    },
  ],
};

export default MainRoutes;
