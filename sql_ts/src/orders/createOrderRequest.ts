import { SNS } from 'aws-sdk';
import { HttpRequest, HttpResponse } from '../http'
import { v4 as uuidv4 } from 'uuid';
import { CreateOrderRequest, validateOrderRequest } from './forms';
// Create SNS service client
const sns = new SNS();

export async function handler(event: HttpRequest): Promise<HttpResponse> {
  const form: CreateOrderRequest = JSON.parse(event.body)
  const validationErr = validateOrderRequest(form)

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

  const userId = event.pathParameters['userId']
  // Setup the sendMessage parameter object
  const params: SNS.PublishInput = {
    Message: JSON.stringify({
      userId: userId,
      orderNo: uuidv4(),
      name: form.name,
      email: form.email,
      street: form.street,
      housenr: form.housenr,
      city: form.city,
      postcode: form.postcode,
      products: form.products
    }),
    TopicArn: process.env.ORDER_TOPIC
  }

  try {
    const data = await sns.publish(params).promise()
    console.log("Successfully added message", data.MessageId);
  } catch (err) {
    console.error("Error", err);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(err)
    }
  }

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: 'Order abgelegt, status pending'
  }
}
