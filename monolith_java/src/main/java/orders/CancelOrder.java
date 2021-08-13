package orders;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.Table;
import com.amazonaws.services.dynamodbv2.document.spec.UpdateItemSpec;
import com.amazonaws.services.dynamodbv2.document.utils.ValueMap;
import com.amazonaws.services.dynamodbv2.model.ReturnValue;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.Gson;
import orders.forms.OrderStatus;

public class CancelOrder implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    AmazonDynamoDB client = AmazonDynamoDBClientBuilder.standard().build();
    DynamoDB dynamoDB = new DynamoDB(client);
    Table table = dynamoDB.getTable(System.getenv("ORDERS_TABLE"));

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {

        UpdateItemSpec updateItemSpec = new UpdateItemSpec()
                .withPrimaryKey("userId", input.getPathParameters().get("userId"),
                        "orderNo", input.getPathParameters().get("orderNo"))
                .withReturnValues(ReturnValue.ALL_NEW)
                .withUpdateExpression("set orderStatus=:s")
                .withValueMap(new ValueMap().withString(":s", OrderStatus.Canceled.toString()));

        try {
            table.updateItem(updateItemSpec);
        } catch (Exception ex) {
            ex.printStackTrace();
            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(500)
                    .withBody(ex.getMessage());
        }
        return new APIGatewayProxyResponseEvent()
                .withStatusCode(200)
                .withBody(new Gson().toJson("Order Canceled"));
    }
}
