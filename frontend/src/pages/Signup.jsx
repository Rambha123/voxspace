import { useState } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";


export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post("http://localhost:6969/api/signup", formData);

      if (response.status === 200 || response.status === 201) {
        setSuccess("Signup successful! You can now login.");
        setFormData({ name: "", email: "", password: "" });
      } else {
        setError("Signup failed. Please try again.");
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Network error: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

const handleGoogleSuccess = async (credentialResponse) => {
  try {
    const response = await axios.post("http://localhost:6969/api/google-signup", {
      credential: credentialResponse.credential // Send raw credential
    });

    if (response.data.token) {
      // Store token and handle user session
      localStorage.setItem('token', response.data.token);
      setSuccess("Google signup successful!");
      // Optional: Redirect user
    }
  } catch (err) {
    setError(err.response?.data?.message || "Google signup failed");
  }
};


  const handleGoogleError = () => {
    setError("Google Sign In failed. Please try again.");
  };

  return (
    <div
      className="flex items-center justify-center h-screen"
      style={{ backgroundColor: "rgb(28, 37, 65)" }}
    >
      <form
        onSubmit={handleSubmit}
        className="p-8 rounded-2xl shadow-lg w-full max-w-md"
        style={{ backgroundColor: "rgb(58, 80, 107)" }}
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          Create a VoxSpace Account
        </h2>

        {error && (
          <p className="text-red-600 mb-4 text-center font-semibold">{error}</p>
        )}
        {success && (
          <p className="text-green-600 mb-4 text-center font-semibold">{success}</p>
        )}

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-black">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-black">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1 text-sm font-medium text-black">
            Password
          </label>
          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-4">
  <div className="flex-1">
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={handleGoogleError}
      size="large"
      width="100%" 
    />
  </div>
  <button
    type="submit"
    disabled={loading}
    className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-xl transition duration-200 disabled:opacity-50"
  >
    {loading ? "Signing Up..." : "Sign Up"}
  </button>
</div>

       
      </form>
    </div>
  );
}
