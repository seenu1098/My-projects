package com.yorosis.yoroflow.rendering.service.vo;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FilesVO {
	private String fileName;
	private String filePath;
	private JsonNode taskData;
}
