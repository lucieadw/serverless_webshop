package basket.forms;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class Basket {
    String userId;
    List<BasketProduct> products;
}
