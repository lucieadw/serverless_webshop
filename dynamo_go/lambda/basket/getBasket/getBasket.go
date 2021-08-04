package main

import (
	"encoding/json"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"
	"os"
	"webshop/internal/apigw"
	"webshop/internal/forms"
)

func Handler(event *events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {
	ddb := dynamodb.New(session.New())

	userId := event.PathParameters["userId"]

	out, err := ddb.GetItem(&dynamodb.GetItemInput{
		TableName: aws.String(os.Getenv("BASKET_TABLE")), //aws.String macht wert zu einem pointer
		Key: map[string]*dynamodb.AttributeValue{
			"userId": {S: aws.String(userId)},
		},
	})

	if err != nil {
		return apigw.CreateResponse(500, err.Error()), err
	}

	if len(out.Item) > 0 {
		basket := new(forms.Basket)
		if err := dynamodbattribute.UnmarshalMap(out.Item, basket); err != nil {
			return apigw.CreateResponse(500, err.Error()), err
		}

		enrichedBasket, err := enrich(basket, ddb)
		if err != nil {
			return apigw.CreateResponse(500, err.Error()), err
		}

		jsonStr, err := json.Marshal(enrichedBasket)
		if err != nil {
			return apigw.CreateResponse(500, err.Error()), err
		}

		return apigw.CreateResponse(200, string(jsonStr)), err
	}
	//empty Basket
	basket := forms.Basket{
		UserId:   userId,
		Products: []*forms.BasketProduct{},
	}
	jsonStr, err := json.Marshal(basket)
	if err != nil {
		return apigw.CreateResponse(500, err.Error()), err
	}
	return apigw.CreateResponse(200, string(jsonStr)), err
}

func enrich(basket *forms.Basket, ddb *dynamodb.DynamoDB) (*forms.EnrichedBasket, error) {
	enrichedBasket := forms.EnrichedBasket{UserId: basket.UserId}
	enrichedProducts := make([]*forms.OrderProduct, len(basket.Products))

	for i, basketProduct := range basket.Products {
		enrichedProduct, err := getWholeProduct(basketProduct, ddb)
		if err != nil {
			return nil, err
		}
		enrichedProducts[i] = enrichedProduct
	}

	enrichedBasket.Products = enrichedProducts
	return &enrichedBasket, nil
}

func getWholeProduct(basketProduct *forms.BasketProduct, ddb *dynamodb.DynamoDB) (*forms.OrderProduct, error) {
	out, err := ddb.GetItem(&dynamodb.GetItemInput{
		TableName: aws.String(os.Getenv("PRODUCTS_TABLE")), //aws.String macht wert zu einem  pointer
		Key: map[string]*dynamodb.AttributeValue{
			"category":  {S: aws.String(basketProduct.Category)},
			"productId": {S: aws.String(basketProduct.ProductId)},
		},
	})
	if err != nil {
		return nil, err
	}

	product := new(forms.OrderProduct)
	if err := dynamodbattribute.UnmarshalMap(out.Item, product); err != nil {
		return nil, err
	}

	product.Amount = basketProduct.Amount
	return product, err
}

func main() {
	lambda.Start(Handler)
}
