import { createBrowserRouter } from "react-router-dom";
import UserManagement from "../userManagement/UserManagement";
import InputForm from "../inputForm/InputForm";
import AdminAuthorization from "../../auth/AdminAuthorization";
import ResultsPage from "../result/ResultsPage";
import ViewErds from "../erdResults/ViewErds";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <InputForm />,
  },
  {
    path: "/ResultsPage",
    element: <ResultsPage />,
  },
  {
    path: "/ViewErds",
    element: <ViewErds />,
  },
  {
    path: "/UserManagement",
    element: (
      <AdminAuthorization>
        {" "}
        <UserManagement />{" "}
      </AdminAuthorization>
    ),
  },
]);
