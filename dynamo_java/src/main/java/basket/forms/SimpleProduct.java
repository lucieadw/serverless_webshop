package basket.forms;

import lombok.Data;
import lombok.NonNull;

@Data
public class SimpleProduct {
    @NonNull
    String productId;
    @NonNull
    String category;
}
