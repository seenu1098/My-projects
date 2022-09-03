package com.yorosis.yoroflow.models;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LicenseValidationVO {
	private UUID id;
	private String planName;
	private String featureName;
	private String isAllowed;
	private Long allowedLimit;
	private String category;
}
