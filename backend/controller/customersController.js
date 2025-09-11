export const syncCustomers = async (req, res) => {
  try {
    const db = req.app.locals.db;

    // fetch customers from Shopify
    const response = await fetch(
      `${process.env.SHOPIFY_STORE}/admin/api/2023-10/customers.json`,
      {
        method: "GET",
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    const customers = data.customers;

    // Insert or Update customers in the database
    for (const customer of customers) {
      //   console.log(customer.total_spent);
      await db.query(
        `
        INSERT INTO customers
        (id, email, first_name, last_name, total_spent, orders_count, last_order_id, phone, currency, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          email = VALUES(email),
          first_name = VALUES(first_name),
          last_name = VALUES(last_name),
          total_spent = VALUES(total_spent),
          orders_count = VALUES(orders_count),
          last_order_id = VALUES(last_order_id),
          phone = VALUES(phone),
          currency = VALUES(currency),
          updated_at = VALUES(updated_at)
        `,
        [
          customer.id,
          customer.email,
          customer.first_name,
          customer.last_name,
          parseFloat(customer.total_spent) || 0,
          customer.orders_count || 0,
          customer.last_order_id || null,
          customer.phone || null,
          customer.currency || null,
          new Date(customer.created_at),
          new Date(customer.updated_at),
        ]
      );
    }

    // const result = await db.query("select * from customers");
    // console.log(result[0]);

    res.status(200).json({ status: "Customers synced successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "Internal Server Error" });
  }
};
