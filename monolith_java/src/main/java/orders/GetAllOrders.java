package orders;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.document.*;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.Gson;

import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

public class GetAllOrders implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    AmazonDynamoDB client = AmazonDynamoDBClientBuilder.standard().build();
    DynamoDB dynamoDB = new DynamoDB(client);
    Table table = dynamoDB.getTable(System.getenv("ORDERS_TABLE"));
    //private final ScanRequest scanRequest = new ScanRequest()
    //        .withTableName(System.getenv("ORDERS_TABLE"));

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
        //get all orders of user from database
        try {
            ItemCollection<QueryOutcome> coll = table.query(new KeyAttribute("userId", input.getPathParameters()
                    .get("userId")));
            var result = StreamSupport.stream(coll.spliterator(), false).map(Item::asMap)
                    .collect(Collectors.toList());
            //ScanResult result = client.scan(scanRequest);
            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(200)
                    .withBody(new Gson().toJson(result));
        } catch (Exception ex) {
            ex.printStackTrace();
            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(500)
                    .withBody(ex.getMessage());
        }
    }
}
