import { useState, createContext, useContext } from "react";

const AppContext = createContext();

const ContextProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);

  const updateTotalRevenue = (newTotal) => {
    setTotalRevenue(newTotal);
  };
  const updateTotalCustomers = (newTotal) => {
    setTotalCustomers(newTotal);
  };
  const updateTotalOrders = (newTotal) => {
    setTotalOrders(newTotal);
  };
  const updateTotalProducts = (newTotal) => {
    setTotalProducts(newTotal);
  };

  const productsUpdate = (newProducts) => {
    setProducts(newProducts);
  };
  const ordersUpdate = (newOrders) => {
    setOrders(newOrders);
  };
  const customersUpdate = (newCustomers) => {
    setCustomers(newCustomers);
  };

  return (
    <AppContext.Provider
      value={{
        products,
        productsUpdate,
        orders,
        ordersUpdate,
        customers,
        customersUpdate,
        totalRevenue,
        updateTotalRevenue,
        totalCustomers,
        updateTotalCustomers,
        totalOrders,
        updateTotalOrders,
        totalProducts,
        updateTotalProducts,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

function useCont() {
  return useContext(AppContext);
}

export { useCont, ContextProvider };
