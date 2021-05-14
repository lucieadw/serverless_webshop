import { DynamoDB } from 'aws-sdk';
import { CreateProduct, validateCreateProduct } from './forms';
import { HttpRequest, HttpResponse } from './http'

const ddb = new DynamoDB.DocumentClient({ region: "eu-central-1" })

export async function update(event: HttpRequest): Promise<HttpResponse> {
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
    Key: {
      id: event.pathParameters.id,
    },
    UpdateExpression: "set #name=:n, description=:d, price=:p, stock=:s",
    ExpressionAttributeNames: {
      '#name': 'name'
    },
    ExpressionAttributeValues: {
      ":n": form.name,
      ":d": form.description,
      ":p": form.price,
      ":s": form.stock
    },
    ReturnValues: "ALL_NEW"
  }

  try {
    const data = await ddb.update(params).promise()
    if (data.Attributes) {
      return {
        statusCode: 200,
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