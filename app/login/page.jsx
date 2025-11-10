"use client";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../Redux/slice/RegisterSlice";
import { useRouter } from "next/navigation";
import {
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Avatar,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
// import axios from "axios";

const LoginPage = () => {
  const router = useRouter();
  const [loginFormData, setLoginFormData] = useState({
    phoneNumber: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();

  const { user, token, loading, error } = useSelector((state) => state.auth);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(loginUser(loginFormData));

    if (
      loginUser.fulfilled.match(resultAction) &&
      resultAction.payload.status === "success"
    ) {
      // ✅ Redirect to dashboard or chat page
      router.push("/");
    } else {
      console.error("Login failed:", resultAction.payload);
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {/* Card */}
      <div className="flex w-4/5 max-w-6xl h-[80vh] bg-white shadow-xl rounded-xl overflow-hidden">
        {/* Left Side Image */}
        <div className="w-1/2 bg-green-100 flex items-center justify-center">
          <img
            src="/assets/img/girl image.jpg"
            alt="Cute girl"
            className="object-cover h-full w-full"
          />
        </div>

        {/* Right Side Form */}
        <div className="w-1/2 flex flex-col justify-center items-center p-8">
          <h1 className="text-3xl font-bold mb-6">Sign In</h1>

          <form
            className="w-full flex flex-col gap-4"
            onSubmit={handleLoginSubmit}
          >
            <TextField
              label="Phone Number"
              variant="outlined"
              name="phoneNumber"
              fullWidth
              value={loginFormData.phoneNumber}
              onChange={handleLoginChange}
            />

            <TextField
              label="Password"
              variant="outlined"
              name="password"
              fullWidth
              type={showPassword ? "text" : "password"}
              value={loginFormData.password}
              onChange={handleLoginChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              variant="contained"
              color="success"
              type="submit"
              fullWidth
              sx={{ mt: 2 }}
            >
              Login
            </Button>
          </form>

          <p className="mt-4 text-gray-500">
            Don't have an account?{" "}
            <a href="/register" className="text-green-500 font-semibold">
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
