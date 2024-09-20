import { useEffect, useRef, useMemo } from "react";
import RelationGraph from "relation-graph-react";
import "./tableRelationship.scss";
import { resultStore } from "./store";

const TableRelationship = ({ stringJsonData }) => {
  const setTableNames = resultStore((state) => state.setTableNames);
  const graphRef = useRef(null);

  const jsonData = useMemo(() => {
    console.log("stringJsonData:", stringJsonData);
    let result = {};
    try {
      result = JSON.parse(JSON.parse(stringJsonData));
    } catch  {
      result = JSON.parse(stringJsonData);
    }
    console.log(result);
    return result;
  }, [stringJsonData]);
  const graphOptions = {
    debug: false,
    allowSwitchLineShape: true,
    allowSwitchJunctionPoint: true,
    allowShowDownloadButton: true,
    defaultJunctionPoint: "border",
    placeOtherNodes: false,
    placeSingleNode: false,
    graphOffset_x: -200,
    graphOffset_y: 100,
    defaultNodeColor: "#f39930",
    defaultLineMarker: {
      markerWidth: 20,
      markerHeight: 20,
      refX: 3,
      refY: 3,
      data: "M 0 0, V 6, L 4 3, Z",
    },
    layout: {
      layoutName: "fixed",
    },
  };
  const tables = useMemo(() => {
    const spacing = 500; // Adjust this value for more or less space between nodes
    var tempTables = jsonData.tables.map((table, index) => {
      const row = Math.floor(index / 3); // Change the divisor for the number of columns
      const col = index % 3; // Change the modulus for the number of columns
      return {
        tableName: table.tableName,
        tableComents: table.tableComments,
        x: col * spacing,
        y: row * spacing,
      };
    });
    console.log(tempTables);
    setTableNames(tempTables.map((table) => table.tableName));
    return tempTables;
  }, [jsonData.tables]);

  const tableCols = useMemo(() => {
    return jsonData.tableCols.map((column) => ({
      tableName: column.tableName,
      columnName: column.columnName,
      dataType: column.dataType,
    }));
  }, [jsonData.tableCols]);

  const columnRelations = useMemo(() => {
    return jsonData.columnRelations.map((relation) => ({
      sourceTableName: relation.sourceTableName,
      sourceColumnName: relation.sourceColumnName,
      targetTableName: relation.targetTableName,
      targetColumnName: relation.targetColumnName,
      type: relation.type,
    }));
  }, [jsonData.columnRelations]);

  const graphJsonData = useMemo(() => {
    const graphNodes = tables.map((table) => {
      const { tableName, tableComents, x, y } = table;
      return {
        id: tableName,
        text: tableComents,
        x,
        y,
        nodeShape: 1,
        data: {
          columns: tableCols.filter((col) => col.tableName === table.tableName),
        },
      };
    });

    const graphLines = columnRelations.map((relation) => ({
      from: relation.sourceTableName + "-" + relation.sourceColumnName,
      to: relation.targetTableName + "-" + relation.targetColumnName,
      color:
        relation.type === "ONE_TO_ONE"
          ? "rgba(29,169,245,0.76)"
          : "rgba(159,23,227,0.65)",
      text: "",
      fromJunctionPoint: "left",
      toJunctionPoint: "lr",
      lineShape: 6,
      lineWidth: 3,
    }));

    return {
      nodes: graphNodes,
      lines: [],
      elementLines: graphLines,
    };
  }, [tables, tableCols, columnRelations]);

  useEffect(() => {
    const showGraph = async () => {
      const graphInstance = graphRef.current?.getInstance();
      if (graphInstance) {
        await graphInstance.setJsonData(graphJsonData);
        await graphInstance.moveToCenter();
        await graphInstance.zoomToFit();
      }
    };

    showGraph();
  }, [graphJsonData]);

  const onNodeClick = (nodeObject, $event) => {
    console.log("onNodeClick:", nodeObject);
  };

  const onLineClick = (lineObject, linkObject, $event) => {
    console.log("onLineClick:", lineObject);
  };

  const NodeSlot = ({ node }) => {
    return (
      <div style={{ width: "300px", backgroundColor: "#f39930" }}>
        <div>
          {node.id} - {node.data.columns.length} Cols
        </div>
        <table className="c-data-table">
          <thead>
            <tr>
              <th>Column Name</th>
              <th>Data Type</th>
            </tr>
          </thead>
          <tbody>
            {node.data.columns.map((column) => (
              <tr key={column.columnName}>
                <td>
                  <div id={`${node.id}-${column.columnName}`}>
                    {column.columnName}
                  </div>
                </td>
                <td>{column.dataType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <div className="my-graph" style={{ height: "70vh" }}>
        <div
          style={{
            zIndex: 300,
            position: "absolute",
            left: "10px",
            top: "calc(100% - 50px)",
            fontSize: "12px",
            backgroundColor: "#ffffff",
            border: "#efefef solid 1px",
            borderRadius: "10px",
            width: "260px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Legend：
          <div>
            More to one
            <div
              style={{
                height: "5px",
                width: "80px",
                backgroundColor: "rgba(159,23,227,0.65)",
              }}
            ></div>
          </div>
          <div style={{ marginLeft: "10px" }}>
            One to one
            <div
              style={{
                height: "5px",
                width: "80px",
                backgroundColor: "rgba(29,169,245,0.76)",
              }}
            ></div>
          </div>
        </div>
        <RelationGraph
          ref={graphRef}
          options={graphOptions}
          onNodeClick={onNodeClick}
          onLineClick={onLineClick}
          nodeSlot={NodeSlot}
        ></RelationGraph>
      </div>
    </div>
  );
};

export default TableRelationship;
