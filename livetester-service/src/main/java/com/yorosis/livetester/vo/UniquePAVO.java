package com.yorosis.livetester.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UniquePAVO {

	private String pa;
	private String alwaysReplace;
}
