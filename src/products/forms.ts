export interface CreateProduct {
  category: string  //sort key
  productId: string //partition key
  name: string
  description: string
  price: number
  stock: number
  picture: string
}

export interface Product {
  category: string  //sort key
  productId: string //partition key
  name: string
  description: string
  price: number
  stock: number
  picture: string
}

export function validateCreateProduct(form: CreateProduct): string | undefined {
  if (!form.productId || typeof form.productId !== 'string') {
    return "ProductID must be type string and cannot be null"
  }
  if (!form.name || typeof form.name !== 'string') {
    return "Name must be type string and cannot be null"
  }
  if (form.price <= 0) {
    return "Price must be type number and greater than 0"
  }
  if (typeof form.description !== 'string') {
    return "Description must be type string"
  }
  if (form.stock < 0) {
    return "Stock must be zero or more"
  }
  if (!form.category || typeof form.category !== 'string'){
    return "Category must be type string and cannot be null"
  }
  if(typeof form.picture !== 'string') {
    return "Picture must be type string"
  }
}
export function validateUpdateProduct(form: CreateProduct): string | undefined {
  if (!form.name || typeof form.name !== 'string') {
    return "Name must be type string and cannot be null"
  }
  if (form.price <= 0) {
    return "Price must be type number and greater than 0"
  }
  if (typeof form.description !== 'string') {
    return "Description must be type string"
  }
  if (form.stock < 0) {
    return "Stock must be zero or more"
  }
  if(typeof form.picture !== 'string') {
    return "Picture must be type string"
  }
}