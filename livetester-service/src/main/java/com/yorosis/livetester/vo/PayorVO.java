package com.yorosis.livetester.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayorVO {
	private String identifier;
	private String name;
	private String description;
	private AddressVO address;
}
