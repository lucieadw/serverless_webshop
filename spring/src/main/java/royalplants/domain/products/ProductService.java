package royalplants.domain.products;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import royalplants.domain.orders.forms.OrderProduct;
import royalplants.domain.products.forms.Product;

import java.util.List;
import java.util.Optional;


@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getCategory(String category) {
        return productRepository.findByCategory(category);
    }

    public Optional<Product> getProduct(String category, String productId) {
        return productRepository.findByCategoryAndProductId(category, productId);
    }

    public void reduceStock(OrderProduct p) {
        productRepository.reduceStock(p.getCategory(), p.getProductId(), p.getAmount());
    }

}