export const syncOrders = async (req, res) => {
  try {
    const db = req.app.locals.db;

    // fetch orders from shopify
    const response = await fetch(
      `${process.env.SHOPIFY_STORE}/admin/api/2023-10/orders.json?status=any`,
      {
        method: "GET",
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    console.log(data.orders[0]);

    // insert or update orders in the database
    res.status(200).json({ status: "Orders synced successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "Internal Server Error" });
  }
};
