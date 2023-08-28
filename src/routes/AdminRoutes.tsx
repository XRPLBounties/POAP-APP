import React from "react";
import { Navigate, type RouteObject } from "react-router-dom";

import Loadable from "components/Loadable";
import AdminLayout from "layouts/AdminLayout";

const AdminEventsPage = Loadable(React.lazy(() => import("pages/AdminEventsPage")));
const AdminUsersPage = Loadable(React.lazy(() => import("pages/AdminUsersPage")));
const AdminStatsPage = Loadable(React.lazy(() => import("pages/AdminStatsPage")));
const ErrorPage = Loadable(React.lazy(() => import("pages/ErrorPage")));

const AdminRoutes: RouteObject = {
  path: "/",
  element: <AdminLayout />,
  errorElement: <ErrorPage />,
  children: [
    {
      path: "/admin",
      element: <Navigate to="/admin/stats" />,
    },
    {
      path: "/admin/stats",
      element: <AdminStatsPage />,
    },
    {
      path: "/admin/users",
      element: <AdminUsersPage />,
    },
    {
      path: "/admin/events",
      element: <AdminEventsPage />,
    },
  ],
};

export default AdminRoutes;
