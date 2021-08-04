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
		TableName: aws.String(os.Getenv("ORDERS_TABLE")), //aws.String macht wert zu einem  pointer
		Key: map[string]*dynamodb.AttributeValue{
			"orderNo": {S: aws.String(event.PathParameters["orderNo"])},
			"userId":  {S: aws.String(event.PathParameters["userId"])},
		},
	})
	if err != nil {
		return apigw.CreateResponse(500, err.Error()), err
	}

	if len(out.Item) > 0 {
		var order forms.Order
		if err := dynamodbattribute.UnmarshalMap(out.Item, &order); err != nil {
			return apigw.CreateResponse(500, err.Error()), err
		}
		jsonStr, err := json.Marshal(order)
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
