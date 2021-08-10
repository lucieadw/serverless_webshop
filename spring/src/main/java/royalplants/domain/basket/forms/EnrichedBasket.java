package royalplants.domain.basket.forms;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NonNull;
import royalplants.domain.orders.forms.OrderProduct;

import java.util.List;

@Data
@AllArgsConstructor
@NonNull
public class EnrichedBasket {
    private String userId;
    private List<OrderProduct> products;


}
