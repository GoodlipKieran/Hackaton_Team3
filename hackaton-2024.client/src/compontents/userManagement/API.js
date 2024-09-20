import { secureFetch } from "../../auth/SecureFetch";

export const fetchAllUsers = () => {
  return secureFetch(
    "/user/getallusers",
    "GET",
    null,
    "application/json",
    "application/json",
  ).then((response) => {
    return response.json();
  });
};

export const addUser = (user) => {
  return secureFetch(
    "/user/adduser",
    "POST",
    user,
    "application/json",
    "application/json",
  ).then((response) => {
    return response.json();
  });
};

export const deleteUser = (user) => {
  return secureFetch(
    `/user/deleteuser`,
    "POST",
    user,
    "application/json",
    "application/json",
  ).then((response) => {
    return response.json();
  });
};
