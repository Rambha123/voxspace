// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log({ email, password });
    // TODO: Handle response, store JWT, redirect
  };

  const handleSignup = () => {
    navigate("/Signup");
  };

  return (
    <div
      className="flex items-center justify-center h-screen"
      style={{ backgroundColor: "rgb(28, 37, 65)" }}
    >
      <form
        onSubmit={handleLogin}
        className="p-8 rounded-2xl shadow-md w-full max-w-md"
        style={{ backgroundColor: "rgb(58, 80, 107)" }}
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          Login to VoxSpace
        </h2>

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-black">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1 text-sm font-medium text-black">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-xl transition duration-200"
        >
          Login
        </button>

        <div className="mt-6 text-center text-black">
          Don't have an account?
          <button
            onClick={handleSignup}
            type="button"
            className="ml-2 text-green-500 hover:text-green-300 px-4 py-1 transition duration-200"
          >
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
}