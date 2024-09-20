import { useEffect, useState, useCallback } from "react";
import {
  MsalProvider,
  useMsal,
  AuthenticatedTemplate,
} from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import App from "../App";
import { msalInstance } from "./MsalInstance";
import { loginRequest } from "./AuthConfig";

const AuthWrapper = () => {
  const { instance, inProgress } = useMsal();
  const activeAccount = instance.getActiveAccount();

  const [isMsalInitialized, setIsMsalInitialized] = useState(false);

  useEffect(() => {
    const initializeMsal = () => {
      instance
        .initialize()
        .then(() => {
          setIsMsalInitialized(true);
        })
        .catch((e) => {
          console.error(e);
        });
    };

    initializeMsal();
  }, [instance]);

  const handleRedirect = useCallback(() => {
    if (inProgress !== InteractionStatus.None) return;

    instance
      .loginRedirect({
        ...loginRequest,
      })
      .catch((e) => {
        //TODO: handle errors gracefully
        console.error(e);
      });
  }, [instance, inProgress]);

  useEffect(() => {
    if (
      isMsalInitialized &&
      !activeAccount &&
      inProgress === InteractionStatus.None
    )
      handleRedirect();
  }, [isMsalInitialized, activeAccount, inProgress, handleRedirect]);

  return isMsalInitialized ? (
    <>
      <AuthenticatedTemplate>{activeAccount && <App />}</AuthenticatedTemplate>
    </>
  ) : (
  <p>Loading...</p>
  );
};

const CheckAuth = () => {
  return (
    <MsalProvider instance={msalInstance}>
      <AuthWrapper />
    </MsalProvider>
  );
};

export default CheckAuth;
