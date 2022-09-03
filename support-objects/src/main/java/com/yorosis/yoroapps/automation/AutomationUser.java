package com.yorosis.yoroapps.automation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AutomationUser {
	private String firstName;
	private String lastName;
	private String userName;

}
