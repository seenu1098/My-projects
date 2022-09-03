package com.yorosis.yoroapps.automation;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailPerson {

	private String name;
	private String emailId;
	private UUID userID;

}
