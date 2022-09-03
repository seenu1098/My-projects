package com.yorosis.livetester.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClaimTypeVO {
	private Integer id;
	private String claimTypeCode;
	private String description;
	private String formType;
	

}
