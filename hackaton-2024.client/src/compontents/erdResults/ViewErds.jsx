import { useEffect, useState } from "react";
import BaseLayout from "../shared/BaseLayout";
import { fetchAllErds } from "./API";
import { FaEye } from "react-icons/fa";
import { resultStore } from "../result/store";
import { useNavigate } from "react-router-dom";

function ViewErds() {
  const navigate = useNavigate();
  const [erdResults, setErdResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // New state for search query
  const setJsonString = resultStore((state) => state.setJsonString);
  const setIsNew = resultStore((state) => state.setIsNew);

  useEffect(() => {
    fetchAllErds().then((response) => {
      setErdResults(response);
    });
  }, []);

  const handleViewErd = (erd) => {
    setJsonString(erd.jsonString);
    setIsNew(false);
    navigate("/ResultsPage");
  };

  // Filter the results based on the search query
  const filteredErdResults = erdResults.filter((erd) =>
    erd.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <BaseLayout>
      <div className="flex w-full justify-center items-center mb-4 pt-8">
        <h1 className="text-3xl font-bold">View Erds</h1>
      </div>

      {/* Search input field */}
      <div className="flex w-full justify-center items-center mb-4">
        <input
          type="text"
          placeholder="Search by name"
          className="input input-bordered w-full max-w-xs"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Update search query
        />
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full text-lg">
          <thead className="text-2xl">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredErdResults.map((erd) => (
              <tr key={erd.email}>
                <td>{erd.name}</td>
                <td>{erd.email}</td>
                <td>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleViewErd(erd)}
                  >
                    <FaEye />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </BaseLayout>
  );
}

export default ViewErds;
