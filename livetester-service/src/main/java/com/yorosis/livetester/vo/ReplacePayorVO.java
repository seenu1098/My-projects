package com.yorosis.livetester.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReplacePayorVO {
	private String payor;
	private String payorControl;
	private String alwaysReplace; 
}
