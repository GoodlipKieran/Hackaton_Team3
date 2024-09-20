import { userStore } from "./store";

const AdminAuthorization = ({ children }) => {
  const user = userStore((state) => state.user);
  if (user.role === "Admin") {
    return <>{children}</>;
  }

  if (user.role === "User") {
    return <p>Ma tistax tidhol, habbat bieb iehor</p>;
  }

  return <p>Loading...</p>;
};

export default AdminAuthorization;
