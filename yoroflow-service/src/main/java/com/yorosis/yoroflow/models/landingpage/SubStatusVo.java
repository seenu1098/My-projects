package com.yorosis.yoroflow.models.landingpage;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class SubStatusVo {
	private String subStatus;
	private String color;

}
