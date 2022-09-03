package com.yorosis.livetester.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ElementConfigListVO {

	private long id;
	private String labelNames;
	private String fieldName;
	private String fieldType;
	private String controlType;
	private String json;
	private String isMandatory;
	private String applicableAt;
	private String elementLabel;

}
