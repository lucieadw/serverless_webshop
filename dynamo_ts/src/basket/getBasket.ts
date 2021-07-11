import { DynamoDB } from 'aws-sdk';
import { Product } from '../orders/forms';
import { HttpRequest, HttpResponse } from '../http'
import { Basket } from './forms';

const ddb = new DynamoDB.DocumentClient({ region: "eu-central-1" })

export async function handler(event: HttpRequest): Promise<HttpResponse> {
  const userId = event.pathParameters['userId']
  const params = {
    TableName: process.env.BASKET_TABLE!,
    Key: {
      userId
    },
  }

  try {
    const data = await ddb.get(params).promise()
    if (data.Item) {
      const basket = data.Item as Basket
      basket.products = await Promise.all(basket.products.map(async basketProduct => {
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
      }))
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true',
        },
        body: JSON.stringify(basket) //das geht dann mit den fehlenden productinfos ans frontend und dann kann dieses den warenorb richtig anzeigen
      }
    }
    return {
      statusCode: 200,
      body: JSON.stringify({
        userId,
        products: []
      })
    }
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      body: "Internal Server Error Oops" + err
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
