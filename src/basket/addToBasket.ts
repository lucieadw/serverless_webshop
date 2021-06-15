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

  const updatedBasket = await addToBasket(event.requestContext.authorizer.claims.username, simpleProduct)

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

async function addToBasket(id: string, product: SimpleProduct): Promise<Basket> {
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
