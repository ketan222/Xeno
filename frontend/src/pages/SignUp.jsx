import { Link } from "react-router-dom";

export default function SignUp() {
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
            type="text"
            placeholder="Email"
            className="border-2 border-gray-300 p-3 rounded-md w-full outline-none"
          ></input>
          <div className="flex flex-row items-center justify-between">
            <input
              placeholder="OTP"
              className="w-[50%] bg-gray-200 border-2 border-gray-300 p-3 rounded-md outline-none"
            />
            <button
              className="bg-blue-500 text-white px-4 py-3 rounded-md ml-4 text-xs md:text-sm text-nowrap hover:scale-105 transition-transform"
              type="button"
            >
              {" "}
              Send Otp{" "}
            </button>
            <button
              className="bg-blue-500 text-white px-4 py-3 rounded-md ml-4 text-xs md:text-sm text-nowrap hover:scale-105 transition-transform"
              type="button"
            >
              {" "}
              Verify{" "}
            </button>
          </div>
          <input
            type="password"
            placeholder="Password"
            className="border-2 border-gray-300 p-3 rounded-md w-full outline-none"
          />
          <input
            type="number"
            placeholder="Domain Name"
            className="border-2 border-gray-300 p-3 rounded-md w-full outline-none"
          />
          <input
            type="text"
            placeholder="Access Token"
            className="border-2 border-gray-300 p-3 rounded-md w-full outline-none"
          />
          <button
            className="bg-blue-500 text-white py-3 rounded-md w-full text-lg hover:scale-105 transition-transform"
            style={{ transitionDuration: "2s", duration: "2000ms" }} // long smooth hover
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
