package com.yorosis.yoroflow.models.landingpage;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class LandingPageCountVO {
	private String all;
	private String taskBoard;
	private String workflow;
	private String dueDate;
}
