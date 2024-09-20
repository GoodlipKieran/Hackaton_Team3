import { LogLevel } from "@azure/msal-browser";

export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_CLIENT_ID,
    authority: import.meta.env.VITE_AUTHORITY,
    redirectUri: import.meta.env.VITE_REDIRECT_URI,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback(logLevel, message, containsPii) {
        if (containsPii) return;
        //TODO handle errors gracefully
        if (logLevel === LogLevel.Error) console.error(message);
      },
    },
  },
};

export const loginRequest = {
  scopes: import.meta.env.VITE_LOGIN_SCOPES.split(","),
};

export const tokenRequest = {
  scopes: import.meta.env.VITE_TOKEN_SCOPES.split(","),
};
