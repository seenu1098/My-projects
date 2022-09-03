package com.yorosis.yoroflow.models;

import java.util.List;

import com.yorosis.yoroflow.service.computation.operators.ComputeOperatorType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class ComputeVO {

	private String name;
	private ComputeOperatorType operator;
	private YoroDataType dataType;
	private String leftAssignment;
	private List<ComputeRightAssignment> rightAssignment;
	private String value;

}
