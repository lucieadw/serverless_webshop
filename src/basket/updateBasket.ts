import { DynamoDB } from 'aws-sdk';
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

  const enrichedBasket = await enrichBasket(updatedBasket)
  
  try {
    const data = await ddb.update(params).promise()
    if (data.Attributes) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true',
        },
        body: JSON.stringify(enrichedBasket)
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
  })) //baut aus den beiden ein neues kombiniertes objekt WIE SOLL STOCK DA RAUS?
  return basket
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