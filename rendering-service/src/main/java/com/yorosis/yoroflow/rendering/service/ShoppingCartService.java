package com.yorosis.yoroflow.rendering.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroapps.entities.ShoppingCart;
import com.yorosis.yoroapps.vo.ShoppingCartVO;
import com.yorosis.yoroflow.rendering.constants.YoroappsConstants;
import com.yorosis.yoroflow.rendering.repository.ShoppingCartRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class ShoppingCartService {

	@Autowired
	private ShoppingCartRepository shoppingCartRepository;

	private ShoppingCartVO constructDTOToVO(ShoppingCart shoppingCart) {
		return ShoppingCartVO.builder().shoppingCartId(shoppingCart.getId())
				.shoppingCartName(shoppingCart.getCartName()).shoppingCartlabel(shoppingCart.getCartLabel())
				.shoppingCartJson(shoppingCart.getCartData()).build();
	}

	@Transactional
	public ShoppingCartVO getShoppingCartDetails(String name) {
		ShoppingCart shoppingCart = shoppingCartRepository.getShoppingCartByName(name,
				YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		if (shoppingCart != null) {
			return constructDTOToVO(shoppingCart);
		}
		return ShoppingCartVO.builder().build();
	}

}
