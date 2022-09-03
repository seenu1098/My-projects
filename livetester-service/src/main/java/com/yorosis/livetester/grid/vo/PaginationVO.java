package com.yorosis.livetester.grid.vo;



import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaginationVO {
	private String gridId;
	private int index;
	private int size;
	private String direction;
	private String columnName;
	private String id;
	private FilterValueVO[] filterValue;
   
}
