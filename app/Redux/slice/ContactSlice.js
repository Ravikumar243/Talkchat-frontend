"use client";

import { BaseUrl } from "@/app/api/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

// 🔹 Initial State
const initialState = {
  contacts: [],
  loading: false,
  error: null,
};

export const fetchContact = createAsyncThunk(
  "contacts/getContacts",
  async (_, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      const res = await fetch(`${BaseUrl}/contacts`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      return data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);


const contactSlice = createSlice({
  name: "contacts",
  initialState,
  reducers: {
    updateContactLastMessage: (state, action) => {
      const { contactId, message, time } = action.payload;

      const contactIndex = state.contacts.findIndex((c) => c.id === contactId);
      if (contactIndex !== -1) {
        state.contacts[contactIndex].lastMessage = message;
        state.contacts[contactIndex].lastUpdated = time;
      }

      // Sort contacts so latest chat appears first
      state.contacts.sort(
        (a, b) => new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0)
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Fetch contacts
      .addCase(fetchContact.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContact.fulfilled, (state, action) => {
        state.loading = false;
        state.contacts = action.payload;
      })
      .addCase(fetchContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { updateContactLastMessage } = contactSlice.actions;
export default contactSlice.reducer;
