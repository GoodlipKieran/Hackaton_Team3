import { secureFetch } from "../../auth/SecureFetch";

export const fetchAllErds = () => {
  return secureFetch(
    "/erd/getallerds",
    "GET",
    null,
    "application/json",
    "application/json",
  ).then((response) => {
    return response.json();
  });
};

export const addErd = (erd) => {
  return secureFetch(
    "/erd/adderd",
    "POST",
    erd,
    "application/json",
    "application/json",
  ).then((response) => {
    return response.json();
  });
};

export const triggerDbErdGeneration = (formInp) => {
  return secureFetch(
    "/erd/triggerdberdgeneration",
    "POST",
    formInp,
    "application/json",
    "application/json",
  ).then((response) => {
    return response.json();
  });
};

export const triggerSaErdGeneration = (formInp) => {
  return secureFetch(
    "/erd/triggersaerdgeneration",
    "POST",
    formInp,
    "application/json",
    "application/json",
  ).then((response) => {
    return response.json();
  });
};

export const triggerGetTableDescription = (tableName) => {
  return secureFetch(
    "/erd/triggergettabledescription ",
    "POST",
    { tableName },
    "application/json",
    "application/json",
  ).then((response) => {
    return response.json();
  });
};
