import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { chatApi } from "../services/chatApi";
import conversationSlice from "../slice/conversationSlice"
import storage from "redux-persist/lib/storage";
import persistReducer from "redux-persist/es/persistReducer";
import persistStore from "redux-persist/es/persistStore";

const rootReducer = combineReducers({
  [chatApi.reducerPath]: chatApi.reducer,
  "conversation": conversationSlice.reducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["conversation"], // ✅ only conversation will persist
};

const persistedReducer = persistReducer(persistConfig, rootReducer);


export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // important for redux-persist
    }).concat(chatApi.middleware),
});

export const persistor = persistStore(store);
