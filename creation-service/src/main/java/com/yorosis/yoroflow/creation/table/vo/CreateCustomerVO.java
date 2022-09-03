package com.yorosis.yoroflow.creation.table.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCustomerVO {
	private String customerId;
	private String tenantId;
	private String customerUserId;

}
