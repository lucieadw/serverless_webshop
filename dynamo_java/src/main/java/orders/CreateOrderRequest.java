package orders;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.amazonaws.services.sns.AmazonSNS;
import com.amazonaws.services.sns.AmazonSNSClientBuilder;
import com.google.gson.Gson;
import orders.forms.Order;
import orders.forms.OrderRequestForm;

import java.util.UUID;

public class CreateOrderRequest implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    private final AmazonSNS sns = AmazonSNSClientBuilder.standard().build();
    OrderRequestForm form;

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
        try {
            form = new Gson().fromJson(input.getBody(), OrderRequestForm.class);
        } catch (Exception ex) {
            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(400)
                    .withBody(ex.toString());
        }

        var order = new Order(input.getPathParameters().get("userId"), UUID.randomUUID().toString(), form.getName(), form.getEmail(),
                form.getStreet(), form.getHousenr(), form.getPostcode(), form.getCity(), form.getProducts());
        try {
            sns.publish(System.getenv("ORDER_TOPIC"), new Gson().toJson(order));
        } catch (Exception ex) {
            ex.printStackTrace();
            return new APIGatewayProxyResponseEvent()
                    .withStatusCode(500)
                    .withBody(ex.getMessage());
        }

        return new APIGatewayProxyResponseEvent()
                .withStatusCode(200)
                .withBody(new Gson().toJson("Order abgelegt, Status pending"));
    }
}
