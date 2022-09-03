package com.yorosis.yoroflow.models;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SecurityVO {
	private UUID securityId;
	private List<PermissionVO> permissionsVOList;
	private List<UUID> deletedIDList;
}
