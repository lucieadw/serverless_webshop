import { DynamoDB } from 'aws-sdk';
import { HttpRequest, HttpResponse } from '../http'

import { CreateProduct, validateCreateProduct } from './forms';

const ddb = new DynamoDB.DocumentClient({ region: "eu-central-1" })

export async function handler(event: HttpRequest): Promise<HttpResponse> {
  const form: CreateProduct = JSON.parse(event.body)
  const validationErr = validateCreateProduct(form)

  if (validationErr) {
    return {
      statusCode: 400,
      body: validationErr
    }
  }

  const params = {
    TableName: process.env.PRODUCTS_TABLE!,
    Item: {
      productId: form.productId,
      name: form.name,
      description: form.description,
      price: form.price,
      stock: form.stock,
      category: form.category,
      picture: form.picture
    }
  }

  try {
    await ddb.put(params).promise()
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
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