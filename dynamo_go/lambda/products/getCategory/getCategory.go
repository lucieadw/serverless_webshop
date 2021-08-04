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
		TableName:              aws.String(os.Getenv("PRODUCTS_TABLE")), //aws.String macht wert zu einem pointer
		KeyConditionExpression: aws.String("category = :category"),
		ExpressionAttributeValues: map[string]*dynamodb.AttributeValue{
			":category": {
				S: aws.String(event.PathParameters["category"]),
			},
		},
	})

	if err != nil {
		return apigw.CreateResponse(500, err.Error()), err
	}

	if len(out.Items) > 0 {
		var products []*forms.Product
		for _, i := range out.Items {
			var product forms.Product
			if err := dynamodbattribute.UnmarshalMap(i, &product); err != nil {
				return apigw.CreateResponse(500, err.Error()), err
			}
			products = append(products, &product)
		}

		jsonStr, err := json.Marshal(products)
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
