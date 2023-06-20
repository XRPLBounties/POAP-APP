import React from "react";
import { Navigate } from "react-router-dom";

import Loadable from "components/Loadable";
import MainLayout from "layouts/MainLayout";

const ErrorPage = Loadable(React.lazy(() => import("pages/ErrorPage")));
const EventPage = Loadable(React.lazy(() => import("pages/EventPage")));
const HomePage = Loadable(React.lazy(() => import("pages/HomePage")));
// const VerifyPage = Loadable(React.lazy(() => import("pages/VerifyPage")));

const MainRoutes = {
  path: "/",
  element: <MainLayout />,
  errorElement: <ErrorPage />,
  children: [
    {
      path: "/",
      element: <HomePage />,
    },
    // {
    //   path: "/verify",
    //   element: <VerifyPage />,
    // },
    {
      path: "/event/:id",
      element: <EventPage />,
    },
  ],
};

export default MainRoutes;
