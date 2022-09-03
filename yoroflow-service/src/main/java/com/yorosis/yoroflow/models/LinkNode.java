package com.yorosis.yoroflow.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LinkNode {
	private String key;
	private String source;
	private String target;
	private String linkLabel;
}
