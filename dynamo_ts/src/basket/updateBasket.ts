import { DynamoDB } from 'aws-sdk';
import { PutItemInput } from 'aws-sdk/clients/dynamodb';
import { HttpRequest, HttpResponse } from '../http'
import { Product } from '../orders/forms';

import { Basket, BasketProduct, validateBasketProduct } from './forms';

const ddb = new DynamoDB.DocumentClient({ region: "eu-central-1" })

export async function handler(event: HttpRequest): Promise<HttpResponse> {
  const basketProduct: BasketProduct = JSON.parse(event.body)
  const validationErr = validateBasketProduct(basketProduct)

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

  try {
    const updatedBasket = await updateBasket(event.pathParameters['userId'], basketProduct)
    const params = {
      TableName: process.env.BASKET_TABLE!,
      Item: updatedBasket
    }
    await ddb.put(params).promise()
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(await enrichBasket(updatedBasket))
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

async function enrichBasket(basket: Basket): Promise<Basket> {
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
    }
  })) //baut aus den beiden ein neues kombiniertes objekt
  return basket
}

async function updateBasket(userId: string, updatedProduct: BasketProduct): Promise<Basket> {
  const params = {
    TableName: process.env.BASKET_TABLE!,
    Key: {
      userId
    }
  }
  const data = await ddb.get(params).promise()
  const basket = data.Item ? data.Item as Basket : { userId, products: [] }
  const product = basket.products.find(element => element.category === updatedProduct.category && element.productId === updatedProduct.productId);
  if (product) {
    product.amount = updatedProduct.amount
    if (product.amount === 0) {
      basket.products.splice(basket.products.indexOf(product), 1)
    }
  } else {
    basket.products.push(updatedProduct)
  }
  return basket
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