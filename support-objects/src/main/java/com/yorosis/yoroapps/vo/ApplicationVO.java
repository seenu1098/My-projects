package com.yorosis.yoroapps.vo;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApplicationVO {
	private UUID id;
	private String applicationName;
	private String description;
	private String applicationId;
	private String timezone;
	private String defaultLanguage;
	private String themeName;
	private String themeId;
	private String logo;
	private UUID leftMenuId;
	private UUID rightMenuId;
	private UUID topMenuId;
	private UUID bottomMenuId;
	private String appPrefix;
	private String image;
	
	@Builder.Default
	private boolean canEdit = false;
	@Builder.Default
	private boolean canLaunch = false;
	@Builder.Default
	private boolean canDelete = false;

}
