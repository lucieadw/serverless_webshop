import { HttpRequest, HttpResponse } from '../http'
import mysql from 'mysql2'

export async function handler(event: HttpRequest): Promise<HttpResponse> {
  const userId = event.pathParameters['userId']

  const conn = mysql.createConnection({
    host: process.env.DB_URL,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })

  try {
    const [rows, fields] = await conn.promise().query('SELECT * FROM Orders WHERE id = ?', [userId])
    console.log(fields)
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(rows)
    }
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      body: "Internal Server Error Oops" + err
    }
  }
}
