package com.yorosis.yoroflow.models;

import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;
import com.yorosis.yoroapps.vo.LicenseVO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResponseStringVO {
	private String response;
	private boolean isDisable;
	private int count;
	private UUID uuid;
	private JsonNode object;
	private TaskboardVO taskboardVO;
	private LicenseVO licenseVO;
	private String taskId;
	private UUID id;
}