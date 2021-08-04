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

	var simpleProduct forms.SimpleProduct
	if err := json.Unmarshal([]byte(event.Body), &simpleProduct); err != nil {
		return apigw.CreateResponse(500, err.Error()), err
	}

	basket, err := addToBasket(userId, simpleProduct, ddb)
	if err != nil {
		return apigw.CreateResponse(500, err.Error()), err
	}

	item, err := dynamodbattribute.MarshalMap(basket)
	if err != nil {
		return apigw.CreateResponse(500, err.Error()), err
	}

	_, err = ddb.PutItem(&dynamodb.PutItemInput{
		TableName: aws.String(os.Getenv("BASKET_TABLE")), //aws.String macht wert zu einem  pointer
		Item:      item,
	})

	if err != nil {
		return apigw.CreateResponse(500, err.Error()), err
	}

	return apigw.CreateResponse(200, "Added one of "+event.Body+" to basket"), err
}

func addToBasket(id string, product forms.SimpleProduct, ddb *dynamodb.DynamoDB) (*forms.Basket, error) {
	basket := new(forms.Basket)
	out, err := ddb.GetItem(&dynamodb.GetItemInput{
		TableName: aws.String(os.Getenv("BASKET_TABLE")), //aws.String macht wert zu einem pointer
		Key: map[string]*dynamodb.AttributeValue{
			"userId": {S: aws.String(id)},
		},
	})
	if err != nil {
		return basket, err
	}
	//if basket is present - unmarshal and search for product
	productAlreadyThere := false
	if len(out.Item) > 0 {
		if err := dynamodbattribute.UnmarshalMap(out.Item, basket); err != nil {
			return basket, err
		}
		for i, p := range basket.Products {
			if p.ProductId == product.ProductId && p.Category == product.Category {
				productAlreadyThere = true
				basket.Products[i].Amount += 1
			}
		}
	}
	if !productAlreadyThere {
		basketProduct := new(forms.BasketProduct)
		basketProduct.ProductId = product.ProductId
		basketProduct.Category = product.Category
		basketProduct.Amount = 1
		basket.UserId = id
		basket.Products = append(basket.Products, basketProduct)
	}
	return basket, nil
}

func main() {
	lambda.Start(Handler)
}
