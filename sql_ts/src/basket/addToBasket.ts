import { HttpRequest, HttpResponse } from '../http'
import { BasketProduct, SimpleProduct, validateSimpleProduct } from './forms';
import mysql from 'mysql2'
import { retry } from '../db/retry';

export async function handler(event: HttpRequest): Promise<HttpResponse> {
  const simpleProduct: SimpleProduct = JSON.parse(event.body)
  const validationErr = validateSimpleProduct(simpleProduct)

  const conn = mysql.createConnection({
    host: process.env.DB_URL,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })


  if (validationErr) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: validationErr
    }
  }

  const userId = event.pathParameters['userId']

  try {
    const products = await addToBasket(userId, simpleProduct, conn)

    const [rows, fields] = await conn.promise().query('REPLACE INTO Baskets(id,products) VALUES(?, ?)', [userId, JSON.stringify(products)])
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(rows[0])
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

async function addToBasket(userId: string, product: SimpleProduct, conn: mysql.Connection): Promise<BasketProduct[]> {
  let products = null
  const [rows, fields] = await conn.promise().query('SELECT * from Baskets WHERE id = ?', [userId])
  console.log('Basket: ')
  console.log(rows[0])
  if (rows[0] === undefined) {
    products = []
  } else {
    products =  JSON.parse(rows[0].products)
  }

  const e = products.find(element => element.category === product.category && element.productId === product.productId);
  if (e) {
    e.amount = e.amount + 1
  } else {
    products.push({
      category: product.category,
      productId: product.productId,
      amount: 1
    })
  }
  return products
}
