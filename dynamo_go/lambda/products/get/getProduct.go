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

	out, err := ddb.GetItem(&dynamodb.GetItemInput{
		TableName: aws.String(os.Getenv("PRODUCTS_TABLE")), //aws.String macht wert zu einem  pointer
		Key: map[string]*dynamodb.AttributeValue{
			"category":  {S: aws.String(event.PathParameters["category"])},
			"productId": {S: aws.String(event.PathParameters["id"])},
		},
	})
	if err != nil {
		return apigw.CreateResponse(500, err.Error()), err
	}

	if len(out.Item) > 0 {
		var product forms.Product
		if err := dynamodbattribute.UnmarshalMap(out.Item, &product); err != nil {
			return apigw.CreateResponse(500, err.Error()), err
		}
		jsonStr, err := json.Marshal(product)
		if err != nil {
			return apigw.CreateResponse(500, err.Error()), err
		}
		return apigw.CreateResponse(200, string(jsonStr)), err
	}
	return apigw.CreateResponse(404, "Not found"), err
}

func main() {
	lambda.Start(Handler)
}
