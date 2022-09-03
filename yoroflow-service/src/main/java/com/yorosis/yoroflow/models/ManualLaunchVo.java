package com.yorosis.yoroflow.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManualLaunchVo {
	private String status;
	private String formId;
	private Long version;
	private boolean hasDraft;
}
