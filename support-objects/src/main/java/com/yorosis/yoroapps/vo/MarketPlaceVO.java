package com.yorosis.yoroapps.vo;

import java.sql.Timestamp;
import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketPlaceVO {
	private UUID id;
	private String uploadWorkflows;
	private JsonNode jsonData;
	private long noOfInstalledCounts;
	private boolean install;
	private Timestamp updatedDate;
	private String description;
	private String developerName;
	private String approve;
	private String startKey;
}
