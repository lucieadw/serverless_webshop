package royalplants.domain.orders.forms;

import lombok.Data;
import lombok.NonNull;
import royalplants.domain.orders.forms.OrderProduct;

import java.util.List;

@Data
public class OrderRequest {
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
