package orders.forms;

import lombok.Data;
import lombok.NonNull;

import java.util.List;

@Data
public class Order {
    @NonNull
    String userId;
    @NonNull
    String orderNo;
    @NonNull
    String name;
    @NonNull
    String email;
    @NonNull
    String street;
    @NonNull
    String housenr;
    @NonNull
    String postcode;
    @NonNull
    String city;
    @NonNull
    List<OrderProduct> products;
}
