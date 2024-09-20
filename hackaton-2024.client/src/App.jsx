import { RouterProvider } from "react-router-dom";
import { router } from "./compontents/shared/Routes";
import { useEffect } from "react";
import { fetchUserDetails } from "./auth/API";
import { userStore } from "./auth/store";

function App() {
  const setUser = userStore((state) => state.setUser);

  useEffect(() => {
    fetchUserDetails().then((response) => {
      setUser({
        email: response.email,
        role: response.role,
      });
    });
  }, []);

  return <RouterProvider router={router} />;
}

export default App;
