package com.yorosis.yoroapps.menu.vo;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuConfigurationVO {
	private UUID menuId;
	private String menuName;
	private String menuOrientation;
	private String collapsible;
	private UUID applicationId;
	private String applicationName;
	private List<MenuDetailsVO> menuDetails;
	private List<UUID> deleteMenuDetailsIdList;
	private List<MenuDetailsVO> parentMenuList;
	private Boolean isManaged;
}
