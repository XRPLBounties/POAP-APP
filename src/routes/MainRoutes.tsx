import React from "react";
import type { RouteObject } from "react-router-dom";

import Loadable from "components/Loadable";
import MainLayout from "layouts/MainLayout";

const AdminEventsPage = Loadable(React.lazy(() => import("pages/AdminEventsPage")));
const AdminPage = Loadable(React.lazy(() => import("pages/AdminPage")));
const AdminUsersPage = Loadable(React.lazy(() => import("pages/AdminUsersPage")));
const DebugPage = Loadable(React.lazy(() => import("pages/DebugPage")));
const ErrorPage = Loadable(React.lazy(() => import("pages/ErrorPage")));
const EventInfoPage = Loadable(React.lazy(() => import("pages/EventInfoPage")));
const HomePage = Loadable(React.lazy(() => import("pages/HomePage")));
const OrganizerPage = Loadable(React.lazy(() => import("pages/OrganizerPage")));

const MainRoutes: RouteObject = {
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
      path: "/organizer",
      element: <OrganizerPage />,
    },
    {
      path: "/admin",
      element: <AdminPage />,
    },
    {
      path: "/admin/users",
      element: <AdminUsersPage />,
    },
    {
      path: "/admin/events",
      element: <AdminEventsPage />,
    },
    {
      path: "/debug",
      element: <DebugPage />,
    },
  ],
};

export default MainRoutes;
