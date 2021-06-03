export interface UpdateBasket {
  category: string
  productId: string;
  amount: number;
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

export function validateBasketProduct (product: BasketProduct): string | undefined {
  if(product.amount === undefined || product.amount < 0){
    return "At least one entry invalid: amount must be number >= 0"
  }
   //category und productId
  if(!product.category || typeof product.category !== 'string'){
    return "Category cannot be null and must be string"
  }
  if(!product.productId || typeof product.productId !== 'string'){
    return "ProductId cannot be null and must be string"
  }
}

