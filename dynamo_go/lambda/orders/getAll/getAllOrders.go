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

	out, err := ddb.Query(&dynamodb.QueryInput{
		TableName:              aws.String(os.Getenv("ORDERS_TABLE")), //aws.String macht wert zu einem pointer
		KeyConditionExpression: aws.String("userId = :userId"),
		ExpressionAttributeValues: map[string]*dynamodb.AttributeValue{
			":userId": {
				S: aws.String(event.PathParameters["userId"]),
			},
		},
	})

	if err != nil {
		return apigw.CreateResponse(500, err.Error()), err
	}

	if len(out.Items) > 0 {
		orders := make([]*forms.Order, len(out.Items))
		for i, item := range out.Items {
			order := new(forms.Order)
			if err := dynamodbattribute.UnmarshalMap(item, order); err != nil {
				return apigw.CreateResponse(500, err.Error()), err
			}
			orders[i] = order
		}

		jsonStr, err := json.Marshal(orders)
		if err != nil {
			return apigw.CreateResponse(500, err.Error()), err
		}

		return apigw.CreateResponse(200, string(jsonStr)), err
	}
	return apigw.CreateResponse(200, "[]"), err
}

func main() {
	lambda.Start(Handler)
}
