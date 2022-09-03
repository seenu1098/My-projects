package com.yorosis.livetester.grid.vo;

import com.thoughtworks.xstream.annotations.XStreamAlias;
import com.thoughtworks.xstream.annotations.XStreamAsAttribute;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@XStreamAlias("grid")
public class Grid {

	@XStreamAlias("id")
	@XStreamAsAttribute
	private String id;

	@XStreamAlias("moduleId")
	@XStreamAsAttribute
	private String moduleId;
	
	@XStreamAlias("widthPercentage")
	@XStreamAsAttribute
	private Integer width;
	
	@XStreamAlias("filterable")
	@XStreamAsAttribute
	private Boolean filterable;

	@XStreamAlias("columns")
	private Columns columns;
	
	

}
