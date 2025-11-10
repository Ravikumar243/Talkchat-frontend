"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchContact,
  updateContactLastMessage,
} from "./Redux/slice/ContactSlice";
import { sendMessage, getMessages } from "./Redux/slice/sendMessageSlice";
import { socket } from "@/app/socket";
import "./index.css";

// ✅ Import MUI components & icons
import { IconButton, Tooltip } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Avatar from "@mui/material/Avatar";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { EmojiEmotions, Image, Send } from "@mui/icons-material";

const Page = () => {
  const [selectedContact, setSelectedContact] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { contacts } = useSelector((state) => state.contacts || []);
  const { messages } = useSelector((state) => state.messages);

  const [filteredContacts, setFilteredContacts] = useState(contacts || []);

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    if (isClient) dispatch(fetchContact());
  }, [dispatch, isClient]);

  useEffect(() => {
    if (selectedContact && user) {
      dispatch(getMessages({ user1: user.id, user2: selectedContact.id }));
    }
  }, [dispatch, selectedContact, user]);

  useEffect(() => {
    if (user?.id) socket.emit("join", user.id);
  }, [user]);

  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      if (
        (msg.sender === user?.id && msg.receiver === selectedContact?.id) ||
        (msg.sender === selectedContact?.id && msg.receiver === user?.id)
      ) {
        if (msg.sender !== user?.id) {
          dispatch({ type: "messages/appendMessage", payload: msg });
        }
      }
      dispatch(
        updateContactLastMessage({
          contactId: msg.sender,
          message: msg.message,
          time: new Date(),
        })
      );
    });
    return () => socket.off("receiveMessage");
  }, [selectedContact, user, dispatch]);

  useEffect(() => {
    const filtered = contacts.filter(
      (contact) =>
        contact?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact?.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredContacts(filtered);
  }, [searchTerm, contacts]);

  const handleSend = () => {
    if (!newMessage.trim() || !selectedContact || !user) return;

    const payload = {
      sender: user.id,
      receiver: selectedContact.id,
      message: newMessage,
    };

    socket.emit("sendMessage", payload);
    dispatch(sendMessage(payload));
    setNewMessage("");

    dispatch(
      updateContactLastMessage({
        contactId: selectedContact.id,
        message: payload.message,
        time: new Date(),
      })
    );
  };

  if (!isClient) return null;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* LEFT PANEL */}
      <div className="flex flex-col items-center border-r border-gray-300 p-4 pt-5">
        <Tooltip title="Chat">
          <IconButton
            color="primary"
            sx={{
              bgcolor: "green.200",
              "&:hover": { bgcolor: "bg-gray-500" },
              p: 2,
              borderRadius: "50%",
            }}
          >
            <ChatIcon sx={{ fontSize: 30 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Status">
          <IconButton
            color="primary"
            sx={{
              bgcolor: "green.200",
              "&:hover": { bgcolor: "green.500" },
              p: 2,
              borderRadius: "50%",
            }}
          >
            <DonutLargeIcon sx={{ fontSize: 30 }} />
          </IconButton>
        </Tooltip>
      </div>
      <div className="w-1/4 bg-white border-r border-gray-300 flex flex-col p-4 overflow-y-auto">
        <h1 className="flex items-center justify-between text-xl font-bold mb-4">
          Chat App
          <Tooltip title="Options">
            <IconButton size="small">
              <MoreVertIcon sx={{ fontSize: 30 }} />
            </IconButton>
          </Tooltip>
        </h1>
        <TextField
          variant="outlined"
          placeholder="Search contacts..."
          size="small"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              backgroundColor: "#fff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            },
            "& .MuiOutlinedInput-root.Mui-focused fieldset": {
              borderColor: "#b3b3b3", // Tailwind green-500
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "gray" }} />
              </InputAdornment>
            ),
          }}
        />
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <ul>
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => (
                <li
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer mb-2 transition ${
                    selectedContact?.id === contact.id
                      ? "bg-gray-100 border-l-3 border-b-3 border-fuchsia-500"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {/* Profile Image */}
                  <Avatar
                    alt={contact.name}
                    src={contact.image || ""}
                    sx={{
                      width: 56,
                      height: 56,
                      border: "2px solid #e5e7eb", // same as Tailwind border-gray-300
                      bgcolor: contact.image ? "transparent" : "#9e9e9e", // gray fallback
                      fontSize: "1.2rem",
                      fontWeight: "bold",
                    }}
                  >
                    {!contact.image && contact.name?.[0]?.toUpperCase()}
                  </Avatar>

                  {/* User Info */}
                  <div>
                    <p className="font-semibold text-gray-800">
                      {contact.name}
                    </p>
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {contact.lastMessage || "No messages yet"}
                    </p>
                  </div>
                </li>
              ))
            ) : (
              <p className="text-gray-500 text-center">No contacts available</p>
            )}
          </ul>
        </div>
      </div>

      <div className="flex-1 flex flex-col ">
        {selectedContact ? (
          <>
            <div className="flex items-center gap-3 p-4 bg-white border-b border-gray-300">
              <Avatar
                alt={selectedContact.name}
                src={selectedContact.image || ""}
                sx={{
                  width: 56,
                  height: 56,
                  border: "2px solid #e5e7eb",
                  bgcolor: selectedContact.image ? "transparent" : "#9e9e9e",
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                }}
              >
                {!selectedContact.image &&
                  selectedContact.name?.[0]?.toUpperCase()}
              </Avatar>

              <div className="font-semibold text-black text-lg">
                {selectedContact.name}
              </div>
            </div>
            <div
              className="flex-1 p-4 overflow-y-auto bg-gray-50 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: "url('/assets/img/chatimage.jpg')" }}
            >
              {messages?.map((msg, i) => (
                <div
                  key={i}
                  className={`mb-2 flex ${
                    msg.sender === user.id ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      msg.sender === user.id
                        ? "bg-green-500 text-white"
                        : "bg-gray-300"
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center p-3 border-t border-gray-300 bg-white">
              <button
                className="text-gray-600 hover:text-yellow-500 transition-all"
                title="Emoji"
              >
                <EmojiEmotions fontSize="medium" />
              </button>

              <label
                htmlFor="file-upload"
                className="ml-3 text-gray-600 hover:text-blue-500 cursor-pointer transition-all"
                title="Attach Image"
              >
                <Image fontSize="medium" />
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  // onChange={handleImageSelect}
                />
              </label>

              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 mx-3 p-2 pl-6 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#b3b3b3] text-gray-700"
              />

              {/* Send Icon */}
              <button
                onClick={handleSend}
                title="Send Message"
                className="w-10 h-10 flex items-center justify-center rounded-lg transition-all cursor-pointer"
                style={{
                  backgroundColor: "#165f9e",
                  color: "#fff",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#1f78c4";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#165f9e";
                  e.currentTarget.style.color = "#fff";
                }}
              >
                <Send fontSize="medium" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            👈 Select a contact to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
