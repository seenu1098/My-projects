package com.yorosis.livetester.vo;



import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BatchTestCaseVO {
	
	private long id;
	private String generatedEdi;
	private long batch;

}
