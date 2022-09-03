package com.yorosis.yoroflow.rendering.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroapps.vo.ShoppingCartVO;
import com.yorosis.yoroflow.rendering.service.ShoppingCartService;

@RestController
@RequestMapping("/shopping-cart/v1/")
public class ShoppingCartController {

	@Autowired
	private ShoppingCartService shoppingCartService;

	@GetMapping("get/cart-details/{cartName}")
	@PreAuthorize("@yorosisRoleChecker.canAllow('Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Application Administrator')")
	public ShoppingCartVO getCartDetails(@PathVariable(name = "cartName") String cartName) {
		return shoppingCartService.getShoppingCartDetails(cartName);
	}

}
