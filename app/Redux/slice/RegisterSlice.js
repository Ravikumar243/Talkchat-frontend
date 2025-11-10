import { BaseUrl } from "@/app/api/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// 🔹 Register User
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BaseUrl}/register`, {
        method: "POST",
        body: payload
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to register");

      return data; // ✅ response: { status, message }
    } catch (error) {
      return rejectWithValue(error.message || "Something went wrong");
    }
  }
);

// 🔹 Login User
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BaseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to login");

      // ✅ response structure: { status, message, data: { accessToken, userId, name } }
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Something went wrong");
    }
  }
);

// 🔹 Auth Slice
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    loading: false,
    error: null,
    message: "",
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔹 Register User
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 Login User
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;

        // ✅ Access nested data
        const { accessToken, userId, name } = action.payload.data;

        state.token = accessToken;
        state.user = { id: userId, name };
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
