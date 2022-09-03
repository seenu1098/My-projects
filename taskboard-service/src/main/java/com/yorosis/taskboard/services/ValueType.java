package com.yorosis.taskboard.services;

import com.yorosis.taskboard.models.YoroDataType;

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
