package orders.forms;

import lombok.Data;
import lombok.NonNull;

import java.util.List;

@Data
public class OrderRequestForm {

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
