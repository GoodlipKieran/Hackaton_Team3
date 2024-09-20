import { useState } from "react";
import ReactMarkdown from "react-markdown"; // Import react-markdown
import BaseLayout from "../shared/BaseLayout";
import TableRelationship from "./ErdDiagram";
import { resultStore } from "./store";
import { userStore } from "../../auth/store";
import { addErd, triggerGetTableDescription } from "../erdResults/API";
import { useNavigate } from "react-router-dom";

function ResultsPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [selectedTable, setSelectedTable] = useState(""); // To store the selected table name
  const [tableDescription, setTableDescription] = useState(""); // To store the table description
  const jsonString = resultStore((state) => state.jsonString);
  const isNew = resultStore((state) => state.isNew);
  const user = userStore((state) => state.user);
  const tableNames = resultStore((state) => state.tableNames);

  const onSubmit = () => {
    const newErd = {
      email: user.email,
      name: name,
      jsonString: jsonString,
    };

    console.log(newErd);

    addErd(newErd)
      .then(() => {
        navigate("/ViewErds");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleTableSelect = (e) => {
    const selectedTableName = e.target.value;
    setSelectedTable(selectedTableName); // Update state with the selected table
    console.log("Selected table:", selectedTableName);

    triggerGetTableDescription(selectedTableName).then((response) => {
      console.log(response);
      setTableDescription(response);
    });
  };

  return (
    <BaseLayout>
      <div className="flex w-full justify-center items-center mb-4 pt-8">
        <h1 className="text-3xl font-bold">Results page</h1>
        <div className="w-40"></div>
        {isNew && (
          <div className="flex">
            <input
              type="text"
              id="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
              className="input input-bordered mr-2"
              defaultChecked
            />
            <button className="btn btn-primary" onClick={onSubmit}>
              Submit
            </button>
          </div>
        )}
      </div>
      <div className="flex w-full justify-center">
        <div role="tablist" className="tabs tabs-bordered align-middle w-full">
          <input
            type="radio"
            name="my_tabs_1"
            role="tab"
            className="tab"
            aria-label="ERD Diagram"
            defaultChecked
          />
          <div role="tabpanel" className="tab-content p-10">
            {jsonString !== "" && (
              <TableRelationship stringJsonData={jsonString} />
            )}
          </div>

          <input
            type="radio"
            name="my_tabs_1"
            role="tab"
            className="tab"
            aria-label="Table Description"
          />
          <div role="tabpanel" className="tab-content p-10">
            <div className="flex flex-col items-start">
              <select
                className="select select-bordered select-lg w-full max-w-xs mb-4"
                onChange={handleTableSelect} // Trigger function on select change
              >
                <option disabled selected>
                  Select Table
                </option>
                {tableNames.map((tableName) => (
                  <option key={tableName}>{tableName}</option>
                ))}
              </select>

              {/* Display table description as markdown */}
              {tableDescription && (
                <div className="bg-gray-100 p-4 rounded-lg shadow-md w-full max-w-2xl">
                  <ReactMarkdown className="prose text-gray-700">
                    {tableDescription}
                  </ReactMarkdown>{" "}
                  {/* Markdown rendered */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}

export default ResultsPage;
