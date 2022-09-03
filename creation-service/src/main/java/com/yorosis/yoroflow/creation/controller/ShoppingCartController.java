package com.yorosis.yoroflow.creation.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.ShoppingCartVO;
import com.yorosis.yoroflow.creation.service.ShoppingCartService;

@RestController
@RequestMapping("/shopping-cart/v1/")
public class ShoppingCartController {

	@Autowired
	private ShoppingCartService shoppingCartService;

	@PostMapping("save")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public ResponseStringVO save(@RequestBody ShoppingCartVO shoppingCartVO) throws IOException {
		return shoppingCartService.save(shoppingCartVO);
	}

	@GetMapping("get/cart-details/{cartName}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public ShoppingCartVO getCartDetails(@PathVariable(name = "cartName") String cartName) {
		return shoppingCartService.getShoppingCartDetails(cartName);
	}

	@GetMapping("get/cart-name/{cartName}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public List<ShoppingCartVO> getCartNames(@PathVariable(name = "cartName") String cartName) throws IOException {
		return shoppingCartService.getCartName(cartName);
	}

	@GetMapping("get/cart-names")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public List<ShoppingCartVO> getCartNamesList() throws IOException {
		return shoppingCartService.getCartName(null);
	}

	@GetMapping("check/cart-name/{cartName}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public ResponseStringVO checkCartName(@PathVariable(name = "cartName") String cartName) throws IOException {
		return shoppingCartService.checkCartName(cartName);
	}
}
