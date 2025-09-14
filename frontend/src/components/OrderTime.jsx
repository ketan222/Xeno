import { useCont } from "../useContext/Context";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
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

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    async function getOrders() {
      try {
        const token = localStorage.getItem("user-jwt");
        if (!token) {
          throw new Error("No token found, please login.");
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
        ordersUpdate(orderData.orders);
      } catch (err) {
        alert(err.message);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    }
    getOrders();
  }, []);

  if (loading) return <p>Loading...</p>;

  // filter orders by date range
  const filteredOrders = orders.filter((order) => {
    const orderDate = new Date(order.created_at);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && orderDate < start) return false;
    if (end && orderDate > end) return false;
    return true;
  });

  // group filtered orders by day
  const ordersByDay = filteredOrders.reduce((acc, order) => {
    const date = new Date(order.created_at);
    const day = date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});

  // convert to array for Recharts
  const data = Object.entries(ordersByDay).map(([day, count]) => ({
    day,
    orders: count,
  }));

  return (
    <article className="w-full h-full bg-white p-5 rounded-md shadow-sm">
      <h2 className="text-xl font-bold mb-4">Orders by Day</h2>

      {/* Date inputs */}
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>
      </div>

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
