package com.yorosis.livetester.vo;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestGroupItemVO {
	private String desc;
	private String item;
	private int level;
	private int value;
	private TestcaseVO claim;

}
