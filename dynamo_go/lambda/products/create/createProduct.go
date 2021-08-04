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

func Handler(event events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {
	ddb := dynamodb.New(session.New())

	var product forms.Product
	if err := json.Unmarshal([]byte(event.Body), &product); err != nil {
		return apigw.CreateResponse(500, err.Error()), err
	}

	item, err := dynamodbattribute.MarshalMap(product)
	if err != nil {
		return apigw.CreateResponse(500, err.Error()), err
	}

	_, err = ddb.PutItem(&dynamodb.PutItemInput{
		TableName: aws.String(os.Getenv("PRODUCTS_TABLE")), //aws.String macht wert zu einem  pointer
		Item:      item,
	})
	if err != nil {
		return apigw.CreateResponse(500, err.Error()), err
	}

	return apigw.CreateResponse(201, event.Body), err
}

func main() {
	lambda.Start(Handler)
}
