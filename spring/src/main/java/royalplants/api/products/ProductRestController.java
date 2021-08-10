package royalplants.api.products;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import royalplants.domain.products.forms.Product;
import royalplants.domain.products.ProductService;

import java.util.List;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductRestController {
    private final ProductService productService;

    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/{category}")
    public List<Product> getProduct(@PathVariable("category") String category) {
        return productService.getCategory(category);
    }
    @GetMapping("/{category}/{productId}")
    public Product getProduct(@PathVariable("productId") String productId, @PathVariable("category") String category) {
        return productService.getProduct(category, productId).orElseThrow(() -> new ProductNotFoundException("Product Not Found"));
    }
}
