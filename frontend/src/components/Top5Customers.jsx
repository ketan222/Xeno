import { useEffect } from "react";
import { useCont } from "../useContext/Context";
import { useNavigate } from "react-router";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
export default function Top5Customers() {
  const { orders, customers, customersUpdate } = useCont();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      async function fetchData() {
        const url = `${
          import.meta.env.VITE_BACKEND_URL
        }/api/customer/getTop5CustomersByMoneySpent`;
        const token = localStorage.getItem("user-jwt");
        if (!token) {
          throw new Error("No token found, please login.");
          //   navigate("/login");
        }
        setLoading(true);
        let response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error(response.statusText);
        const data = await response.json();
        // console.log(data.customers);
        customersUpdate(data.customers);
      }
      fetchData();
    } catch (err) {
      alert(err.message);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) return <p>Loading...</p>;

  // Step 1: Aggregate spend by customer_id
  const spendByCustomer = orders.reduce((acc, order) => {
    const id = order.customer_id;
    const total = parseFloat(order.total_price || 0);
    acc[id] = (acc[id] || 0) + total;
    return acc;
  }, {});

  // Step 2: Map to customer info
  const customerSpends = Object.entries(spendByCustomer).map(([id, total]) => {
    const customer = customers.find((c) => c.id === parseInt(id));
    return {
      name: customer?.name || customer?.email || "Unknown",
      total: parseFloat(total.toFixed(2)),
    };
  });

  // Step 3: Sort & pick top 5
  const top5 = customerSpends.sort((a, b) => b.total - a.total).slice(0, 5);
  return (
    <article className="bg-white rounded-md shadow-sm p-5 w-full h-80">
      <h2 className="text-xl font-bold mb-4">Top 5 Customers by Spend</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={top5}
          margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </article>
  );
}
