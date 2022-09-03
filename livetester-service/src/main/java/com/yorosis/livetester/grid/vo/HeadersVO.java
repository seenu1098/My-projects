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
public class HeadersVO {
	private List<String> headersIdList;
	private List<String> headers;
	private List<Boolean> sortable;
	private List<Integer> width;
	private List<Boolean> filterable;
	private List<String> fieldType;
}
