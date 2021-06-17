import { SQS } from 'aws-sdk';
import { HttpRequest, HttpResponse } from '../http'
import { v4 as uuidv4 } from 'uuid';
import { CreateOrderRequest, validateOrderRequest } from './forms';
// Create SQS service client
const sqs = new SQS({ apiVersion: '2012-11-05' });

const accountId = '243037674803';
const queueName = 'OrderQueue';

export async function handler(event: HttpRequest): Promise<HttpResponse> {
  const form: CreateOrderRequest = JSON.parse(event.body)
  const validationErr = validateOrderRequest(form)

  if (validationErr) {
    return {
      statusCode: 400,
      body: validationErr
    }
  }

  // Setup the sendMessage parameter object
  const params = {
    MessageBody: JSON.stringify({
      userId: event.requestContext.authorizer.claims.username,
      orderNo: uuidv4(),
      name: form.name,
      email: form.email,
      street: form.street,
      housenr: form.housenr,
      postcode: form.postcode,
      sum: form.sum,
      products: form.products
    }),
    QueueUrl: `https://sqs.eu-central-1.amazonaws.com/${accountId}/${queueName}`
  }

  try {
    const data = await sqs.sendMessage(params).promise()
    console.log("Successfully added message", data.MessageId);
  } catch (err) {
    console.error("Error", err);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
      },
      body: JSON.stringify(err)
    }
  }

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
    },
    body: 'Order abgelegt'
  }
}
