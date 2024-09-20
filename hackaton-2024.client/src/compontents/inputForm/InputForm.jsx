import { useState } from "react";
import BaseLayout from "../shared/BaseLayout";
import { tempJsonData } from "../result/temp";
import { resultStore } from "../result/store";
import { useNavigate } from "react-router-dom";
import {
  triggerDbErdGeneration,
  triggerSaErdGeneration,
} from "../erdResults/API";
import { PacmanLoader } from "react-spinners";

function InputForm() {
  const navigate = useNavigate();
  const setJsonString = resultStore((state) => state.setJsonString);
  const setIsNew = resultStore((state) => state.setIsNew);

  // State for DB Input Form
  const [dbFormData, setDbFormData] = useState({
    serverName: "",
    serverPort: "",
    dbName: "",
    username: "",
    password: "",
    tableList: "",
  });

  // State for SA Input Form
  const [saFormData, setSaFormData] = useState({
    sasToken: "",
    storageAccountName: "",
    containerName: "",
    fileList: "",
  });

  const [loading, setLoading] = useState(false);

  // Handle input changes for DB Input Form
  const handleDbInputChange = (e) => {
    const { name, value } = e.target;
    setDbFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle input changes for SA Input Form
  const handleSaInputChange = (e) => {
    const { name, value } = e.target;
    setSaFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  function splitStringByComma(inputString) {
    // Split the string by commas and trim any excess whitespace
    const result = inputString.split(",").map((item) => item.trim());
    return result;
  }

  // Trigger action for DB Input Form
  const handleDbTrigger = () => {
    console.log("Triggering DB action with:", dbFormData);

    const tableList = splitStringByComma(dbFormData.tableList);

    const toSend = {
      ServerConnectionString: dbFormData.serverName,
      ServerPort: dbFormData.serverPort,
      DBName: dbFormData.dbName,
      Login: dbFormData.username,
      Password: dbFormData.password,
      TableNames: tableList,
    };

    //call to backend
    console.log(toSend);

    setLoading(true);
    triggerDbErdGeneration(toSend)
      .then((response) => {
        console.log(response);
        setJsonString(response);
        setIsNew(true);
        navigate("/ResultsPage");
      })
      .finally(() => setLoading(false));
  };

  // Trigger action for SA Input Form
  const handleSaTrigger = () => {
    console.log("Triggering SA action with:", saFormData);

    const tableList = splitStringByComma(saFormData.fileList);

    const toSend = {
      sasToken: saFormData.sasToken,
      storageAccountName: saFormData.storageAccountName,
      containerName: saFormData.containerName,
      tableNames: tableList,
    };

    //call to backend
    console.log(toSend);

    // triggerSaErdGeneration(toSend).then((response) => {
    //   console.log(response);
    // });

    setJsonString(tempJsonData);
    setIsNew(true);
    navigate("/ResultsPage");
  };

  // Clear DB Input Form
  const handleDbClear = () => {
    setDbFormData({
      serverName: "",
      serverPort: "",
      dbName: "",
      username: "",
      password: "",
      tableList: "",
    });
  };

  // Clear SA Input Form
  const handleSaClear = () => {
    setSaFormData({
      sasToken: "",
      storageAccountName: "",
      containerName: "",
      fileList: "",
    });
  };

  return (
    <BaseLayout>
      <div className="flex w-full justify-center items-center mb-4 pt-8">
        <h1 className="text-3xl font-bold">Input Form</h1>
      </div>
      {loading ? (
        <PacmanLoader color="#0fff03" size={50} speedMultiplier={12} />
      ) : (
        <div role="tablist" className="tabs tabs-bordered align-middle w-full">
          {/* DB Input Form Tab */}
          <input
            type="radio"
            name="my_tabs_1"
            role="tab"
            className="tab"
            aria-label="DB Input Form"
            defaultChecked
          />
          <div role="tabpanel" className="tab-content p-10">
            <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
              {/* Server Name */}
              <div className="mb-4">
                <label className="block mb-1 text-black">Server Name</label>
                <input
                  type="text"
                  name="serverName"
                  value={dbFormData.serverName}
                  onChange={handleDbInputChange}
                  className="input input-bordered w-full"
                  placeholder="Enter server name"
                />
              </div>

              {/* Server Port */}
              <div className="mb-4">
                <label className="block mb-1 text-black">Server Port</label>
                <input
                  type="text"
                  name="serverPort"
                  value={dbFormData.serverPort}
                  onChange={handleDbInputChange}
                  className="input input-bordered w-full"
                  placeholder="Enter server port"
                />
              </div>

              {/* DB Name */}
              <div className="mb-4">
                <label className="block mb-1 text-black">DB Name</label>
                <input
                  type="text"
                  name="dbName"
                  value={dbFormData.dbName}
                  onChange={handleDbInputChange}
                  className="input input-bordered w-full"
                  placeholder="Enter DB name"
                />
              </div>

              {/* Username */}
              <div className="mb-4">
                <label className="block mb-1 text-black">Username</label>
                <input
                  type="text"
                  name="username"
                  value={dbFormData.username}
                  onChange={handleDbInputChange}
                  className="input input-bordered w-full"
                  placeholder="Enter username"
                />
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="block mb-1 text-black">Password</label>
                <input
                  type="password"
                  name="password"
                  value={dbFormData.password}
                  onChange={handleDbInputChange}
                  className="input input-bordered w-full"
                  placeholder="Enter password"
                />
              </div>

              {/* Table List */}
              <div className="mb-6">
                <label className="block mb-1 text-black">Table List</label>
                <textarea
                  name="tableList"
                  value={dbFormData.tableList}
                  onChange={handleDbInputChange}
                  className="textarea textarea-bordered w-full"
                  placeholder="Enter table list"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-2">
                <button className="btn btn-secondary" onClick={handleDbClear}>
                  Clear
                </button>
                <button className="btn btn-primary" onClick={handleDbTrigger}>
                  Trigger
                </button>
              </div>
            </div>
          </div>

          {/* SA Input Form Tab */}
          <input
            type="radio"
            name="my_tabs_1"
            role="tab"
            className="tab"
            aria-label="SA Input Form"
          />
          <div role="tabpanel" className="tab-content p-10">
            <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
              {/* Storage Account Name */}
              <div className="mb-4">
                <label className="block mb-1 text-black">
                  Storage Account Name
                </label>
                <input
                  type="text"
                  name="storageAccountName"
                  value={saFormData.storageAccountName}
                  onChange={handleSaInputChange}
                  className="input input-bordered w-full"
                  placeholder="Enter storage account name"
                />
              </div>

              {/* Container Name */}
              <div className="mb-4">
                <label className="block mb-1 text-black">Container Name</label>
                <input
                  type="text"
                  name="containerName"
                  value={saFormData.containerName}
                  onChange={handleSaInputChange}
                  className="input input-bordered w-full"
                  placeholder="Enter container name"
                />
              </div>

              {/* SAS Token */}
              <div className="mb-4">
                <label className="block mb-1 text-black">SAS Token</label>
                <input
                  type="password"
                  name="sasToken"
                  value={saFormData.sasToken}
                  onChange={handleSaInputChange}
                  className="input input-bordered w-full"
                  placeholder="Enter SAS token"
                />
              </div>

              {/* File List */}
              <div className="mb-6">
                <label className="block mb-1 text-black">File List</label>
                <textarea
                  name="fileList"
                  value={saFormData.fileList}
                  onChange={handleSaInputChange}
                  className="textarea textarea-bordered w-full"
                  placeholder="Enter file list"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-2">
                <button className="btn btn-secondary" onClick={handleSaClear}>
                  Clear
                </button>
                <button className="btn btn-primary" onClick={handleSaTrigger}>
                  Trigger
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </BaseLayout>
  );
}

export default InputForm;
