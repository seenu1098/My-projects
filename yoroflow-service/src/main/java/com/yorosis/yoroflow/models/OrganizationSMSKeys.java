package com.yorosis.yoroflow.models;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationSMSKeys {
	private List<SMSKeysVO> organizationSmsKeys;
}
