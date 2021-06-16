import { DynamoDB } from 'aws-sdk';
import { HttpRequest, HttpResponse } from '../http'

import { CreateOrder, validateOrder } from './forms';

const ddb = new DynamoDB.DocumentClient({ region: "eu-central-1" })
const { v4: uuidv4 } = require('uuid');

export async function handler(event: HttpRequest): Promise<HttpResponse> {
  const form: CreateOrder = JSON.parse(event.body)
  const validationErr = validateOrder(form)

  if (validationErr) {
    return {
      statusCode: 400,
      body: validationErr
    }
  }

  const params = {
    TableName: process.env.ORDERS_TABLE!,
    Item: {
      userId: event.requestContext.authorizer.claims.username,
      orderNo: uuidv4(),
      name: form.name,
      email: form.email,
      street: form.street,
      housenr: form.housenr,
      postcode: form.postcode,
      sum: form.sum,
      products: form.products
    }
  }

  try {
    await ddb.put(params).promise()
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
      },
      body: JSON.stringify(params.Item)
    }
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      body: "Internal Server Error Oops: " + err
    }
  }
}