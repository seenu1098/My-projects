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
public class RolesListVO {
	private UUID id;
	private String rolesNames;
	private String rolesDesc;
	private String roleColor;
}
