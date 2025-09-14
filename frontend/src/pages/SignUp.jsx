import { Link } from "react-router-dom";
import { useState } from "react";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [verified, setVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [chk, setchk] = useState("");
  const [password, setPassword] = useState("");
  const [domainName, setDomainName] = useState("");
  const [accessToken, setAccessToken] = useState("");

  // send otp on mail
  async function sendMail() {
    try {
      console.log(import.meta.env.VITE_BACKEND_URL + " " + "sending Mail");
      const url = `${import.meta.env.VITE_BACKEND_URL}/sendMail`;
      console.log(url);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!response.ok) throw new Error(response.status);
      const data = await response.json();
      setchk(data.otp);
      console.log(data);
    } catch (err) {
      alert(err.message);
    }
  }

  // check the validity of otp
  function verifyOtp() {
    if (!otp || !chk) {
      alert("Please enter the OTP first.");
      return;
    }

    if (otp === chk) {
      setVerified(true);
      alert("OTP verified successfully!");
    } else {
      alert("Incorrect OTP. Try again.");
    }
  }

  async function handleSubmit(e) {
    try {
      e.preventDefault();
      if (password.length < 6) {
        alert("Password should be at least 6 characters long");
        return;
      }
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password.trim(),
            store_domain: domainName.trim(),
            access_token: accessToken.trim(),
          }),
        }
      );
      if (!response.ok) throw new Error(response.status);
      const data = await response.json();
      console.log(data);
      localStorage.setItem("user-jwt", data.token);
      alert("Signup successful! Please login.");
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="w-screen min-h-screen flex items-center justify-center bg-white text-gray-800">
      <div className="border-2 border-gray-200 w-[80%] md:w-[35%] lg:w-[30%] rounded-xl flex flex-col items-center p-6 shadow-md shadow-gray-500">
        {/* Header */}
        <div className="text-gray-900 text-2xl md:text-3xl lg:text-4xl font-bold mb-6 flex items-center justify-center w-full">
          Signup
        </div>

        {/* Form */}
        <form className="w-full flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="border-2 border-gray-300 p-3 rounded-md w-full outline-none disabled:bg-gray-100 disabled:text-gray-500"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            disabled={verified}
          />

          {/* Email verification vai otp */}
          <div className="flex flex-row items-center justify-between">
            <input
              placeholder="OTP"
              className="w-[50%] bg-gray-200 border-2 border-gray-300 p-3 rounded-md outline-none"
              onChange={(e) => setOtp(e.target.value)}
              value={otp}
              disabled={verified}
            />
            <button
              className="bg-blue-500 text-white px-4 py-3 rounded-md ml-4 text-xs md:text-sm text-nowrap hover:scale-105 transition-transform"
              type="button"
              onClick={sendMail}
              disabled={verified}
            >
              {" "}
              Send Otp{" "}
            </button>
            <button
              className="bg-blue-500 text-white px-4 py-3 rounded-md ml-4 text-xs md:text-sm text-nowrap hover:scale-105 transition-transform"
              type="button"
              onClick={verifyOtp}
              disabled={verified}
            >
              {" "}
              Verify{" "}
            </button>
          </div>
          <input
            type="password"
            placeholder="Password"
            className="border-2 border-gray-300 p-3 rounded-md w-full outline-none"
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="url"
            placeholder="Domain Name eg -> yourstore.myshopify.com"
            className="border-2 border-gray-300 p-3 rounded-md w-full outline-none"
            onChange={(e) => setDomainName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Access Token"
            className="border-2 border-gray-300 p-3 rounded-md w-full outline-none"
            onChange={(e) => setAccessToken(e.target.value)}
          />
          <button
            disabled={
              !verified || !email || !password || !domainName || !accessToken
            }
            className="bg-blue-500 text-white py-3 rounded-md w-full text-lg hover:scale-105 transition-transform"
            onClick={handleSubmit}
          >
            SignUp
          </button>

          <div className="text-sm text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500 hover:underline">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
