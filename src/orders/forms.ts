export interface OrderProduct {
  category: string
  productId: string
  name: string
  description: string
  price: number
  stock: number
  picture: string
  amount: number
}


export interface Order {
  userId: string //sort key
  orderNo: string //partition key
  name: string
  email: string
  street: string
  housenr: string
  postcode: string
  products: OrderProduct[]
  sum: number
}

export interface CreateOrder {
  name: string
  email: string
  street: string
  housenr: string
  postcode: string
  products: OrderProduct[]
  sum: number
}


export function validateOrder(form: CreateOrder): string | undefined {
  if (!form.name || typeof form.name !== 'string') {
    return "Name must be type string and cannot be null"
  }
  if (form.sum <= 0) {
    return "Summed up Price must be type number and greater than 0"
  }
  if (!form.products) {
    return "Products cannot be null"
  }
  if (!form.street || typeof form.street !== 'string') {
    return "Street must be type string and cannot be null"
  }
  if (!form.housenr || typeof form.housenr !== 'string') {
    return "E-Mail must be type string and cannot be null"
  }
  if (!form.postcode || typeof form.postcode !== 'string') {
    return "E-Mail must be type string and cannot be null"
  }
  if (!form.email || typeof form.email !== 'string') {
    return "E-Mail must be type string and cannot be null"
  }
}