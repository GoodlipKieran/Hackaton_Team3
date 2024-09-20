import { IoIosContacts } from "react-icons/io";
import { Link, useLocation } from "react-router-dom";
import { userStore } from "../../auth/store";
import { msalInstance } from "../../auth/msalInstance";

function Header() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const user = userStore((state) => state.user);

  return (
<div className="grid grid-cols-12 h-full bg-gray-800">
  <div className="col-span-2 flex items-center justify-center">
    <IoIosContacts
      size={50}
      className="text-white transition-transform duration-300 ease-in-out hover:rotate-180"
    />
  </div>

      <div className="col-span-8 flex items-center justify-center space-x-16 text-white">
        <Link
          to="/"
          className={`text-16-bold ${
            isActive("/") ? "border-b-2 border-white" : ""
          }`}
        >
          Input Form
        </Link>
        <Link
          to="/ViewErds"
          className={`text-16-bold ${
            isActive("/ViewErds") ? "border-b-2 border-white" : ""
          }`}
        >
          Erd Diagrams
        </Link>
        {user.role === "Admin" && (
          <Link
            to="/userManagement"
            className={`text-16-bold ${
              isActive("/userManagement") ? "border-b-2 border-white" : ""
            }`}
          >
            User Management
          </Link>
        )}
      </div>

      <div className="col-span-1 flex items-center justify-center text-white">
        <p>{user.email}</p>
      </div>

      <div className="col-span-1 flex items-center justify-center">
        <button
          className="text-white bg-red-600 px-4 py-2 rounded-md hover:bg-red-700"
          onClick={() => {
            msalInstance.logoutRedirect();
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Header;
