export const syncProducts = async (req, res) => {
  try {
    const db = req.app.locals.db;

    const result = await db.query(`
      show columns from products
      `);

    console.log(result[0].forEach((ele) => console.log(ele.Field)));
    // fetch products from Shopify

    const tenant = await db.query(
      `
        SELECT * FROM tenants where id = ?
      `,
      [req.user.tenant_id]
    );

    // console.log(tenant[0][0]);
    const response = await fetch(
      `
        https://${tenant[0][0].shop_domain}/admin/api/2023-10/products.json`,
      {
        method: "GET",
        headers: {
          "X-Shopify-Access-Token": tenant[0][0].access_token,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    // console.log(data.products[0]);
    const prod = data.products;

    for (let product of prod) {
      const images = product.images;
      // console.log(product);
      // console.log("+++++++++++++++++++");
      const response = await db.query(
        `
          INSERT INTO products (id, tenant_id, title, description, price, compare_at_price, taxable, inventory_item_id, inventory_quantity, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
          id = VALUES(id),
          tenant_id = VALUES(tenant_id),
          title = VALUES(title),
          description = VALUES(description),
          price = VALUES(price),
          compare_at_price = VALUES(compare_at_price),
          taxable = VALUES(taxable),
          inventory_item_id = VALUES(inventory_item_id),
          inventory_quantity = VALUES(inventory_quantity),
          created_at = VALUES(created_at),
          updated_at = VALUES(updated_at);
        `,
        [
          product.id,
          req.user.tenant_id,
          product.title,
          product.body_html,
          product.variants[0]?.price + 0.0,
          product.variants[0]?.compare_at_price + 0.0,
          product.variants[0]?.taxable || true,
          product.variants[0]?.inventory_item_id || null,
          product.variants[0]?.inventory_quantity || 0,
          product.variants[0]?.created_at || new Date(),
          product.variants[0]?.updated_at || new Date(),
        ]
      );
      for (let image of images) {
        const res = await db.query(
          `
              INSERT INTO pictures (ID, PRODUCT_ID, SRC, ALT, POSITION, WIDTH, HEIGHT, CREATED_AT, UPDATED_AT)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE
                id = VALUES(id),
                product_id = VALUES(product_id),
                src = VALUES(src),
                alt = VALUES(alt),
                position = VALUES(position),
                width = VALUES(width),
                height = VALUES(height),
                created_at = VALUES(created_at),
                updated_at = VALUES(updated_at);
          `,
          [
            image.id,
            product.id,
            image.src,
            image.alt,
            image.position,
            image.width,
            image.height,
            image.created_at,
            image.updated_at,
          ]
        );
      }
    }

    // insert or update products in the database

    res.status(200).json({ status: "Products synced successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "Failed to sync products" });
  }
};

export const getProducts = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const user = req.user;
    const tenantId = user.tenant_id;

    // fetching the products
    const products = await db.query(
      `
        SELECT * FROM products where tenant_id = ?
      `,
      [tenantId]
    );

    // connecting pictures
    for (let product of products[0]) {
      const pictures = await db.query(
        `
          SELECT * FROM pictures where product_id = ?
        `,
        [product.id]
      );
      product.pictures = pictures[0];
    }

    res.status(200).json({
      status: "successfully returned the products",
      products: products[0],
    });
    // res.status(200).json({ status: "successfully returned the products" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "Internal server error" });
  }
};
