package com.yorosis.livetester.vo;



import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class ReplaceProviderVO {
	private String provider;
	private String providerControl;
	private String alwaysReplace; 
}
