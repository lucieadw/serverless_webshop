export interface CreateProduct {
  name: string
  description: string
  price: number
  stock: number
}

export function validateCreateProduct(form: CreateProduct): string | undefined {
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
}
