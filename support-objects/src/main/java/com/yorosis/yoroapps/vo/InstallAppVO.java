package com.yorosis.yoroapps.vo;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstallAppVO {
	private UUID id;
	private String processDefinitionName;
	private String install;
	private String installFrom;
	private String description;
	private String startKey;
}
