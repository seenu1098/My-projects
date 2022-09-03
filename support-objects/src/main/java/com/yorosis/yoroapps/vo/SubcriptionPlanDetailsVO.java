package com.yorosis.yoroapps.vo;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SubcriptionPlanDetailsVO {
	private List<PlanDetailsListVo> monthlyDetails;
	private List<PlanDetailsListVo> yearlyDetails;
}
