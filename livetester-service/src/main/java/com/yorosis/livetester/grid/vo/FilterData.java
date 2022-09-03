package com.yorosis.livetester.grid.vo;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FilterData<T> {
	private List<T> data;
	private Long totalRecords;
}
