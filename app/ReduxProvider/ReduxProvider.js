"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../Redux/store"; 

export default function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      {/* PersistGate delays UI until persisted state (like auth token) is rehydrated */}
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
