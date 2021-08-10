package royalplants.domain.basket;

import com.amazonaws.services.dynamodbv2.document.Item;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import royalplants.domain.basket.forms.Basket;
import royalplants.domain.basket.forms.BasketProduct;
import royalplants.domain.basket.forms.EnrichedBasket;
import royalplants.domain.basket.forms.SimpleProduct;
import royalplants.domain.orders.forms.OrderProduct;
import royalplants.domain.products.ProductService;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BasketService {
    private final BasketRepository basketRepository;
    private final ProductService productService;

    public String addToBasket(String userId, SimpleProduct product) {
        var newBasket = addProduct(userId, product);
        basketRepository.putItem(newBasket);
        return "Produkt Hinzugefügt";
    }

    public EnrichedBasket getBasket(String userId) {
        EnrichedBasket basket;
        var optionalBasket = basketRepository.findById(userId);
        basket = optionalBasket.map(b -> enrichProducts(b, productService)).orElseGet(() -> new EnrichedBasket(userId, List.of()));
        return basket;
    }

    private EnrichedBasket enrichProducts(Basket basket, ProductService productService) {
        var enrichedProducts = basket.getProducts().stream()
                .map(p -> {
                    var product = productService.getProduct(p.getCategory(), p.getProductId())
                            .orElseThrow(RuntimeException::new);
                    return new OrderProduct(p.getCategory(), p.getProductId(), product.getName(), product.getDescription(),
                            product.getPrice(), product.getPicture(), p.getAmount());
                })
                .collect(Collectors.toList());
        return new EnrichedBasket(basket.getUserId(), enrichedProducts);
    }

    private Item addProduct(String userId, SimpleProduct product) {

        var basketItem = basketRepository.findById(userId);

        //basket not yet present
        if (basketItem.isEmpty()) {
            return new Item().withString("userId", userId)
                    .withList("products", List.of(new BasketProduct(product.getCategory(), product.getProductId(), 1).asMap()));
        } else {
            var products = basketItem.get().getProducts();
            var optionalProd = products.stream()
                    .filter(p -> p.getCategory().equals(product.getCategory()) && p.getProductId().equals(product.getProductId()))
                    .findAny();
            if (optionalProd.isPresent()) {
                //increase amount of existing product
                var prod = optionalProd.get();
                prod.setAmount(prod.getAmount() + 1);
            } else {
                //add new product with amount 1
                products.add(new BasketProduct(product.getCategory(), product.getProductId(), 1));
            }

            return new Item().withString("userId", userId)
                    .withList("products", products.stream().map(BasketProduct::asMap).collect(Collectors.toList()));
        }
    }

    public void clearBasket(String userId) {
        basketRepository.clearBasket(userId);
    }

}
