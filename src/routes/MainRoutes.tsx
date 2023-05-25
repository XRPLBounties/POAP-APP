import React from "react";
import { Navigate } from "react-router-dom";

import Loadable from "components/Loadable";
import MainLayout from "layouts/MainLayout";

// const ClaimPage = Loadable(React.lazy(() => import("pages/ClaimPage")));
const ErrorPage = Loadable(React.lazy(() => import("pages/ErrorPage")));
const HomePage = Loadable(React.lazy(() => import("pages/HomePage")));
// const OverviewPage = Loadable(React.lazy(() => import("pages/OverviewPage")));
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
    //   path: "/claim",
    //   element: <ClaimPage />,
    // },
    // {
    //     path: "/verify",
    //     element: <VerifyPage />,
    // },
    // {
    //     path: "/overview",
    //     element: <OverviewPage />,
    // },
  ],
};

export default MainRoutes;
