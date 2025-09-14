export const syncCustomers = async (req, res, next) => {
  try {
    const db = req.app.locals.db;

    const tenant = await db.query(
      `
        SELECT * FROM tenants where id = ?
      `,
      [req.user.tenant_id]
    );

    // console.log(tenant[0][0]);

    // fetch customers from Shopify
    const response = await fetch(
      `https://${tenant[0][0].shop_domain}/admin/api/2023-10/customers.json`,
      {
        method: "GET",
        headers: {
          "X-Shopify-Access-Token": tenant[0][0].access_token,
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
        (id, email, first_name, last_name, tenant_id, total_spent, orders_count, last_order_id, phone, currency, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          email = VALUES(email),
          first_name = VALUES(first_name),
          last_name = VALUES(last_name),
          tenant_id = VALUES(tenant_id),
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
          req.user.tenant_id,
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
    next();
    // res.status(200).json({ status: "Customers synced successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "Internal Server Error" });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const user = req.user;
    const tenantId = user.tenant_id;

    // fetching the customers
    const customers = await db.query(
      `
        SELECT * FROM customers where tenant_id = ?
      `,
      [tenantId]
    );

    res.status(200).json({
      status: "successfully returned the customers",
      customers: customers[0],
    });
  } catch (err) {
    console.log(err);
    res.status(200).json({ status: "cannot get customers" });
  }
};

export const getTop5CustomersByMoneySpent = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const tenantId = req.user.tenant_id;

    // fetching top 5 customers overall
    const top5 = await db.query(
      `
        SELECT * FROM customers 
        WHERE tenant_id = ? 
        ORDER BY total_spent DESC 
        LIMIT 5;
      `,
      [tenantId]
    );
    res.status(200).json({ status: "success", top5: top5[0] });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "Internal server error" });
  }
};
