export const syncProducts = async (req, res) => {
  try {
    const db = req.app.locals.db;

    // fetch products from Shopify

    const result = await db.query(`
            show columns from products
        `);
    console.log(result[0].forEach((ele) => console.log(ele.Field)));
    const response = await fetch(
      `
        
        ${process.env.SHOPIFY_STORE}/admin/api/2023-10/products.json`,
      {
        method: "GET",
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    console.log(data.products[0]);

    // insert or update products in the database

    res.status(200).json({ status: "Products synced successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "Failed to sync products" });
  }
};
