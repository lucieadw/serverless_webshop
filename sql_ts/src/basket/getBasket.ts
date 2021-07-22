
import { Product } from '../orders/forms';
import { HttpRequest, HttpResponse } from '../http'
import { Basket } from './forms';
import mysql from 'mysql2'


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
    const data = await conn.promise().query('SELECT * FROM Baskets WHERE id = ?', [userId])
    if (data) {
      const basket = data ? data as Basket : { userId, products: [] }
     /* basket.products = await Promise.all(basket.products.map(async basketProduct => {
        const product = await getWholeProduct(basketProduct.category, basketProduct.productId) //product aus der db holen
        const combined = { ...basketProduct, ...product }
        //stock soll nicht mit in Basket+Order stehen
        return {
          category: combined.category,
          productId: combined.productId,
          name: combined.name,
          description: combined.description,
          price: combined.price,
          picture: combined.picture,
          amount: combined.amount
        } //baut aus den beiden ein neues kombiniertes objekt
      }))*/
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(basket) //das geht dann mit den fehlenden productinfos ans frontend und dann kann dieses den warenorb richtig anzeigen
      }
    }
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        userId,
        products: []
      })
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

async function getWholeProduct(category: string, pId: string): Promise<Product> {
  const params = {
    TableName: process.env.PRODUCTS_TABLE!,
    Key: {
      category: category,
      productId: pId
    },
  }
  try {
    const data = await ddb.get(params).promise()
    if (data.Item) {
      return data.Item as Product
    }
  } catch (err) {
    console.error(err)
  }
  return {} as Product
}
