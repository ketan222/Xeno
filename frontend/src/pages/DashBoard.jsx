import { useEffect, useState, lazy, Suspense } from "react";
import Header from "../components/Header";
import { useCont } from "../useContext/Context";
import { useNavigate } from "react-router";

// Lazy load components
const OrderTime = lazy(() => import("../components/OrderTime"));
const Top5Customers = lazy(() => import("../components/Top5Customers"));
const Products = lazy(() => import("../components/Products"));

export default function DashBoard() {
  const {
    totalRevenue,
    updateTotalRevenue,
    totalCustomers,
    updateTotalCustomers,
    totalOrders,
    updateTotalOrders,
    totalProducts,
    updateTotalProducts,
  } = useCont();

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("customers"); // Default tab

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("user-jwt");
        if (!token) throw new Error("No token found, please login.");

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/summary`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error(response.statusText);

        const revenueData = await response.json();
        updateTotalRevenue(revenueData.totalRevenue);
        updateTotalCustomers(revenueData.totalCustomers);
        updateTotalOrders(revenueData.totalOrders);
        updateTotalProducts(revenueData.totalProducts);
      } catch (err) {
        alert(err.message);
        navigate("/login");
      }
    }

    fetchData();
  }, []);

  // Render selected tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "orders":
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <OrderTime />
          </Suspense>
        );
      case "customers":
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <Top5Customers />
          </Suspense>
        );
      case "products":
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <Products />
          </Suspense>
        );
      default:
        return null;
    }
  };

  return (
    <div className="text-black max-h-screen h-screen overflow-scroll flex flex-col bg-[#f8f7f8]">
      <Header />

      <main className="p-10 flex-grow flex flex-row gap-5">
        {/* Sidebar */}
        <aside className="w-1/5 border-2 border-gray-200 rounded-md p-5 h-full bg-[#f3f3f2]">
          <nav>
            <ul className="flex flex-col gap-3 items-center">
              <li
                className={`w-[90%] text-lg py-2 px-4 cursor-pointer rounded-md ${
                  activeTab === "customers"
                    ? "bg-[#ecedec]"
                    : "hover:bg-[#ecedec]"
                }`}
                onClick={() => setActiveTab("customers")}
              >
                Customers
              </li>
              <li
                className={`w-[90%] text-lg py-2 px-4 cursor-pointer rounded-md ${
                  activeTab === "orders" ? "bg-[#ecedec]" : "hover:bg-[#ecedec]"
                }`}
                onClick={() => setActiveTab("orders")}
              >
                Orders
              </li>
              <li
                className={`w-[90%] text-lg py-2 px-4 cursor-pointer rounded-md ${
                  activeTab === "products"
                    ? "bg-[#ecedec]"
                    : "hover:bg-[#ecedec]"
                }`}
                onClick={() => setActiveTab("products")}
              >
                Products
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Dashboard Content */}
        <section className="flex-grow flex flex-col gap-5">
          <h1 className="text-2xl font-bold text-left">Dashboard</h1>
          <section className="w-full flex flex-row gap-5 items-center p-5">
            <article className="w-[23%] h-20 md:h-36 lg:h-44 text-left bg-white rounded-md p-7 flex flex-col gap-5 shadow-gray-100 shadow-sm hover:shadow-md hover:scale-105 transition-all">
              <h2 className="text-3xl font-sans">Total Sales</h2>
              <p className="text-2xl font-bold">${totalRevenue}</p>
            </article>
            <article className="w-[23%] h-20 md:h-36 lg:h-44 text-left bg-white rounded-md p-7 flex flex-col gap-5 shadow-gray-100 shadow-sm hover:shadow-md hover:scale-105 transition-all">
              <h2 className="text-3xl font-sans">Total Orders</h2>
              <p className="text-2xl font-bold">{totalOrders}</p>
            </article>
            <article className="w-[23%] h-20 md:h-36 lg:h-44 text-left bg-white rounded-md p-7 flex flex-col gap-5 shadow-gray-100 shadow-sm hover:shadow-md hover:scale-105 transition-all">
              <h2 className="text-3xl font-sans">Total Customers</h2>
              <p className="text-2xl font-bold">{totalCustomers}</p>
            </article>
            <article className="w-[23%] h-20 md:h-36 lg:h-44 text-left bg-white rounded-md p-7 flex flex-col gap-5 shadow-gray-100 shadow-sm hover:shadow-md hover:scale-105 transition-all">
              <h2 className="text-3xl font-sans">Total Products</h2>
              <p className="text-2xl font-bold">{totalProducts}</p>
            </article>
          </section>

          {/* Lazy loaded tab content */}
          <section className="flex-grow">{renderTabContent()}</section>
        </section>
      </main>
    </div>
  );
}
