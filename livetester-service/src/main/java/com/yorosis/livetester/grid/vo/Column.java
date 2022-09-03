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

@XStreamAlias("column")
public class Column {

	@XStreamAlias("name")
	@XStreamAsAttribute
	private String name;
	
	@XStreamAlias("objectFieldName")
	@XStreamAsAttribute
	private String objectFieldName;

	@XStreamAlias("displayname")
	@XStreamAsAttribute
	private String displayname;

	@XStreamAlias("sortable")
	@XStreamAsAttribute
	private String sortable;
	
	@XStreamAlias("width")
	@XStreamAsAttribute
	private String width;
	
	@XStreamAlias("filterable")
	@XStreamAsAttribute
	private String filterable;
	
	@XStreamAlias("fieldType")
	@XStreamAsAttribute
	private String fieldType;
	

}
