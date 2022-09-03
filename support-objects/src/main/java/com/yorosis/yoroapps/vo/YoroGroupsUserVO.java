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
public class YoroGroupsUserVO {
	private UUID id;
	private List<UUID> userId;
	private UUID groupId;
	private List<UUID> ownerId;
}
