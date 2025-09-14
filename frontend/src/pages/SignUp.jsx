import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [verified, setVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [chk, setChk] = useState("");
  const [password, setPassword] = useState("");
  const [domainName, setDomainName] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [loading, setLoading] = useState("");
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();

  // OTP countdown timer effect
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const formatTimer = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // send otp on mail
  async function sendMail() {
    try {
      setLoading("sendingMail");
      const url = `${import.meta.env.VITE_BACKEND_URL}/sendMail`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!response.ok) throw new Error(response.status);
      const data = await response.json();
      setChk(data.otp);
      setTimer(300); // 5 minutes
      alert("OTP sent to your mail");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading("");
    }
  }

  // check the validity of otp
  function verifyOtp() {
    if (!otp || !chk) {
      alert("Please enter the OTP first.");
      return;
    }

    if (timer <= 0) {
      alert("OTP expired! Please resend OTP.");
      return;
    }

    setLoading("verifyingOtp");
    setTimeout(() => {
      if (otp === chk) {
        setVerified(true);
        alert("OTP verified successfully!");
      } else {
        alert("Incorrect OTP. Try again.");
      }
      setLoading();
    }, 500); // small delay for loading effect
  }

  async function handleSubmit(e) {
    try {
      //   console.log("doing");
      e.preventDefault();
      if (password.length < 6) {
        alert("Password should be at least 6 characters long");
        return;
      }

      setLoading("submiting");
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            password: password.trim(),
            store_domain: domainName.trim(),
            access_token: accessToken.trim(),
          }),
        }
      );
      if (!response.ok) throw new Error(response.status);
      //   console.log("did enter");
      const data = await response.json();
      localStorage.setItem("user-jwt", data.token);

      alert("Signup successful!");
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading("");
    }
  }

  return (
    <div className="w-screen min-h-screen flex items-center justify-center bg-white text-gray-800">
      <div className="border-2 border-gray-200 w-[80%] md:w-[35%] lg:w-[30%] rounded-xl flex flex-col items-center p-6 shadow-md shadow-gray-500">
        <div className="text-gray-900 text-2xl md:text-3xl lg:text-4xl font-bold mb-6 flex items-center justify-center w-full">
          Signup
        </div>

        <form className="w-full flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="border-2 border-gray-300 p-3 rounded-md w-full outline-none disabled:bg-gray-100 disabled:text-gray-500"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            disabled={verified || loading !== ""}
          />

          <div className="flex flex-row items-center justify-between">
            <input
              placeholder="OTP"
              className="w-[50%] bg-gray-200 border-2 border-gray-300 p-3 rounded-md outline-none"
              onChange={(e) => setOtp(e.target.value)}
              value={otp}
              disabled={verified || loading !== ""}
            />
            <button
              className="bg-blue-500 text-white px-4 py-3 rounded-md ml-4 text-xs md:text-sm hover:scale-105 transition-transform"
              type="button"
              onClick={sendMail}
              disabled={verified || loading !== ""}
            >
              {loading === "sendingMail" ? "Sending..." : "Send OTP"}
            </button>
            <button
              className="bg-blue-500 text-white px-4 py-3 rounded-md ml-4 text-xs md:text-sm hover:scale-105 transition-transform"
              type="button"
              onClick={verifyOtp}
              disabled={verified || loading !== ""}
            >
              {loading === "verifyingOtp" ? "Verifying..." : "Verify"}
            </button>
          </div>
          {timer > 0 && !verified && (
            <p className="text-sm text-red-500 mt-1">
              OTP expires in {formatTimer()}
            </p>
          )}

          <input
            type="password"
            placeholder="Password"
            className="border-2 border-gray-300 p-3 rounded-md w-full outline-none"
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <input
            type="url"
            placeholder="Domain Name eg -> yourstore.myshopify.com"
            className="border-2 border-gray-300 p-3 rounded-md w-full outline-none"
            onChange={(e) => setDomainName(e.target.value)}
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Access Token"
            className="border-2 border-gray-300 p-3 rounded-md w-full outline-none"
            onChange={(e) => setAccessToken(e.target.value)}
            disabled={loading}
          />
          <button
            disabled={
              !verified ||
              !email ||
              !password ||
              !domainName ||
              !accessToken ||
              loading == "submiting"
            }
            className="bg-blue-500 text-white py-3 rounded-md w-full text-lg hover:scale-105 transition-transform"
            onClick={handleSubmit}
          >
            {loading === "submitting" ? "Signing up..." : "SignUp"}
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
