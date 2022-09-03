package com.yorosis.yoroapps.grid.vo;

import java.util.UUID;

import com.yorosis.yoroapps.vo.FilterValueVO;

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
	private FilterValueVO[] filterValue;
	private Boolean isNoRoles;
	private Boolean isUnAssigned;
	private UUID id;
}
