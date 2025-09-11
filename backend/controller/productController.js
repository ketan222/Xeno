export const syncProducts = async (req, res) => {
  try {
    const db = req.app.locals.db;

    const result = await db.query(`
      show columns from products
      `);
    // console.log(result[0].forEach((ele) => console.log(ele.Field)));
    // fetch products from Shopify
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
    // console.log(data.products[0]);
    const prod = data.products;

    for (let product of prod) {
      const images = product.images;
      // console.log(product);
      // console.log("+++++++++++++++++++");
      const response = await db.query(
        `
          INSERT INTO products (id, title, description, price, compare_at_price, taxable, inventory_item_id, inventory_quantity, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
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
