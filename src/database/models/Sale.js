const connection = require('../connection');

const createSale = async (sales) => {
  const [queryResult] = await connection.query(`
    INSERT INTO StoreManager.sales
    VALUES()
  `);

  await sales.forEach((sale) => (
    connection.query(`
      INSERT INTO StoreManager.sales_products (sale_id, product_id, quantity)
      VALUES (?, ?, ?)
    `, [queryResult.insertId, sale.productId, sale.quantity])
  ));
  
  return { id: queryResult.insertId, itemsSold: sales };
};

const getSales = async () => {
  try {
    const [sales] = await connection.query(`
      SELECT DISTINCT date, 
        sale_id AS saleId, product_id AS productId, quantity FROM StoreManager.sales_products
      INNER JOIN StoreManager.sales
      ORDER BY saleId, productId ASC
    `);
    return sales;
  } catch (err) {
    console.log('Erro na model getSales', err.message);
  }
};

const getSaleById = async (id) => {
  try {
    const [sale] = await connection.query(`
      SELECT DISTINCT date,
        product_id AS productId, quantity FROM StoreManager.sales_products
      INNER JOIN StoreManager.sales
      WHERE sale_id = ?`,
    [id]);
    return sale;
  } catch (err) {
    console.log('Erro na model getSaleById', err.message);
  }
};

const editSale = async (id, sales) => {
  try {
    const [verifiedSale] = await connection.query(`
      SELECT * FROM StoreManager.sales_products
      WHERE sale_id = ?
    `, [id]);
    if (verifiedSale === 0) {
      return [];
    } await sales.forEach((sale) => (
      connection.query(`
        UPDATE StoreManager.sales_products
        SET product_id = ?, quantity = ?
        WHERE sale_id = ?
      `, [sale.productId, sale.quantity, id])
    ));
    return { saleId: id, itemUpdated: sales };
  } catch (err) {
    console.log('Erro na model editSale', err.message);
  }
};

const deleteSale = async (id) => {
  try {
    const [verifiedSale] = await connection.query(`
      SELECT * FROM StoreManager.sales
      WHERE id = ?
    `, [id]);
    if (verifiedSale.length > 0) {
      await connection.query(`
        DELETE FROM StoreManager.sales
        WHERE id = ?
      `, [id]);
    } return verifiedSale;
  } catch (err) {
    console.log('Erro na model deleteSale', err.message);
  }
};

module.exports = {
  createSale,
  getSales,
  getSaleById,
  editSale,
  deleteSale,
};