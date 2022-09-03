package com.yorosis.yoroapps.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConditionalChecksVO {
	private ConditionalDetailsVO enable;
	private ConditionalDetailsVO show;
	private ConditionalDetailsVO required;
}
