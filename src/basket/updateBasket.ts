import { DynamoDB } from 'aws-sdk';
import { HttpRequest, HttpResponse } from '../http'
import { Basket, BasketProduct, validateBasketProduct } from './forms';

const ddb = new DynamoDB.DocumentClient({ region: "eu-central-1" })

export async function handler(event: HttpRequest): Promise<HttpResponse> {
  const basketProduct: BasketProduct = JSON.parse(event.body)
  const validationErr = validateBasketProduct(basketProduct)

  if (validationErr) {
    return {
      statusCode: 400,
      body: validationErr
    }
  }

  const updatedBasket = await updateBasket(event.requestContext.authorizer.claims.username, basketProduct)

  const params = {
    TableName: process.env.BASKET_TABLE!,
    Key: {
      userId: event.requestContext.authorizer.claims.username
    },
    UpdateExpression: "set products=:p",
    ExpressionAttributeValues: {
      ":p": updatedBasket.products,
    },
    ReturnValues: "ALL_NEW"
  }

  try {
    const data = await ddb.update(params).promise()
    if (data.Attributes) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
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

async function updateBasket(id: string, product: BasketProduct): Promise<Basket> {
  const params = {
    TableName: process.env.BASKET_TABLE!,
    Key: {
      userId: id
    }
  }
  const data = await ddb.get(params).promise()
  const basket = data.Item as Basket
  const e = basket.products.find(element => element.category === product.category && element.productId === product.productId);
  if (e) {
    e.amount = product.amount
    if (e.amount === 0) {
      basket.products.splice(basket.products.indexOf(e), 1)
    }
  } else {
    basket.products.push(product)
  }
  return basket
}
