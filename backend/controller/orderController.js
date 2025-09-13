export const syncOrders = async (req, res) => {
  try {
    const db = req.app.locals.db;

    const tenant = await db.query(
      `
        SELECT * FROM tenants where id = ?
      `,
      [req.user.tenant_id]
    );

    // fetch orders from shopify
    const response = await fetch(
      `https://${tenant[0][0].shop_domain}/admin/api/2023-10/orders.json?status=any`,
      {
        method: "GET",
        headers: {
          "X-Shopify-Access-Token": tenant[0][0].access_token,
          "Content-Type": "application/json",
        },
      }
    );

    // checking the orders table structure
    // const cols = await db.query("SHOW COLUMNS FROM orders");
    // console.log(cols);

    const data = await response.json();
    const orders = data.orders;

    // insert or update orders in the database
    for (let order of orders) {
      await db.query(
        `
          INSERT INTO orders (
            id ,
            customer_id ,
            tenant_id, 
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
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
          ON DUPLICATE KEY UPDATE
            id = VALUES(id),
            customer_id = VALUES(customer_id),
            tenant_id = VALUES(tenant_id),
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
          req.user.tenant_id,
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

export const getOrders = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const user = req.user;
    const tenantId = user.tenant_id;

    // fetching orders related to tenantId
    const orders = await db.query(
      `
        SELECT * FROM orders where tenant_id = ?
      `,
      [tenantId]
    );

    res.status(200).json({
      status: "successfully returned the customers",
      orders: orders[0],
    });
    // res.status(200).json({ status: "success" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "Internal server Error" });
  }
};

export const getByDate = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { start, end } = req.body;
    const tenantId = req.user.tenant_id;

    // get orders based on the dates
    const [orders] = await db.query(
      `
        SELECT * 
        FROM orders 
        WHERE tenant_id = ? 
          AND created_at BETWEEN ? AND ?
        ORDER BY created_at ASC
      `,
      [tenantId, start, end]
    );

    res.status(200).json({
      status: "success",
      orders,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "Internal server error" });
  }
};
