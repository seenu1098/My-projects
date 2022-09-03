package com.yorosis.yoroapps.apps.vo;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AppsVo {
	private JsonNode templateNode;
	private UUID workspaceId;
	private List<YoroGroupMapVo> groupNameMap;
	private Map<UUID, ?> groupIdMap;
}
