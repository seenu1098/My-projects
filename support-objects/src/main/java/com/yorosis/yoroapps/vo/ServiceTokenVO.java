package com.yorosis.yoroapps.vo;

import java.time.LocalDateTime;
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
public class ServiceTokenVO {

	private UUID id;
	private String apiName;
	private String apiKey;
	private String secretKey;
	private LocalDateTime expiresOn;			
	private List<UserPermissionVO> pagePermissions;
	private List<UserPermissionVO> workflowPermissions;
	
	List<UUID> deletedIDList;
}
