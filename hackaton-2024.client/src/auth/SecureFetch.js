import { msalInstance } from "./MsalInstance";
import { tokenRequest } from "./AuthConfig";

export const secureFetch = async (
  url,
  method,
  data,
  contentType,
  acceptType,
  shouldHandleDefaultError = true,
) => {
  const bearerToken = await getBearerToken();

  if (!bearerToken) return;

  return new Promise((resolve, reject) => {
    fetch(
      url,
      initFetchRequest(bearerToken, method, data, contentType, acceptType),
    )
      .then((response) => {
        if (response.ok) {
          resolve(response);
        } else {
          if (shouldHandleDefaultError)
            customHandleResponseReject(response.status);
          reject(response);
        }
      })
      .catch((error) => {
        if (shouldHandleDefaultError) customHandleResponseReject();
        reject(error);
      });
  });
};

const initFetchRequest = (
  bearerToken,
  method,
  data,
  contentType,
  acceptType,
) => {
  const requestConfig = {
    mode: "cors",
    headers: initRequestHeaders(bearerToken, contentType, acceptType),
    method: method,
  };

  if (method !== "GET") requestConfig.body = initBody(contentType, data);

  return requestConfig;
};

export const getBearerToken = async () => {
  const account = msalInstance.getActiveAccount();

  if (!account) return null;

  const response = await msalInstance.acquireTokenSilent({
    ...tokenRequest,
    account: account,
  });

  return response.accessToken;
};

const initRequestHeaders = (bearerToken, contentType, acceptType) => {
  const headers = {
    Authorization: `Bearer ${bearerToken}`,
  };

  if (contentType) headers["Content-Type"] = contentType;

  if (acceptType) headers["Accept"] = acceptType;
  return headers;
};

const initBody = (contentType, data) => {
  if (contentType === "application/json") return JSON.stringify(data);

  return data;
};

const customHandleResponseReject = (responseStatus = 500) => {
  switch (responseStatus) {
    case 401:
    case 403:
      console.log("Unauthorized");
      break;
    default:
      console.log(responseStatus);
      break;
  }
};
