import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; 


import contactReducer from "./slice/ContactSlice";
import sendMessageReducer from "./slice/sendMessageSlice";
import authReducer from "./slice/RegisterSlice";


const rootReducer = combineReducers({
  auth: authReducer,
  contacts: contactReducer,
  messages: sendMessageReducer,
});


const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
};


const persistedReducer = persistReducer(persistConfig, rootReducer);


export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }),
});

// 🔹 Create persistor
export const persistor = persistStore(store);
