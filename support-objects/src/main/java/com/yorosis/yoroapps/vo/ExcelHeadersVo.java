package com.yorosis.yoroapps.vo;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExcelHeadersVo {
	private String headerName;
	private String headerId;
	private JsonNode headerDetails;
}