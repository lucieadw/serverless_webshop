import { HttpRequest, HttpResponse } from '../http'
import { OrderStatus } from './forms';
import mysql from 'mysql2'
import { retry } from '../db/retry';


export async function handler(event: HttpRequest): Promise<HttpResponse> {
  const { userId, orderNo } = event.pathParameters

  const conn = mysql.createConnection({
    host: process.env.DB_URL,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })

  try {
    await conn.promise().query('UPDATE Orders SET OrderStatus = ? WHERE id = ? AND orderNo = ?', [OrderStatus.Canceled, userId, orderNo])
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: 'Order was canceled'
    }
  } catch (err) {
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
