package forms

type Product struct {
	Category    string  `json:"category"`  //sort key
	ProductId   string  `json:"productId"` //partition key
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	Stock       int     `json:"stock"`
	Picture     string  `json:"picture"`
}

type OrderProduct struct {
	Product
	Amount int `json:"amount"`
}

type Order struct {
	UserId      string          `json:"userId"`  //sort key
	OrderNo     string          `json:"orderNo"` //partition key
	Name        string          `json:"name"`
	Email       string          `json:"email"`
	Street      string          `json:"street"`
	Housenr     string          `json:"housenr"`
	Postcode    string          `json:"postcode"`
	City        string          `json:"city"`
	Products    []*OrderProduct `json:"products"`
	Sum         float64         `json:"sum"`
	OrderStatus string          `json:"orderStatus"`
}

type CreateOrder struct {
	Name     string          `json:"name"`
	Email    string          `json:"email"`
	Street   string          `json:"street"`
	Housenr  string          `json:"housenr"`
	Postcode string          `json:"postcode"`
	City     string          `json:"city"`
	Products []*OrderProduct `json:"products"`
}

type OrderRequest struct {
	UserId   *string         `json:"userId"`
	OrderNo  *string         `json:"orderNo"`
	Name     string          `json:"name"`
	Email    string          `json:"email"`
	Street   string          `json:"street"`
	Housenr  string          `json:"housenr"`
	Postcode string          `json:"postcode"`
	City     string          `json:"city"`
	Products []*OrderProduct `json:"products"`
}

type BasketProduct struct {
	Category  string `json:"category"`
	ProductId string `json:"productId"`
	Amount    int    `json:"amount"`
}

type Basket struct {
	UserId   string           `json:"userId"`
	Products []*BasketProduct `json:"products"`
}

type EnrichedBasket struct {
	UserId   string          `json:"userId"`
	Products []*OrderProduct `json:"products"`
}

type SimpleProduct struct {
	Category  string `json:"category"`
	ProductId string `json:"productId"`
}