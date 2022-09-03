package com.yorosis.livetester.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BeneficiaryVO {
	private String identifier;
	private String firstName;
	private String lastName;
	private String dob;
	private String gender;
	private String description;
	private AddressVO address;

}
