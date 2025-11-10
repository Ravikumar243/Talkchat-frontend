import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { BaseUrl } from "@/app/api/api";

// 🔹 Initial state
const initialState = {
  messages: [], // store all chat messages
  loading: false,
  error: null,
};

// 🔹 Send a message
export const sendMessage = createAsyncThunk(
  "message/sendMessage",
  async (newMessage, thunkAPI) => {
    try {
      const res = await fetch(`${BaseUrl}/sendMessages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMessage),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send message");
      return data; // return the sent message from backend
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// 🔹 Fetch all messages between two users
export const getMessages = createAsyncThunk(
  "messages/getMessages",
  async ({ user1, user2 }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BaseUrl}/getMessage?user1=${user1}&user2=${user2}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch messages");
      return data; // array of messages
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 🔹 Slice
const sendMessageSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.messages = [];
    },
     appendMessage: (state, action) => {
      state.messages.push(action.payload); // 👈 socket message add karega
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Send Message
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        // push new message to existing list so chat updates instantly
        state.messages.push(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Get Messages
      .addCase(getMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload; // replace with all fetched messages
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessages, appendMessage  } = sendMessageSlice.actions;
export default sendMessageSlice.reducer;
