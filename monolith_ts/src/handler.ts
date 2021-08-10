import { HttpRequest, HttpResponse } from './http'
import { SnsEvent } from './sns'
import { handler as productsGetAll } from './products/getAll'
import { handler as productsGetCategory } from './products/getCategory'
import { handler as productsGet } from './products/get'
import { handler as basketGet } from './basket/getBasket'
import { handler as basketAdd } from './basket/addToBasket'
import { handler as ordersGetAll } from './orders/getAllOrders'
import { handler as ordersGet } from './orders/getOrder'
import { handler as ordersCreate } from './orders/createOrderRequest'
import { handler as ordersCancel } from './orders/cancelOrder'
import { handler as snsFunc } from './orders/createOrder'

const routes = {
  '/products': {
    'get': productsGetAll
  },
  '/products/{category}': {
    'get': productsGetCategory
  },
  '/products/{category}/{id}': {
    'get': productsGet
  },
  '/baskets/{userId}': {
    'get': basketGet
  },
  '/baskets/{userId}/add': {
    'put': basketAdd
  },
  '/orders/{userId}': {
    'get': ordersGetAll,
    'post': ordersCreate
  },
  '/orders/{userId}/{orderNo}': {
    'get': ordersGet,
    'delete': ordersCancel
  }
}

export async function handler(event: any): Promise<any> {
  if (event.hasOwnProperty('Records')) {
    return snsFunc(event)
  } else {
    const func = routes[event.resource][event.httpMethod.toLowerCase()]
    return func(event)
  }
}
