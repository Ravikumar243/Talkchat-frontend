"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../Redux/slice/RegisterSlice";
import { useRouter } from "next/navigation";
import { TextField, Button, IconButton, Avatar } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
// import girlImage from "../../public/assets/img/girl image.jpg"

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    password: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const dispatch = useDispatch();

  const { message, loading, error } = useSelector((state) => state.auth);

  const handleFormDataChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

    const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("phoneNumber", formData.phoneNumber);
    formDataToSend.append("password", formData.password);

    if (imageFile) {
      formDataToSend.append("image", imageFile);
    }

    dispatch(registerUser(formDataToSend));
  };

  useEffect(() => {
    if (message === "User registered successfully") {
      router.push("/login");
    }
  }, [message, router]);

  return (
   <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {/* Card */}
      <div className="flex w-4/5 max-w-6xl h-[80vh] bg-white shadow-lg rounded-xl overflow-hidden">
        {/* Left Side Image */}
        <div className="w-1/2 bg-green-100 flex items-center justify-center">
          <img
            src="/assets/img/girl image.jpg"
            alt="Cute girl"
            className="object-cover h-full w-full"
          />
        </div>

        {/* Right Side Form */}
        <div className="w-1/2 flex flex-col justify-center items-center p-8 relative">
          <h1 className="text-3xl font-bold mb-6">Sign Up</h1>

          {/* Profile Image Upload */}
          <div className="mb-6">
            <label htmlFor="profile-image">
              <input
                type="file"
                id="profile-image"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <Avatar
                src={imageFile || ""}
                sx={{ width: 80, height: 80, cursor: "pointer" }}
              >
                { !imageFile && "Add"}
              </Avatar>
            </label>
          </div>

          {/* Form Fields */}
          <form className="w-full flex flex-col items-center gap-4" onSubmit={handleSubmit}>
            <TextField
              label="Name"
              variant="outlined"
              name="name"
              fullWidth
              value={formData.name}
              onChange={handleFormDataChange}
            />
            <TextField
              label="Phone Number"
              variant="outlined"
              name="phoneNumber"
              fullWidth
              value={formData.phoneNumber}
              onChange={handleFormDataChange}
            />
            <TextField
              label="Password"
              variant="outlined"
              name="password"
              type={showPassword ? "text" : "password"}
              fullWidth
              value={formData.password}
              onChange={handleFormDataChange}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />

            <Button
              variant="contained"
              color="success"
              type="submit"
              className="mt-4"
              fullWidth
            >
              Register
            </Button>
          </form>

          <p className="mt-4 text-gray-500">
            Already have an account?{" "}
            <a href="/login" className="text-green-500 font-semibold">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
