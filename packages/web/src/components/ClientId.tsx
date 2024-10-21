import { cookieStorage, makePersisted } from "@solid-primitives/storage";
import { Component, createContext, createSignal, JSX, onMount, useContext } from "solid-js";
import { isServer } from "solid-js/web";

// Define the context and types
type ClientIdContextType = {
  clientId: string;
};

const ClientIdContext = createContext<ClientIdContextType>();
const COOKIE_CLIENT_ID_EXPIRES = 31536000 as const;

// Provider Component
export const ClientIdProvider: Component<{ children: JSX.Element }> = (props) => {
  // Use makePersistent to store the client_id in cookieStorage
  const [clientId, setClientId] = makePersisted(createSignal(""), {
    name: "client_id",
    storage: cookieStorage,
    storageOptions: {
      expires: new Date(Date.now() + COOKIE_CLIENT_ID_EXPIRES).toUTCString(),
    },
  });

  onMount(() => {
    if (isServer) {
      return;
    }
    if(clientId() === ""){
      setClientId(`client_${window.crypto.randomUUID()}`);
      return;
    }
  });

  return <ClientIdContext.Provider value={{ clientId: clientId() }}>{props.children}</ClientIdContext.Provider>;
};

// Hook to use the ClientId context
export const useClientId = () => {
  const context = useContext(ClientIdContext);
  if (!context) {
    throw new Error("useClientId must be used within a ClientIdProvider");
  }
  return context.clientId;
};
