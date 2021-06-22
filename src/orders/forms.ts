export enum OrderStatus {
  OutOfStock = 'OutOfStock',
  Canceled = 'Canceled',
  Confirmed = 'Confirmed'
}

export interface Product {
  category: string  //sort key
  productId: string //partition key
  name: string
  description: string
  price: number
  picture: string
}

export interface OrderProduct extends Product {
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
  city: string
  products: OrderProduct[]
  sum: number
  orderStatus: OrderStatus
}

export interface CreateOrderRequest {
  name: string
  email: string
  street: string
  housenr: string
  postcode: string
  city: string
  products: OrderProduct[]
}


export function validateOrderRequest(form: CreateOrderRequest): string | undefined {
  if (!form.name || typeof form.name !== 'string') {
    return "Name must be type string and cannot be null"
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
  if (!form.city || typeof form.city !== 'string') {
    return "E-Mail must be type string and cannot be null"
  }
  if (!form.postcode || typeof form.postcode !== 'string') {
    return "E-Mail must be type string and cannot be null"
  }
  if (!form.email || typeof form.email !== 'string') {
    return "E-Mail must be type string and cannot be null"
  }
  if (form.products.length === 0){
    return "Products cannot be empty"
  }
}