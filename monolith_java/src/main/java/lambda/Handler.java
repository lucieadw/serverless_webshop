package lambda;

import basket.AddToBasket;
import basket.GetBasket;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import orders.*;
import products.GetAllProducts;
import products.GetCategory;
import products.GetProduct;

import java.util.List;
import java.util.Map;

public class Handler implements RequestHandler<Map<String, Object>, Object> {

    private static final ObjectMapper mapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    private static final Map<String, Map<String, RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent>>> routes
            = Map.of(
            "/ping", Map.of(
                    "get", new Ping()
            ),
            "/products", Map.of(
                    "get", new GetAllProducts()
            ),
            "/products/{category}", Map.of(
                    "get", new GetCategory()
            ),
            "/products/{category}/{id}", Map.of(
                    "get", new GetProduct()
            ),
            "/baskets/{userId}", Map.of(
                    "get", new GetBasket()
            ),
            "/baskets/{userId}/add", Map.of(
                    "put", new AddToBasket()
            ),
            "/orders/{userId}", Map.of(
                    "get", new GetAllOrders(),
                    "post", new CreateOrderRequest()
            ),
            "/orders/{userId}/{orderNo}", Map.of(
                    "get", new GetOrder(),
                    "delete", new CancelOrder()
            )
    );

    @SuppressWarnings("unchecked")
    @Override
    public Object handleRequest(Map<String, Object> rawEvent, Context context) {
        try {
            if (rawEvent.containsKey("resource")) {
                var event = mapper.convertValue(rawEvent, APIGatewayProxyRequestEvent.class);
                return routes.get(event.getResource()).get(event.getHttpMethod().toLowerCase()).handleRequest(event, context);
            } else if (rawEvent.containsKey("Records")) {
                var records = (List<Map<String, Object>>) rawEvent.get("Records");
                var sns = (Map<String, Object>) records.get(0).get("Sns");
                var message = (String) sns.get("Message");
                new CreateOrder().handleMessage(message);
                return null;
            }
        } catch (Exception e) {
            throw new RuntimeException(String.format("Unexpected event handling: %s", rawEvent.toString()));
        }
        throw new RuntimeException(String.format("Unexpected event type: %s", rawEvent.toString()));
    }

}
