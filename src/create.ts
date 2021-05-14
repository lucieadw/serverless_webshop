import { DynamoDB } from 'aws-sdk';
import { HttpRequest, HttpResponse } from './http'
import * as uuid from 'uuid'
import { CreateProduct, validateCreateProduct } from './forms';

const ddb = new DynamoDB.DocumentClient({ region: "eu-central-1" })

export async function createProduct(event: HttpRequest): Promise<HttpResponse> {
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
      id: uuid.v4(),
      name: form.name,
      description: form.description,
      price: form.price,
      stock: form.stock
    }
  }

  try {
    await ddb.put(params).promise()
    return {
      statusCode: 201,
      body: JSON.stringify(params.Item)
    }
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      body: "Internal Server Error Oops: " + err
    }
  }
}