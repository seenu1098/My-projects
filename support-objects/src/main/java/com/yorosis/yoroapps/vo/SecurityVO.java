package com.yorosis.yoroapps.vo;

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
	List<PermissionVO> permissionsVOList;
	List<UUID> deletedIDList;
}
