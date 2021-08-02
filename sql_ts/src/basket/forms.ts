export interface SimpleProduct {
  category: string
  productId: string
}

export interface BasketProduct {
  category: string
  productId: string
  amount: number
}

export interface Basket {
  userId: string
  products: BasketProduct[];
}

export interface Product {
  productId: string
  category: string
  stock: number
  price: number
  name: string
  description: string
  picture: string
}

export function validateSimpleProduct(product: SimpleProduct): string | undefined {
  //category und productId
  if (!product.category || typeof product.category !== 'string') {
    return "Category cannot be null and must be string"
  }
  if (!product.productId || typeof product.productId !== 'string') {
    return "ProductId cannot be null and must be string"
  }
}
export function validateBasketProduct(product: BasketProduct): string | undefined {
  if (product.amount === undefined || product.amount < 0) {
    return "At least one entry invalid: amount must be number >= 0"
  }
  //category und productId
  if (!product.category || typeof product.category !== 'string') {
    return "Category cannot be null and must be string"
  }
  if (!product.productId || typeof product.productId !== 'string') {
    return "ProductId cannot be null and must be string"
  }
}

