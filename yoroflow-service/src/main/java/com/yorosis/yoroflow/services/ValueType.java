package com.yorosis.yoroflow.services;

import com.yorosis.yoroflow.models.YoroDataType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ValueType {
	private Object value;
	private YoroDataType clazz;

}
