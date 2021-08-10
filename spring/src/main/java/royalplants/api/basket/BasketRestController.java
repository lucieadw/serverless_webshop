package royalplants.api.basket;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import royalplants.domain.basket.BasketService;
import royalplants.domain.basket.forms.EnrichedBasket;
import royalplants.domain.basket.forms.SimpleProduct;

@RestController
@RequestMapping("/baskets")
@RequiredArgsConstructor
public class BasketRestController {
    private final BasketService basketService;

    @GetMapping("/{userId}")
    public EnrichedBasket getBasket(@PathVariable("userId") String userId) {
        return basketService.getBasket(userId);
    }

    @PutMapping("/{userId}/add")
    public String addToBasket(@PathVariable("userId") String userId, @RequestBody SimpleProduct body) {
        return basketService.addToBasket(userId, body);
    }
}
