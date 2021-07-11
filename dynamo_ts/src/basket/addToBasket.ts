import { DynamoDB } from 'aws-sdk';
import { HttpRequest, HttpResponse } from '../http'
import { Basket, BasketProduct, SimpleProduct, validateSimpleProduct } from './forms';

const ddb = new DynamoDB.DocumentClient({ region: "eu-central-1" })

export async function handler(event: HttpRequest): Promise<HttpResponse> {
  const simpleProduct: SimpleProduct = JSON.parse(event.body)
  const validationErr = validateSimpleProduct(simpleProduct)

  if (validationErr) {
    return {
      statusCode: 400,
      body: validationErr
    }
  }

  
  try {
    const updatedBasket = await addToBasket(event.pathParameters['userId'], simpleProduct)
    const params = {
      TableName: process.env.BASKET_TABLE!,
      Item: updatedBasket
    }
    const data = await ddb.put(params).promise()
    if (data.Attributes) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true',
        },
        body: JSON.stringify(data.Attributes)
      }
    }
    return {
      statusCode: 404,
      body: "Item not found"
    }
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      body: "Internal Server Error Oops: " + err
    }
  }
}

async function addToBasket(userId: string, product: SimpleProduct): Promise<Basket> {
  const params = {
    TableName: process.env.BASKET_TABLE!,
    Key: {
      userId
    }
  }
  const data = await ddb.get(params).promise()
  const basket = data.Item ? data.Item as Basket : { userId, products: [] }
  const e = basket.products.find(element => element.category === product.category && element.productId === product.productId);
  if (e) {
    e.amount = e.amount + 1
  } else {
    basket.products.push({
      category: product.category,
      productId: product.productId,
      amount: 1
    })
  }
  return basket
}
