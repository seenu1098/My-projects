package com.yorosis.livetester.vo;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceLineDentalVO {
	private List<String> oralCavityDesignationCodeList;
	private List<String> toothCodeList;
}
