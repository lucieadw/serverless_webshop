
import { HttpRequest, HttpResponse } from '../http'
import { Product } from './forms';
import mysql from 'mysql2'
import { retry } from '../db/retry';


export async function handler(event: HttpRequest): Promise<HttpResponse> {
  const userId = event.pathParameters['userId']

  const conn = mysql.createConnection({
    host: process.env.DB_URL,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })

  try {
    const [rows, fields] = await conn.promise().query('SELECT * FROM Baskets WHERE id = ?', [userId])
    console.log('Basket: ')
    console.log(rows[0])
    const basket = rows[0] === undefined ? { id: userId, products: [] } : { id: rows[0].id, products: JSON.parse(rows[0].products) }

    basket.products = await Promise.all(basket.products.map(async basketProduct => {
      const product = await getWholeProduct(basketProduct.productId, conn) //product aus der db holen
      return { ...basketProduct, ...product }
    }))

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(basket) //das geht dann mit den fehlenden productinfos ans frontend und dann kann dieses den warenorb richtig anzeigen
    }
  } catch (err) {
    console.error(err)
    return {
      statusCode: err.statusCode || 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: "Internal Server Error Oops: " + err
    }
  }
}

async function getWholeProduct(pId: string, conn: mysql.Connection): Promise<Product> {
  const [rows, fields] = await conn.promise().query( 'SELECT * FROM Products WHERE productId = ?', [pId])
  return rows[0]
}
