package main

import (
	"encoding/json"
	"fmt"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"
	"os"
	"webshop/internal/forms"
)

func Handler(event events.SNSEvent) error {
	ddb := dynamodb.New(session.New())

	var orderRequest forms.OrderRequest
	if err := json.Unmarshal([]byte(event.Records[0].SNS.Message), &orderRequest); err != nil {
		return err
	}

	item, err := dynamodbattribute.MarshalMap(orderRequest)
	if err != nil {
		return err
	}

	//calculate sum of orderProduct prices
	sum := 0.0
	for _, p := range orderRequest.Products {
		res, err := calcSum(p, ddb)
		if err != nil {
			return err
		}
		sum += res
	}

	sumAttr, err := dynamodbattribute.Marshal(sum)
	if err != nil {
		return err
	}
	item["sum"] = sumAttr

	//check if all products available
	var allAvailable bool
	for _, p := range orderRequest.Products {
		res, err := checkStock(p, ddb)
		if err != nil {
			return err
		}
		allAvailable = res
	}

	if allAvailable {
		item["orderStatus"] = &dynamodb.AttributeValue{S: aws.String("Confirmed")}
		//update Stock
		err := updateStock(orderRequest.Products, ddb)
		if err != nil {
			return err
		}
		//empty Basket
		e := emptyBasket(orderRequest.UserId, ddb)
		if e != nil {
			return e
		}
	} else {
		item["orderStatus"] = &dynamodb.AttributeValue{S: aws.String("OutOfStock")}
	}

	_, err = ddb.PutItem(&dynamodb.PutItemInput{
		TableName: aws.String(os.Getenv("ORDERS_TABLE")), //aws.String macht wert zu einem  pointer
		Item:      item,
	})

	if err != nil {
		return err
	}

	return nil
}

func emptyBasket(id *string, ddb *dynamodb.DynamoDB) error {
	_, err := ddb.UpdateItem(&dynamodb.UpdateItemInput{
		TableName: aws.String(os.Getenv("BASKET_TABLE")), //aws.String macht wert zu einem  pointer
		Key: map[string]*dynamodb.AttributeValue{
			"userId": {S: id},
		},
		UpdateExpression: aws.String("set products=:p"),
		ExpressionAttributeValues: map[string]*dynamodb.AttributeValue{
			":p": {L: []*dynamodb.AttributeValue{}},
		},
		ReturnValues: aws.String("ALL_NEW"),
	})
	if err != nil {
		return err
	}
	return nil
}

func updateStock(products []*forms.OrderProduct, ddb *dynamodb.DynamoDB) error {
	for _, p := range products {
		_, err := ddb.UpdateItem(&dynamodb.UpdateItemInput{
			TableName: aws.String(os.Getenv("PRODUCTS_TABLE")), //aws.String macht wert zu einem  pointer
			Key: map[string]*dynamodb.AttributeValue{
				"category":  {S: aws.String(p.Category)},
				"productId": {S: aws.String(p.ProductId)},
			},
			UpdateExpression: aws.String("set stock=stock-:a"),
			ExpressionAttributeValues: map[string]*dynamodb.AttributeValue{
				":a": {N: aws.String(fmt.Sprint(p.Amount))},
			},
			ReturnValues: aws.String("UPDATED_NEW"),
		})
		if err != nil {
			return err
		}
	}
	return nil
}

func checkStock(p *forms.OrderProduct, ddb *dynamodb.DynamoDB) (bool, error) {
	var product forms.Product
	out, err := ddb.GetItem(&dynamodb.GetItemInput{
		TableName: aws.String(os.Getenv("PRODUCTS_TABLE")), //aws.String macht wert zu einem  pointer
		Key: map[string]*dynamodb.AttributeValue{
			"category":  {S: aws.String(p.Category)},
			"productId": {S: aws.String(p.ProductId)},
		},
	})
	if err != nil {
		return false, err
	}
	if err := dynamodbattribute.UnmarshalMap(out.Item, &product); err != nil {
		return false, err
	}
	return product.Stock >= p.Amount, err
}

func calcSum(p *forms.OrderProduct, ddb *dynamodb.DynamoDB) (float64, error) {
	var product forms.Product
	out, err := ddb.GetItem(&dynamodb.GetItemInput{
		TableName: aws.String(os.Getenv("PRODUCTS_TABLE")), //aws.String macht wert zu einem  pointer
		Key: map[string]*dynamodb.AttributeValue{
			"category":  {S: aws.String(p.Category)},
			"productId": {S: aws.String(p.ProductId)},
		},
	})
	if err != nil {
		return 0.0, err
	}
	if err := dynamodbattribute.UnmarshalMap(out.Item, &product); err != nil {
		return 0.0, err
	}
	return product.Price * float64(p.Amount), err

}

func main() {
	lambda.Start(Handler)
}
