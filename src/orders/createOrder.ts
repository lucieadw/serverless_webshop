import { DynamoDB } from 'aws-sdk';
import { Category } from 'aws-sdk/clients/signer';

import { SqsEvent } from '../sqs';
import { Order, OrderProduct, Product } from './forms';

const ddb = new DynamoDB.DocumentClient({ region: "eu-central-1" })

export async function handler(event: SqsEvent) {
  const [{ body }] = event.Records
  const order = JSON.parse(body) as Order

  const params = {
    TableName: process.env.ORDERS_TABLE!,
    Item: {
      userId: order.userId,
      orderNo: order.orderNo,
      name: order.name,
      email: order.email,
      street: order.street,
      housenr: order.housenr,
      postcode: order.postcode,
      sum: order.sum,
      products: order.products
    }
  }

  // Validate order (check stock etc.)
  const promAry = await Promise.all(order.products.map(p => checkStock(p.category, p.productId, p.amount)))
  const allAvailable = promAry.every(e => e === true)

  if (allAvailable) {
    try {
      await ddb.put(params).promise()
      //update stock
      await updateStock(order.products)
      //send order confirming e-mail to customer
      await emptyBasket(order.userId)
    } catch (err) {
      console.log(err)
      //send apologizing e-mail to customer (due to internal failure)
    }
  } else {
    console.log('Out of Stock')
    // send apologizing e-mail to customer (out of stock)
  }
}

export async function checkStock(category: Category, productId: string, amount: number): Promise<boolean> {
  const params = {
    TableName: process.env.PRODUCTS_TABLE!,
    Key: {
      category: category,
      productId: productId
    },
  }
  const data = await ddb.get(params).promise()
  //if((data.Item.stock - amount) <= 0){
  //alert: reorder neccecary
  //}
  if (data.Item.stock >= amount) {
    return true
  } else {
    return false
  }
}

export async function emptyBasket(userId: string): Promise<any> {
  const params = {
    TableName: process.env.BASKET_TABLE!,
    Key: {
      userId: userId
    },
    UpdateExpression: "set products=:p",
    ExpressionAttributeValues: {
      ":p": [],
    },
    ReturnValues: "ALL_NEW"
  }
  return ddb.update(params).promise()
}

export async function updateStock(products: OrderProduct[]): Promise<any> {
  return Promise.all(products.map(p => {
    const params = {
      TableName: process.env.PRODUCTS_TABLE!,
      Key: {
        category: p.category,
        productId: p.productId
      },
      UpdateExpression: "set stock=stock-:a",
      ExpressionAttributeValues: {
        ":a": p.amount,

      },
      ReturnValues: "UPDATED_NEW"
    }
    return ddb.update(params).promise()
  }))
}