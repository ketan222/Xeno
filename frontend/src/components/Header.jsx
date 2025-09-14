import shopifyLogo from "../logos/shopify-logo.png";
import { useNavigate } from "react-router";
export default function Header() {
  const navigate = useNavigate();
  return (
    <nav className="bg-[#464646] text-white p-3 flex flex-row items-center justify-between px-10">
      <div className="text-sm flex flex-row items-center">
        <div
          className="bg-no-repeat bg-contain w-15 h-15 z-50"
          style={{ backgroundImage: `url(${shopifyLogo})` }}
        ></div>
        <span className="text-xl ml-2 font-bold font-sans">Shopify</span>
      </div>
      <div className="text-sm flex flex-row items-center gap-4">
        {localStorage.getItem("user-jwt") ? (
          <div
            className="cursor-pointer bg-[#e3e4e4] px-6 py-2 text-lg text-gray-800 rounded-md hover:scale-105 transition-transform"
            onClick={() => {
              localStorage.removeItem("user-jwt");
              navigate("/login");
            }}
          >
            Logout
          </div>
        ) : null}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-14 text-[#e3e4e4]"
        >
          <path
            fillRule="evenodd"
            d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </nav>
  );
}
