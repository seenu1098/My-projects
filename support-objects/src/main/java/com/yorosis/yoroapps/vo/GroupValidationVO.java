package com.yorosis.yoroapps.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupValidationVO {
	private boolean required;
    private ConditonFieldsVO[] conditionalFields;
    private  ConditonFieldsVO[] requiredFields;
}
