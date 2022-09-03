package com.yorosis.taskboard.models;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportHeadersVo {
	private String headerName;
	private String headerId;
	private JsonNode headerDetails;
}
