package com.yorosis.yoroapps.vo;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomAttributeListVO {
	private UUID id;
	private String name;
	private String value;
	private String dataType;
	private String attributeType;
	private long size;
	private Boolean required;

}
