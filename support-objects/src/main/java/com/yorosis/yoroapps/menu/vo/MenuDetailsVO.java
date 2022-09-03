package com.yorosis.yoroapps.menu.vo;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuDetailsVO {
	private UUID id;
	private String menuName;
	private String pageName;
	private String pageId;
	private UUID parentMenuId;
	private Long displayOrder;
	private String parentMenu;
	private String pageType;
	private String menuPath;
	private UUID customPageId;
	private Long version;
	private String icon;
	private List<MenuDetailsVO> dynamicMenus;
	private UUID reportId;
	

	public static final Comparator<MenuDetailsVO> DisplayOrderComparator = new Comparator<MenuDetailsVO>() {

		public int compare(MenuDetailsVO s1, MenuDetailsVO s2) {

			int displayOrder1 = s1.getDisplayOrder().intValue();
			int displayOrder2 = s2.getDisplayOrder().intValue();
			return displayOrder1 - displayOrder2;

		}
	};
}
