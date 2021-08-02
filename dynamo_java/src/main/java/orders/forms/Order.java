package orders.forms;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NonNull;

import java.util.List;

@Data
@AllArgsConstructor
@NonNull
public class Order {
    String userId;
    String orderNo;
    String name;
    String email;
    String street;
    String housenr;
    String postcode;
    String city;
    List<OrderProduct> products;
}
