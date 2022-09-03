package com.yorosis.livetester.grid.vo;

import java.util.List;

import com.thoughtworks.xstream.annotations.XStreamAlias;
import com.thoughtworks.xstream.annotations.XStreamImplicit;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor; 

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

@XStreamAlias("columns")
public class Columns {
    @XStreamImplicit
	private List<Column> column;

}
