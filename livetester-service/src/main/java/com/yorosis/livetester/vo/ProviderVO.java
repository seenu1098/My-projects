package com.yorosis.livetester.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProviderVO {
	private String npi;
	private String taxonomy;
	private String firstName;
	private String lastName;
	private String organizationName;
	private String taxId;
	private String type;
	private String serviceFacility;
	private String description;
	private AddressVO address;
}
