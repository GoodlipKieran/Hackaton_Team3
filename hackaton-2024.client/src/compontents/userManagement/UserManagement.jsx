import { useEffect, useState } from "react";
import BaseLayout from "../shared/BaseLayout";
import { addUser, deleteUser, fetchAllUsers } from "./API";
import { FaTrash } from "react-icons/fa"; // Importing a trash icon

function UserManagement() {
  const [users, setAllUsers] = useState([]);
  const [showModal, setShowModal] = useState(false); // State to manage modal visibility
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "User", // Default role is User
  });

  useEffect(() => {
    handleFetchUsers();
  }, []);

  const handleFetchUsers = () => {
    fetchAllUsers().then((response) => {
      setAllUsers(response);
    });
  };

  const handleDeleteUser = (user) => {
    deleteUser(user).then((response) => {
      console.log(response);
      handleFetchUsers();
    });
  };

  const handleAddUser = () => {
    addUser(newUser).then((response) => {
      console.log(response);
      handleFetchUsers();
    });
    setShowModal(false); // Close the modal after adding the user
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <BaseLayout>
      <div className="flex w-full justify-center items-center mb-4 pt-8">
        <h1 className="text-3xl font-bold">User Management</h1>
        <div className="w-40"></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Add User
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full text-lg">
          <thead className="text-2xl">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.email}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button
                    className="btn btn-error btn-sm"
                    onClick={() => handleDeleteUser(user)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl text-black font-bold mb-4">Add New User</h2>
            <div className="mb-4">
              <label className="block mb-1 text-black">Name</label>
              <input
                type="text"
                name="name"
                value={newUser.name}
                onChange={handleInputChange}
                className="input input-bordered w-full"
                placeholder="Enter name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-black mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={newUser.email}
                onChange={handleInputChange}
                className="input input-bordered w-full"
                placeholder="Enter email"
              />
            </div>
            <div className="mb-6">
              <label className="block text-black mb-1">Role</label>
              <select
                name="role"
                value={newUser.role}
                onChange={handleInputChange}
                className="select select-bordered w-full"
              >
                <option value="Admin">Admin</option>
                <option value="User">User</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAddUser}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </BaseLayout>
  );
}

export default UserManagement;
