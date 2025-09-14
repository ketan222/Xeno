import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useCont } from "../useContext/Context";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { useState } from "react";

const Products = () => {
  const { products, productsUpdate } = useCont();

  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    try {
      async function fetchData() {
        const token = localStorage.getItem("user-jwt");
        if (!token) {
          throw new Error("No token found, please login.");
          //   navigate("/login");
        }
        setLoading(true);

        // calculating total revenue
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/getProducts`,
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
        // console.log(revenueData);
        // console.log(revenueData);
        productsUpdate(revenueData.products);
        // console.log(revenueData);
      }

      fetchData();
    } catch (err) {
      navigate("/login");
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  if (loading) return <p>Loading...</p>;
  // Calculate sales assuming initial inventory = 100 units for each product
  const data = products.map((product) => ({
    name: product.title,
    sales: (100 - product.inventory_quantity) * product.price,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          interval={0}
          height={60}
        />
        <YAxis />
        <Tooltip formatter={(value) => `₹${value}`} />
        <Bar dataKey="sales" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default Products;
