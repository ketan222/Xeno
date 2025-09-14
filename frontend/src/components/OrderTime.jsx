import { useCont } from "../useContext/Context";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function OrderTime() {
  const { orders, ordersUpdate } = useCont();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Group orders by day (YYYY-MM-DD)
  const ordersByDay = orders.reduce((acc, order) => {
    const date = new Date(order.created_at);
    const day = date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }); // e.g. "09 Sep 2025"
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});

  useEffect(() => {
    try {
      async function getOrders() {
        // fetching orders
        const token = localStorage.getItem("user-jwt");
        if (!token) {
          throw new Error("No token found, please login.");
          //   navigate("/login");
        }
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/orders/getOrders`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error(response.statusText);
        const orderData = await response.json();
        // console.log(orderData);
        ordersUpdate(orderData.orders);
      }
      getOrders();
    } catch (err) {
      alert(err.message);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) return <p>Loading...</p>;

  // Convert to array for Recharts
  const data = Object.entries(ordersByDay).map(([day, count]) => ({
    day,
    orders: count,
  }));

  return (
    <article className="w-full h-full bg-white p-5 rounded-md shadow-sm">
      <h2 className="text-xl font-bold mb-4">Orders by Day</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="orders"
            stroke="#16a34a"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </article>
  );
}
