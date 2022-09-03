package com.yorosis.yoroflow.rendering.service.vo;


import org.hibernate.type.Type;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DataObject {
	private Type type;
	private Object value;
}
