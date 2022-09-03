package com.yorosis.livetester.vo;

import com.yorosis.livetester.entities.Categories;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor

public class ClaimsTestGroupVO {
	private Long id;
	private Long claimsId;
	private Categories testGroupId;

}
