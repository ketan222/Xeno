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

    // const cols = await db.query("SHOW COLUMNS FROM orders");
    // console.log(cols);

    const data = await response.json();
    // console.log(data.orders[0]);
    const orders = data.orders;

    // insert or update orders in the database
    for (let order of orders) {
      await db.query(
        `
          INSERT INTO orders (
            id ,
            customer_id ,
            customer_email ,
            name ,
            order_number ,
            total_price ,
            subtotal_price ,
            total_tax ,
            currency ,
            status,
            created_at ,
            updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
          ON DUPLICATE KEY UPDATE
            id = VALUES(id),
            customer_id = VALUES(customer_id),
            customer_email = VALUES(customer_email),
            name = VALUES(name),
            order_number = VALUES(order_number),
            total_price = VALUES(total_price),
            subtotal_price = VALUES(subtotal_price),
            total_tax = VALUES(total_tax),
            currency = VALUES(currency),
            status = VALUES(status),
            created_at = VALUES(created_at),
            updated_at = VALUES(updated_at)
        `,
        [
          order.id,
          order.customer.id,
          order.customer.email,
          order.customer.first_name + " " + order.customer.last_name,
          order.order_number,
          order.total_price,
          order.subtotal_price,
          order.total_tax,
          order.customer.currency,
          order.fulfillments.status,
          order.created_at,
          order.updated_at,
        ]
      );
    }
    res.status(200).json({ status: "Orders synced successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "Internal Server Error" });
  }
};
