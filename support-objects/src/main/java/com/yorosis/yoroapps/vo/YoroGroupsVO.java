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
public class YoroGroupsVO {
	private UUID id;
	private String customerId;
	private String name;
	private String description;
	private Long userCount;
	private List<UUID> owners;
	private List<UUID> members;
	private List<YoroGroupsUserVO> yoroGroupsUserVO;
	private String color;
}
