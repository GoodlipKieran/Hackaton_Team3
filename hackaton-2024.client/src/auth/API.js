import { secureFetch } from "./SecureFetch";

export const fetchUserDetails = () => {
  return secureFetch(
    "/user/getuserdetails",
    "GET",
    null,
    "application/json",
    "application/json",
  ).then((response) => {
    return response.json();
  });
};
