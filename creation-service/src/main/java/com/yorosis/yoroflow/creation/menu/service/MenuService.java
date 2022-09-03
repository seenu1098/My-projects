package com.yorosis.yoroflow.creation.menu.service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import com.yorosis.yoroapps.entities.Application;
import com.yorosis.yoroapps.entities.Menu;
import com.yorosis.yoroapps.entities.MenuDetails;
import com.yorosis.yoroapps.entities.Page;
import com.yorosis.yoroapps.menu.vo.MenuConfigurationVO;
import com.yorosis.yoroapps.menu.vo.MenuDetailsVO;
import com.yorosis.yoroapps.vo.ExistsCheckVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.exception.YoroappsException;
import com.yorosis.yoroflow.creation.repository.ApplicationRepository;
import com.yorosis.yoroflow.creation.repository.CustomPagesRepository;
import com.yorosis.yoroflow.creation.repository.MenuConfigurationRepository;
import com.yorosis.yoroflow.creation.repository.MenuDetailsRepository;
import com.yorosis.yoroflow.creation.repository.PageRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class MenuService {

	@Autowired
	private MenuConfigurationRepository menuConfigurationRepo;

	@Autowired
	private CustomPagesRepository customPagesRepository;

	@Autowired
	private ApplicationRepository applicationRepository;

	@Autowired
	private MenuDetailsRepository menuDetailsRepo;

	@Autowired
	private PageRepository pageRepository;

	@PersistenceContext
	private EntityManager em;

	private MenuConfigurationVO constructMenuConfigurationDTOTOVO(Menu menu) {
		return MenuConfigurationVO.builder().menuId(menu.getMenuId()).menuName(menu.getMenuName()).menuOrientation(menu.getMenuOrientation())
				.collapsible(menu.getCollapsible()).applicationId(menu.getApplication().getId()).build();
	}

	private Menu constructMenuVOTODTO(MenuConfigurationVO vo) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());

		return Menu.builder().menuName(vo.getMenuName()).menuOrientation(vo.getMenuOrientation()).collapsible(vo.getCollapsible())
				.tenantId(YorosisContext.get().getTenantId()).createdBy(YorosisContext.get().getUserName()).createdOn(timestamp)
				.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp).activeFlag(YoroappsConstants.YES).managedFlag(YoroappsConstants.NO)
				.build();
	}

	private MenuDetailsVO constructMenuDetailsDTOTOVO(MenuDetails menu) {
		return MenuDetailsVO.builder().id(menu.getId()).parentMenuId(menu.getParentMenuId()).menuName(menu.getMenuName()).menuPath(menu.getMenuPath())
				.displayOrder(menu.getDisplayOrder()).icon(menu.getIcon()).build();
	}

	private MenuDetails constructMenuDetailsVOTODTO(MenuDetailsVO vo) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());

		return MenuDetails.builder().menuName(vo.getMenuName()).tenantId(YorosisContext.get().getTenantId()).menuPath(vo.getMenuPath())
				.createdBy(YorosisContext.get().getUserName()).createdOn(timestamp).displayOrder(vo.getDisplayOrder())
				.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp).activeFlag(YoroappsConstants.YES).build();
	}

	@Transactional
	public MenuConfigurationVO getMenuInfo(UUID id) {
		Menu menu = menuConfigurationRepo.getMenuInfo(id, YoroappsConstants.YES, YorosisContext.get().getTenantId());
		if (StringUtils.equals(menu.getManagedFlag(), YoroappsConstants.YES)) {
			return MenuConfigurationVO.builder().isManaged(true).build();
		} else {
			List<MenuDetailsVO> menuDetailsList = new ArrayList<>();
			MenuConfigurationVO menuConfigurationVo = constructMenuConfigurationDTOTOVO(menu);
			if (menuConfigurationVo.getApplicationId() != null) {
				menuConfigurationVo.setApplicationName(applicationRepository.getOne(menuConfigurationVo.getApplicationId()).getAppName());
			}

			List<MenuDetails> menuDetailsDetails = menuDetailsRepo.getAllMenuDetailsList(id, YorosisContext.get().getTenantId(), YoroappsConstants.YES);
			if (!CollectionUtils.isEmpty(menuDetailsDetails) && menuDetailsDetails.size() > 0) {
				for (MenuDetails menuDetails : menuDetailsDetails) {

					if (!StringUtils.equals(menuDetails.getActiveFlag(), YoroappsConstants.NO)) {
						MenuDetailsVO constructMenuDetailsDTOTOVO = constructMenuDetailsDTOTOVO(menuDetails);
						menuDetailsList.add(constructMenuDetailsDTOTOVO);

						if (menuDetails.getMenuPath() != null && menuDetails.getCustomPage() == null) {
							constructMenuDetailsDTOTOVO.setMenuPath(menuDetails.getMenuPath());
							constructMenuDetailsDTOTOVO.setPageType("menuPath");
						} else if (menuDetails.getCustomPage() != null) {
							constructMenuDetailsDTOTOVO.setPageType("customPage");
							constructMenuDetailsDTOTOVO.setPageName(menuDetails.getCustomPage().getPageName());
							constructMenuDetailsDTOTOVO.setCustomPageId(menuDetails.getCustomPage().getId());
						}

						if (menuDetails.getPage() != null) {
							constructMenuDetailsDTOTOVO.setPageName(menuDetails.getPage().getPageName());
							constructMenuDetailsDTOTOVO.setPageId(menuDetails.getPage().getPageId());
							constructMenuDetailsDTOTOVO.setPageType("pageName");
						}

						if (menuDetails.getParentMenuId() != null) {
							MenuDetails parentMenuName = menuDetailsRepo.getMenuInfo(menuDetails.getParentMenuId(), YorosisContext.get().getTenantId(),
									YoroappsConstants.YES);
							if (parentMenuName != null) {
								constructMenuDetailsDTOTOVO.setParentMenu(parentMenuName.getMenuName());
							}
						}

						menuConfigurationVo.setMenuDetails(menuDetailsList);
					}

				}
				List<MenuDetailsVO> parentMenuList = new ArrayList<>();

				for (MenuDetails list : menuDetailsDetails) {
					if (list.getParentMenuId() == null || menuDetailsRepo.getOne(list.getParentMenuId()).getParentMenuId() == null) {
						MenuDetailsVO vo = constructMenuDetailsDTOTOVO(list);
						parentMenuList.add(vo);
					}
				}
				menuConfigurationVo.setParentMenuList(parentMenuList);
			}
			return menuConfigurationVo;
		}
	}

	@Transactional
	public ResponseStringVO saveMenuConfiguration(MenuConfigurationVO vo) throws YoroappsException {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		Set<MenuDetails> menuDetailsList = new HashSet<>();

		deleteMenuDetails(vo);

		if (vo.getMenuId() == null) {
			Menu menu = constructMenuVOTODTO(vo);
			menu.setApplication(applicationRepository.getOne(vo.getApplicationId()));

			for (MenuDetailsVO menuDetailsVO : vo.getMenuDetails()) {
				MenuDetails menuDetails = constructMenuDetailsVOTODTO(menuDetailsVO);

				if (menuDetailsVO.getPageId() != null) {
					Page page = pageRepository.findByPageIdAndTenantIdAndActiveFlag(menuDetailsVO.getPageId(), YorosisContext.get().getTenantId(),
							YoroappsConstants.YES);
					menuDetails.setPage(page);
				}

				if (menuDetailsVO.getCustomPageId() != null) {
					menuDetails.setCustomPage(customPagesRepository.getOne(menuDetailsVO.getCustomPageId()));
				}

				if (menuDetailsVO.getParentMenuId() != null) {
					menuDetails.setParentMenuId(menuDetailsVO.getParentMenuId());
				}

				if (menuDetailsVO.getIcon() != null) {
					menuDetails.setIcon(menuDetailsVO.getIcon());
				}

				menuDetails.setMenu(menu);
				menuDetailsList.add(menuDetails);
			}
			menu.setMenuDetails(menuDetailsList);
			Menu menuForApp = menuConfigurationRepo.findByApplicationIdAndActiveFlagAndMenuOrientationAndTenantIdIgnoreCase(vo.getApplicationId(),
					YoroappsConstants.YES, vo.getMenuOrientation(), YorosisContext.get().getTenantId());
			if (menuForApp != null) {
				return ResponseStringVO.builder()
						.response("Menu already exists for this application.  Please update the existing menu instead of creating a new one").build();
			}

			menuConfigurationRepo.save(menu);
			updateMenuId(vo, menu);
			return ResponseStringVO.builder().response("Menu configuration created successfully").responseId(menu.getMenuId().toString()).build();
		} else {
			Menu menu = menuConfigurationRepo.getMenuInfo(vo.getMenuId(), YoroappsConstants.YES, YorosisContext.get().getTenantId());
			menu.setMenuName(vo.getMenuName());

			menu.setMenuOrientation(vo.getMenuOrientation());
			menu.setCollapsible(vo.getCollapsible());
			menu.setModifiedBy(YorosisContext.get().getUserName());
			menu.setModifiedOn(timestamp);
			menu.setApplication(applicationRepository.getOne(vo.getApplicationId()));

			for (MenuDetailsVO menuDetailsVO : vo.getMenuDetails()) {
				MenuDetails menuDetailsData = null;
				if (menuDetailsVO.getId() != null) {
					menuDetailsData = menuDetailsRepo.getMenuInfo(menuDetailsVO.getId(), YorosisContext.get().getTenantId(), YoroappsConstants.YES);
					menuDetailsData.setMenuName(menuDetailsVO.getMenuName());

					if (menuDetailsVO.getMenuPath() != null) {
						menuDetailsData.setMenuPath(menuDetailsVO.getMenuPath());
					} else {
						menuDetailsData.setMenuPath(null);
					}
					menuDetailsData.setDisplayOrder(menuDetailsVO.getDisplayOrder());
					if (menuDetailsVO.getPageId() != null) {
						Page page = pageRepository.findByPageIdAndTenantIdAndActiveFlag(menuDetailsVO.getPageId(), YorosisContext.get().getTenantId(),
								YoroappsConstants.YES);
						menuDetailsData.setPage(page);
					} else if (menuDetailsData.getPage() != null) {
						menuDetailsData.setPage(null);
					}

					if (menuDetailsVO.getParentMenuId() != null) {
						menuDetailsData.setParentMenuId(menuDetailsVO.getParentMenuId());
					} else {
						menuDetailsData.setParentMenuId(null);
					}

					if (menuDetailsVO.getCustomPageId() != null) {
						menuDetailsData.setCustomPage(customPagesRepository.getOne(menuDetailsVO.getCustomPageId()));
					} else if (menuDetailsData.getCustomPage() != null) {
						menuDetailsData.setCustomPage(null);
					}

					if (menuDetailsVO.getIcon() != null) {
						menuDetailsData.setIcon(menuDetailsVO.getIcon());
					}

					menuDetailsData.setModifiedBy(YorosisContext.get().getUserName());
					menuDetailsData.setModifiedOn(timestamp);
					menuDetailsData.setMenu(menu);
					menuDetailsList.add(menuDetailsData);

				} else {
					menuDetailsData = constructMenuDetailsVOTODTO(menuDetailsVO);
					if (menuDetailsVO.getMenuPath() != null) {
						menuDetailsData.setMenuPath(menuDetailsVO.getMenuPath());
					} else {
						menuDetailsData.setMenuPath(null);
					}
					if (menuDetailsVO.getPageId() != null) {
						Page page = pageRepository.findByPageIdAndTenantIdAndActiveFlag(menuDetailsVO.getPageId(), YorosisContext.get().getTenantId(),
								YoroappsConstants.YES);
						menuDetailsData.setPage(page);
					}

					if (menuDetailsVO.getParentMenuId() != null) {
						menuDetailsData.setParentMenuId(menuDetailsVO.getParentMenuId());
					} else {
						menuDetailsData.setParentMenuId(null);
					}

					if (menuDetailsVO.getCustomPageId() != null) {
						menuDetailsData.setCustomPage(customPagesRepository.getOne(menuDetailsVO.getCustomPageId()));
					}

					if (menuDetailsVO.getIcon() != null) {
						menuDetailsData.setIcon(menuDetailsVO.getIcon());
					}
					menuDetailsData.setModifiedBy(YorosisContext.get().getUserName());
					menuDetailsData.setModifiedOn(timestamp);
					menuDetailsData.setMenu(menu);
					menuDetailsList.add(menuDetailsData);
				}

			}
			menu.setMenuDetails(menuDetailsList);
			updateMenuId(vo, menu);
			menuConfigurationRepo.save(menu);
			return ResponseStringVO.builder().response("Menu configuration updated successfully").responseId(menu.getMenuId().toString()).build();
		}
	}

	public void updateMenuId(MenuConfigurationVO vo, Menu menu) {
		if (StringUtils.isNotBlank(vo.getMenuOrientation()) && vo.getApplicationId() != null) {
			Application application = applicationRepository.getOne(vo.getApplicationId());
			if (application.getTopMenuId() != null && menu.getMenuId().compareTo(application.getTopMenuId()) == 0) {
				application.setTopMenuId(null);
			}
			if (application.getBottomMenuId() != null && menu.getMenuId().compareTo(application.getBottomMenuId()) == 0) {
				application.setBottomMenuId(null);
			}
			if (application.getRightMenuId() != null && menu.getMenuId().compareTo(application.getRightMenuId()) == 0) {
				application.setRightMenuId(null);
			}
			if (application.getLeftMenuId() != null && menu.getMenuId().compareTo(application.getLeftMenuId()) == 0) {
				application.setLeftMenuId(null);
			}
			if (StringUtils.equalsIgnoreCase(vo.getMenuOrientation(), "Top")) {
				application.setTopMenuId(menu.getMenuId());
			} else if (StringUtils.equalsIgnoreCase(vo.getMenuOrientation(), "Bottom")) {
				application.setBottomMenuId(menu.getMenuId());
			} else if (StringUtils.equalsIgnoreCase(vo.getMenuOrientation(), "Left")) {
				application.setLeftMenuId(menu.getMenuId());
			} else if (StringUtils.equalsIgnoreCase(vo.getMenuOrientation(), "Right")) {
				application.setRightMenuId(menu.getMenuId());
			}
			applicationRepository.save(application);
		}
	}

	public MenuConfigurationVO getMenuInfoByAppIdentifier(String id) {
		Menu menu = menuConfigurationRepo.getMenuByApplicationIdentifier(id, YoroappsConstants.YES, YorosisContext.get().getTenantId());
		if (menu != null) {
			return constructMenuConfigurationDTOTOVO(menu);
		}
		return null;
	}

	private void deleteMenuDetails(MenuConfigurationVO vo) {
		if (vo.getDeleteMenuDetailsIdList() != null) {
			for (UUID id : vo.getDeleteMenuDetailsIdList()) {
				MenuDetails menuDetails = menuDetailsRepo.getMenuInfo(id, YorosisContext.get().getTenantId(), YoroappsConstants.YES);
				menuDetails.setActiveFlag(YoroappsConstants.NO);
				menuDetailsRepo.save(menuDetails);
			}
		}
	}

	public ExistsCheckVO removeParentMenu(UUID id) {
		MenuDetails menuDetails = menuDetailsRepo.getMenuInfo(id, YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		menuDetails.setActiveFlag(YoroappsConstants.NO);
		List<MenuDetails> parentMenuDetailsList = menuDetailsRepo.getParentMenuList(id, YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		for (MenuDetails list : parentMenuDetailsList) {
			list.setActiveFlag(YoroappsConstants.NO);
			menuDetailsRepo.save(list);
		}
		menuDetailsRepo.save(menuDetails);
		return ExistsCheckVO.builder().response("Parent Menu Removed Successfully").menuId(menuDetails.getMenu().getMenuId()).build();

	}

	@Transactional
	public ExistsCheckVO checkMenuExistingInApplication(UUID id, String orientation) {
		Application application = applicationRepository.getOne(id);
		String response = null;
		boolean allowToUpdate = false;
		UUID menuId = null;
		if (StringUtils.equalsIgnoreCase(orientation, "Top") && application.getTopMenuId() != null) {
			response = "Top Menu Already Associated For This Application. Do you want to update this ?";
			menuId = application.getTopMenuId();
		} else if (StringUtils.equalsIgnoreCase(orientation, "Bottom") && application.getBottomMenuId() != null) {
			response = "Bottom Menu Already Associated For This Application. Do you want to update this ?";
			menuId = application.getBottomMenuId();
		} else if (StringUtils.equalsIgnoreCase(orientation, "Left") && application.getLeftMenuId() != null) {
			response = "Left Menu Already Associated For This Application. Do you want to update this ?";
			menuId = application.getLeftMenuId();
		} else if (StringUtils.equalsIgnoreCase(orientation, "Right") && application.getRightMenuId() != null) {
			response = "Right Menu Already Associated For This Application. Do you want to update this ?";
			menuId = application.getRightMenuId();
		} else {
			allowToUpdate = true;
		}
		return ExistsCheckVO.builder().response(response).menuId(menuId).isExist(allowToUpdate).build();
	}

	@Transactional
	public ResponseStringVO checkMenuName(String menuName) {
		List<Menu> name = menuConfigurationRepo.getMenuName(menuName, YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		if (name != null && name.size() > 0) {
			return ResponseStringVO.builder().response("Menu Name Already Exist").build();
		}
		return ResponseStringVO.builder().response("New Name").build();
	}

}
