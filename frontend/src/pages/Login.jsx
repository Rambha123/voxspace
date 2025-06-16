import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = (props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    
    window.google.accounts.id.initialize({
      client_id: "893023489805-v26nltvaafsvugnr9gtnl9jdt4c4brh9.apps.googleusercontent.com",
      callback: handleGoogleCallback,
    });

    window.google.accounts.id.renderButton(
      document.getElementById("google-signin-button"),
      { theme: "outline", size: "large" }
    );
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await axios.post("http://localhost:6969/api/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      if (!user.isVerified) {
        setError("Please verify your email before logging in.");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      props.setIsLoggedIn(true);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed. Please try again.");
    }
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  const handleGoogleCallback = async (response) => {
    try {
      const res = await axios.post("http://localhost:6969/api/google-signup", {
        credential: response.credential,
      });

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      props.setIsLoggedIn(true);
      navigate("/");
    } catch (err) {
      console.error("Google login failed:", err);
      setError("Google login failed. Please try again.");
    }
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

        {error && (
          <div className="mb-4 text-red-500 text-sm text-center">{error}</div>
        )}

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-black">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1 text-sm font-medium text-black">
            Password
          </label>
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

        <div className="mt-6 ml-12 text-center">
          <div id="google-signin-button"></div>
        </div>
      </form>
    </div>
  );
};

export default Login;
