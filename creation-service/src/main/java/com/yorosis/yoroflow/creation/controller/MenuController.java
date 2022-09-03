package com.yorosis.yoroflow.creation.controller;

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
import com.yorosis.yoroapps.menu.vo.WorkflowReportMenuVo;
import com.yorosis.yoroapps.vo.ExistsCheckVO;
import com.yorosis.yoroapps.vo.PageVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.exception.YoroappsException;
import com.yorosis.yoroflow.creation.menu.service.MenuDetailsService;
import com.yorosis.yoroflow.creation.menu.service.MenuService;
import com.yorosis.yoroflow.creation.menu.service.WorflowReportMenu;

@RestController
@RequestMapping("/menu/v1/")
public class MenuController {

	@Autowired
	private MenuService menuService;

	@Autowired
	private WorflowReportMenu worflowReportMenu;

	@Autowired
	private MenuDetailsService menuDetailsService;

	@PostMapping("/save")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public ResponseStringVO saveAndUpdateMenu(@RequestBody MenuConfigurationVO vo) throws YoroappsException {
		return menuService.saveMenuConfiguration(vo);
	}

	@GetMapping("/get/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public MenuConfigurationVO getMenuInfo(@PathVariable(name = "id") UUID id) {
		return menuService.getMenuInfo(id);
	}

	@GetMapping("/get-menu/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public MenuConfigurationVO getMenuInfoByApplicationIdentifier(@PathVariable(name = "id") String id) {
		return menuService.getMenuInfoByAppIdentifier(id);
	}

	@GetMapping("/get/page-name/{pageName}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public List<PageVO> getPageName(@PathVariable(name = "pageName") String pageName) {
		return menuDetailsService.getPageName(pageName);
	}

	@GetMapping("/get/parent-menu-names/{menuName}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public List<MenuDetailsVO> getParentName(@PathVariable(name = "menuName") String menuName) {
		return menuDetailsService.getParentMenuNames(menuName);
	}

	@GetMapping("/remove/parent-menu/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public ExistsCheckVO removeParentMenu(@PathVariable(name = "id") UUID id) {
		return menuService.removeParentMenu(id);
	}

	@GetMapping("/check-menu/{applicationId}/{orientation}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public ExistsCheckVO checkApplicationMenu(@PathVariable(name = "applicationId") UUID id,
			@PathVariable(name = "orientation") String menuOrientation) {
		return menuService.checkMenuExistingInApplication(id, menuOrientation);
	}

	@GetMapping("/check-menu/{menuName}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public ResponseStringVO checkTableName(@PathVariable(name = "menuName") String menuName) {
		return menuService.checkMenuName(menuName);

	}

	@PostMapping("add-report-menu-details")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public ResponseStringVO addReportMenuDetails(@RequestBody WorkflowReportMenuVo vo) {
		return worflowReportMenu.saveWorkflowReportMenu(vo);

	}
}
