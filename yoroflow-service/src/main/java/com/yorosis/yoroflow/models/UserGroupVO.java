package com.yorosis.yoroflow.models;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserGroupVO {
	private UUID userGroupId;
	private UUID userId;
	private UUID groupId;
	private String groupName;
	private String userName;
	private String color;
}
