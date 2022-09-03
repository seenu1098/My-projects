package com.yorosis.yoroflow.rendering.controller;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroapps.menu.vo.MenuConfigurationVO;
import com.yorosis.yoroapps.menu.vo.MenuDetailsVO;
import com.yorosis.yoroflow.rendering.service.MenuService;

@RestController
@RequestMapping("/menu/v1/")
public class MenuController {

	@Autowired
	private MenuService menuService;

	@GetMapping("/get-menu/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public MenuConfigurationVO getMenuInfoByApplicationIdentifier(@PathVariable(name = "id") String id) {
		return menuService.getMenuInfoByAppIdentifier(id);
	}

	@GetMapping("/get/list/{menuId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public List<MenuDetailsVO> getMenuList(@PathVariable(name = "menuId") String id) throws IOException {
		return menuService.getAllMenuDetails(UUID.fromString(id));
	}

	@GetMapping("/get-menu-list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public List<MenuConfigurationVO> getList() {
		return menuService.getList();
	}

	@PostMapping("/get-org-menu-list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public List<MenuConfigurationVO> getOrgMenuList(@RequestBody String menuNameList) {
		return menuService.getMenuList(menuNameList);
	}

}
