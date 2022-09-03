package com.yorosis.yoroflow.rendering.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroapps.entities.Menu;
import com.yorosis.yoroapps.entities.MenuDetails;
import com.yorosis.yoroapps.entities.WorkflowReport;
import com.yorosis.yoroapps.menu.vo.MenuConfigurationVO;
import com.yorosis.yoroapps.menu.vo.MenuDetailsVO;
import com.yorosis.yoroapps.vo.GroupVO;
import com.yorosis.yoroapps.vo.ResolvedSecurityForPageVO;
import com.yorosis.yoroapps.vo.UsersVO;
import com.yorosis.yoroflow.rendering.constants.YoroappsConstants;
import com.yorosis.yoroflow.rendering.repository.MenuConfigurationRepository;
import com.yorosis.yoroflow.rendering.repository.MenuDetailsRepository;
import com.yorosis.yoroflow.rendering.repository.UserAssociateRolesRepository;
import com.yorosis.yoroflow.rendering.repository.WorkflowReportRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class MenuService {

	@Autowired
	private MenuConfigurationRepository menuConfigurationRepo;

	@Autowired
	private MenuDetailsRepository menuDetailsRepo;

	@Autowired
	private PageSecurityService pageSecurityService;

	@Autowired
	private WorkflowReportRepository workflowReportRepository;

	@Autowired
	private UserService userService;

	@Autowired
	private UserAssociateRolesRepository userAssociateRolesRepository;

	@PersistenceContext
	private EntityManager em;

	private static final String YORO_ADMIN_MENU_ID = "4c98b424-ff35-4c27-894d-9fc6d9d49cc4";
	private static final String WORKFLOW_REPORT_MENU_ID = "52be1d92-34f1-4678-b4a7-f76386ab61d5";

	private MenuConfigurationVO constructMenuConfigurationDTOTOVO(Menu menu) {
		return MenuConfigurationVO.builder().menuId(menu.getMenuId()).menuName(menu.getMenuName())
				.menuOrientation(menu.getMenuOrientation()).collapsible(menu.getCollapsible())
				.applicationId(menu.getApplication().getId()).build();
	}

	private MenuDetailsVO constructMenuDetailsDTOTOVO(MenuDetails menu) {
		return MenuDetailsVO.builder().id(menu.getId()).parentMenuId(menu.getParentMenuId())
				.menuName(menu.getMenuName()).displayOrder(menu.getDisplayOrder()).menuPath(menu.getMenuPath())
				.icon(menu.getIcon()).build();
	}

	@Transactional
	public List<MenuDetailsVO> getAllMenuDetails(UUID id) throws IOException {
		List<MenuDetailsVO> list = new ArrayList<>();
		List<MenuDetails> menu = null;
		if (StringUtils.equals(id.toString(), YORO_ADMIN_MENU_ID)) {
			list = getAllMenuDetailsBasedOnRoles(id);
		} else {
			menu = menuDetailsRepo.getAllMenuDetailsList(id, YorosisContext.get().getTenantId(), YoroappsConstants.YES);
			if (menu != null) {
				boolean allowParentMenu = false;
				for (MenuDetails column : menu) {
					boolean addDetails = true;
					if (column.getReportId() != null) {
						addDetails = checkReportMenuPermission(column, addDetails);
					}
					if (addDetails) {
						MenuDetailsVO vo = constructMenuDetailsDTOTOVO(column);
						setMenuDetails(vo, column);
						List<MenuDetails> parentMenuList = menuDetailsRepo.getParentMenuList(column.getId(),
								YorosisContext.get().getTenantId(), YoroappsConstants.YES);
						if (!parentMenuList.isEmpty()) {
							allowParentMenu = setChildMenuList(parentMenuList, vo);
						}

						if (vo.getParentMenuId() == null) {
							ResolvedSecurityForPageVO resolvedPageSecurity = getResolvedPageSecurityVO(column);
							if ((vo.getParentMenuId() == null && resolvedPageSecurity != null
									&& resolvedPageSecurity.isRead() && parentMenuList.isEmpty())
									|| (!parentMenuList.isEmpty() && allowParentMenu)) {
								list.add(vo);
							}
						}
						Collections.sort(list, MenuDetailsVO.DisplayOrderComparator);
					}
				}
			}
		}

		return list;
	}

	private List<MenuDetailsVO> getAllMenuDetailsBasedOnRoles(UUID id) throws IOException {
		UsersVO user = userService.getLoggedInUserDetails();
		List<MenuDetailsVO> list = new ArrayList<>();
		List<MenuDetails> menu = null;
		List<MenuDetails> parentMenuList = null;
		List<UUID> roleIdList = userAssociateRolesRepository.getRolesIdListBasedOnUserId(user.getUserId(),
				YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		menu = menuDetailsRepo.getMenuDetailsByRoles(id, roleIdList, YorosisContext.get().getTenantId(),
				YoroappsConstants.YES);
		if (menu != null) {
			boolean allowParentMenu = false;
			for (MenuDetails column : menu) {
				boolean addDetails = true;
				if (column.getReportId() != null) {
					addDetails = checkReportMenuPermission(column, addDetails);
				}
				if (addDetails) {
					MenuDetailsVO vo = constructMenuDetailsDTOTOVO(column);
					setMenuDetails(vo, column);
					if (StringUtils.equals(WORKFLOW_REPORT_MENU_ID, column.getId().toString())) {
						parentMenuList = menuDetailsRepo.getParentMenuList(column.getId(),
								YorosisContext.get().getTenantId(), YoroappsConstants.YES);
					} else {
						parentMenuList = menuDetailsRepo.getParentMenuListByRoles(id, column.getId(), roleIdList,
								YorosisContext.get().getTenantId(), YoroappsConstants.YES);
					}

					if (!parentMenuList.isEmpty()) {
						allowParentMenu = setChildMenuListByRoles(parentMenuList, vo, id, roleIdList);
					}

					if (vo.getParentMenuId() == null) {
						if ((StringUtils.isNotBlank(vo.getMenuPath()) && vo.getParentMenuId() == null
								&& parentMenuList.isEmpty()) || (!parentMenuList.isEmpty() && allowParentMenu)) {
							list.add(vo);
						}
					}
					Collections.sort(list, MenuDetailsVO.DisplayOrderComparator);
				}
			}
		}
		return list;
	}

	private boolean setChildMenuListByRoles(List<MenuDetails> parentMenuList, MenuDetailsVO vo, UUID id,
			List<UUID> roleIdList) throws IOException {
		boolean isChildMenu = false;
		List<MenuDetailsVO> childMenulist = new ArrayList<>();
		for (MenuDetails childMenu : parentMenuList) {
			boolean addDetails = true;
			boolean allowSecondLevelParentMenu = false;
			if (childMenu.getReportId() != null) {
				addDetails = checkReportMenuPermission(childMenu, addDetails);
			}
			if (addDetails) {
				MenuDetailsVO childMenuVo = constructMenuDetailsDTOTOVO(childMenu);
				setMenuDetails(childMenuVo, childMenu);
				List<MenuDetails> secondLevelparentMenuList = new ArrayList<>();
				if (childMenu.getParentMenuId() != null) {
					childMenuVo.setParentMenu(menuDetailsRepo.getOne(childMenu.getParentMenuId()).getMenuName());
				}
				if (StringUtils.equals(WORKFLOW_REPORT_MENU_ID, childMenu.getId().toString())) {
					secondLevelparentMenuList = menuDetailsRepo.getParentMenuList(childMenu.getId(),
							YorosisContext.get().getTenantId(), YoroappsConstants.YES);
				} else {
					secondLevelparentMenuList = menuDetailsRepo.getParentMenuListByRoles(id,
							childMenu.getId(), roleIdList, YorosisContext.get().getTenantId(), YoroappsConstants.YES);
				}
				
				if (!secondLevelparentMenuList.isEmpty()) {
					allowSecondLevelParentMenu = setChildMenuListByRoles(secondLevelparentMenuList, childMenuVo, id,
							roleIdList);
					if (allowSecondLevelParentMenu) {
						isChildMenu = true;
						childMenulist.add(childMenuVo);
					}
				} else if (StringUtils.isNotBlank(childMenuVo.getMenuPath())) {
					childMenulist.add(childMenuVo);
				}

//				if ((!secondLevelparentMenuList.isEmpty() || isChildMenu)) {
//					if (childMenuVo.getDynamicMenus() == null || !childMenuVo.getDynamicMenus().isEmpty()) {
//				if ((StringUtils.isNotBlank(childMenuVo.getMenuPath()) && childMenuVo.getParentMenuId() == null
//						&& secondLevelparentMenuList.isEmpty())
//						|| (!secondLevelparentMenuList.isEmpty() && allowSecondLevelParentMenu)) {

//				}

//					}
//
//					if (!isChildMenu) {
//						isChildMenu = true;
//					}
			}

		}

		if (!childMenulist.isEmpty()) {
			isChildMenu = true;
			Collections.sort(childMenulist, MenuDetailsVO.DisplayOrderComparator);
			vo.setDynamicMenus(childMenulist);
		}

		return isChildMenu;

	}

	private ResolvedSecurityForPageVO getResolvedPageSecurityVO(MenuDetails column) {
		ResolvedSecurityForPageVO resolvedSecurityVO = null;
		if (column.getPage() != null) {
			resolvedSecurityVO = pageSecurityService.getResolvedPageSecurity(column.getPage().getPageId(),
					column.getPage().getVersion());
		} else if (column.getCustomPage() != null) {
			resolvedSecurityVO = pageSecurityService.getResolvedPageSecurity(column.getCustomPage().getPageId(),
					column.getCustomPage().getVersion());
		}
		return resolvedSecurityVO;
	}

	private boolean setChildMenuList(List<MenuDetails> parentMenuList, MenuDetailsVO vo) throws IOException {
		boolean isChildMenu = false;
		List<MenuDetailsVO> childMenulist = new ArrayList<>();
		for (MenuDetails childMenu : parentMenuList) {
			boolean addDetails = true;
			if (childMenu.getReportId() != null) {
				addDetails = checkReportMenuPermission(childMenu, addDetails);
			}
			if (addDetails) {
				MenuDetailsVO childMenuVo = constructMenuDetailsDTOTOVO(childMenu);
				setMenuDetails(childMenuVo, childMenu);

				if (childMenu.getParentMenuId() != null) {
					childMenuVo.setParentMenu(menuDetailsRepo.getOne(childMenu.getParentMenuId()).getMenuName());
				}

				List<MenuDetails> secondLevelparentMenuList = menuDetailsRepo.getParentMenuList(childMenu.getId(),
						YorosisContext.get().getTenantId(), YoroappsConstants.YES);
				if (!secondLevelparentMenuList.isEmpty()) {
					boolean allowSecondLevelParentMenu = setChildMenuList(secondLevelparentMenuList, childMenuVo);
					if (allowSecondLevelParentMenu) {
						isChildMenu = true;
					}
				}

				ResolvedSecurityForPageVO resolvedPageSecurity = getResolvedPageSecurityVO(childMenu);
				if ((resolvedPageSecurity != null && resolvedPageSecurity.isRead())
						|| (!secondLevelparentMenuList.isEmpty() && isChildMenu)) {
					if (childMenuVo.getDynamicMenus() == null || !childMenuVo.getDynamicMenus().isEmpty()) {
						childMenulist.add(childMenuVo);
					}

					if (!isChildMenu) {
						isChildMenu = true;
					}
				}

			}
		}
		Collections.sort(childMenulist, MenuDetailsVO.DisplayOrderComparator);
		vo.setDynamicMenus(childMenulist);

		return isChildMenu;
	}

	private boolean checkReportMenuPermission(MenuDetails childMenu, boolean isReportMenu) throws IOException {
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> userGroupIdsList = getGroupAsUUID(userVO);
		WorkflowReport workflowReport = workflowReportRepository.getWorkFlowReport(childMenu.getReportId(),
				userGroupIdsList, YoroappsConstants.YES, YorosisContext.get().getTenantId());
		if (workflowReport == null) {
			return false;
		} else {
			return true;
		}
	}

	private List<UUID> getGroupAsUUID(UsersVO userVO) {
		List<GroupVO> listGroupVO = userVO.getGroupVOList();

		if (listGroupVO.isEmpty()) {
			return java.util.Collections.emptyList();
		}

		return listGroupVO.stream().map(GroupVO::getGroupId).collect(Collectors.toList());
	}

	private void setMenuDetails(MenuDetailsVO menuVO, MenuDetails menu) {
		if (menu.getPage() != null && menu.getPage().getPageId() != null) {
			menuVO.setPageId(menu.getPage().getPageId());
			menuVO.setPageName(menu.getPage().getPageName());
			menuVO.setVersion(menu.getPage().getVersion());
		} else {
			menuVO.setMenuPath(menu.getMenuPath());
			if (menu.getCustomPage() != null) {
				menuVO.setCustomPageId(menu.getCustomPage().getId());
				menuVO.setVersion(menu.getCustomPage().getVersion());
			}
		}
		if (menu.getReportId() != null && StringUtils.equals(menu.getActiveFlag(), "Y")) {
			menuVO.setReportId(menu.getReportId());
		}
	}

	public MenuConfigurationVO getMenuInfoByAppIdentifier(String id) {
		Menu menu = menuConfigurationRepo.getMenuByApplicationIdentifier(id, YoroappsConstants.YES,
				YorosisContext.get().getTenantId());
		if (menu != null) {
			return constructMenuConfigurationDTOTOVO(menu);
		}
		return null;
	}

	private MenuConfigurationVO construcVOToDTO(Menu menu) {
		return MenuConfigurationVO.builder().menuId(menu.getMenuId()).menuName(menu.getMenuName()).build();
	}

	private MenuConfigurationVO construcVOToDTO(MenuDetails menuDetails) {
		return MenuConfigurationVO.builder().menuName(menuDetails.getMenuName()).build();
	}

	@Transactional
	public List<MenuConfigurationVO> getList() {
		List<MenuConfigurationVO> list = new ArrayList<>();
		List<Menu> menuList = menuConfigurationRepo.getMenuListWithManageFlag(YoroappsConstants.YES,
				YorosisContext.get().getTenantId(), YoroappsConstants.NO);
		for (Menu menu : menuList) {
			list.add(construcVOToDTO(menu));
		}
		return list;
	}

	@Transactional
	public List<MenuConfigurationVO> getMenuList(String menuNameList) {
		List<MenuConfigurationVO> list = new ArrayList<>();
		List<String> menuNames = new ArrayList<>(Arrays.asList(menuNameList.split(",")));
		List<MenuDetails> menuList = menuDetailsRepo.getMenuList(menuNames, YorosisContext.get().getTenantId(),
				YoroappsConstants.YES);
		for (MenuDetails menudDetails : menuList) {
			list.add(construcVOToDTO(menudDetails));
		}
		return list;
	}

}
