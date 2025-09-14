import { Link } from "react-router-dom";
import { useState } from "react";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    try {
      e.preventDefault();
      if (password.length < 6) {
        alert("Password should be at least 6 characters long");
        return;
      }
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password.trim(),
          }),
        }
      );
      console.log(response);
      if (!response.ok) throw new Error(response.statusText);
      const data = await response.json();
      console.log(data);
      localStorage.setItem("user-jwt", data.token);
      alert("Login successful! Welcome back.");
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="w-screen min-h-screen flex items-center justify-center bg-white text-gray-800">
      <div className="border-2 border-gray-200 w-[80%] md:w-[35%] lg:w-[30%] rounded-xl flex flex-col items-center p-6 shadow-md shadow-gray-500">
        {/* Header */}
        <div className="text-gray-900 text-2xl md:text-3xl lg:text-4xl font-bold mb-6 flex items-center justify-center w-full">
          Login
        </div>

        {/* Form */}
        <form className="w-full flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="border-2 border-gray-300 p-3 rounded-md w-full outline-none disabled:bg-gray-100 disabled:text-gray-500"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />

          <input
            type="password"
            placeholder="Password"
            className="border-2 border-gray-300 p-3 rounded-md w-full outline-none"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            disabled={!email || !password}
            className="bg-blue-500 text-white py-3 rounded-md w-full text-lg hover:scale-105 transition-transform"
            onClick={handleSubmit}
          >
            Login
          </button>

          <div className="text-sm text-center">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-500 hover:underline">
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
