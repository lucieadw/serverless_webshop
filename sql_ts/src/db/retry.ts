import mysql from 'mysql2'

const connectionOpts = {
  host: process.env.DB_URL,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
}

type MysqlResult = mysql.RowDataPacket[][] | mysql.RowDataPacket[] | mysql.OkPacket | mysql.OkPacket[] | mysql.ResultSetHeader

export async function retry<T extends MysqlResult>(retries: number, query: string, values: any[] = []): Promise<[T, mysql.FieldPacket[]]> {
  try {
    return await mysql.createConnection(connectionOpts).promise().query(query, values)
  } catch (e) {
    if (retries > 0) {
      return new Promise<[T, mysql.FieldPacket[]]>(resolve => {
        setTimeout(async () => resolve(await retry(retries - 1, query, values)), 1000)
      })
    } else {
      throw e
    }
  }
}
