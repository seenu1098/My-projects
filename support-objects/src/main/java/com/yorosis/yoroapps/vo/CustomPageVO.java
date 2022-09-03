package com.yorosis.yoroapps.vo;

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
public class CustomPageVO {
	private UUID id;
	private String pageId;
	private String pageName;
	private String menuPath;
	private JsonNode jsonText; 
	private Long version;
}
