import mysql from 'mysql2'
import { SnsEvent } from '../sns';
import { Order, OrderProduct, OrderStatus } from './forms';

export async function handler(event: SnsEvent) {
  const conn = mysql.createConnection({
    host: process.env.DB_URL,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })

  const order = JSON.parse(event.Records[0].Sns.Message) as Order
  const sumAry: number[] = await Promise.all(order.products.map(p => calcPriceSum(p, conn)))
  const sum: number = sumAry.reduce((a, p) => a + p, 0)

  // Validate order (check stock etc.)
  const promAry = await Promise.all(order.products.map(p => checkStock(p, conn)))
  const allAvailable = promAry.every(e => e === true)

  if (allAvailable) {
    try {
      await conn.promise().query(
        `INSERT INTO Orders (orderNo, id, name, email, street, housenr, city, postcode, products, sum, orderStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [order.orderNo, order.userId, order.name, order.email, order.street, order.housenr, order.city, order.postcode, JSON.stringify(order.products), sum, OrderStatus.Confirmed])

      //update stock
      await updateStock(order.products, conn)
      //send order confirming e-mail to customer
      await emptyBasket(order.userId, conn)
    } catch (err) {
      console.log(err)
      //send apologizing e-mail to customer (due to internal failure)
    }
  } else {
    console.log('Out of Stock')
    //change status from confirmed to 
    await conn.promise().query(
      `INSERT INTO Orders (orderNo, id, name, email, street, housenr, city, postcode, products, sum, orderStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [order.orderNo, order.userId, order.name, order.email, order.street, order.housenr, order.city, order.postcode, JSON.stringify(order.products), sum, OrderStatus.OutOfStock])
    // send apologizing e-mail to customer (out of stock)
  }
}

export async function calcPriceSum(p: OrderProduct, conn: mysql.Connection): Promise<number> {
  const [rows, fields] = await conn.promise().query('SELECT * FROM Products WHERE category = ? AND productId = ?', [p.category, p.productId])
  const price = rows[0].price
  return price * p.amount
}

export async function checkStock(p: OrderProduct, conn: mysql.Connection): Promise<boolean> {
  const [rows, fields] = await conn.promise().query('SELECT * FROM Products WHERE category = ? AND productId = ?', [p.category, p.productId])
  const stock = rows[0].stock
  //if((data.Item.stock - amount) <= 0){
  //alert: reorder neccecarys
  //}
  return stock >= p.amount
}

export async function emptyBasket(userId: string, conn: mysql.Connection): Promise<any> {
  return await await conn.promise().query(`UPDATE Baskets SET products = '[]' WHERE id = ?`, [userId])

}

export async function updateStock(products: OrderProduct[], conn: mysql.Connection): Promise<any> {
  return Promise.all(products.map(p => {
    return conn.promise().query('UPDATE Products SET stock = stock - ? WHERE category = ? AND productId = ?', [p.amount, p.category, p.productId])
  }))
}
