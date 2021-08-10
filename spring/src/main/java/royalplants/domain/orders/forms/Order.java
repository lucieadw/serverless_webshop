package royalplants.domain.orders.forms;

import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBTable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@DynamoDBTable(tableName = "Orders")
@Setter
@Getter
@AllArgsConstructor
public class Order {
    String userId;
    String orderNo;
    String name;
    String email;
    String street;
    String housenr;
    String postcode;
    String city;
    float sum;
    String orderStatus;
    List<OrderProduct> products;


}
