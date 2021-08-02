import { HttpRequest, HttpResponse } from '../http'

export async function handler(event: HttpRequest): Promise<HttpResponse> {
  const conn = mysql.createConnection({
    host: process.env.DB_URL,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })
  try {
    const [rows, fields] = await conn.promise().query( 'UPDATE Products SET stock = ? WHERE category = ? AND productId = ? ', [100000, event.pathParameters.category, event.pathParameters.id])
    if (rows[0]) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(rows[0])
      }
    }
    return {
      statusCode: 404,
      body: "Item not found"
    }
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      body: "Internal Server Error Oops" + err
    }
  }
}