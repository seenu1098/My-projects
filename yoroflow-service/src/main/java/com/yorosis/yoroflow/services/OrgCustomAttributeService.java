package com.yorosis.yoroflow.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroflow.entities.OrgCustomAttributes;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.models.FieldVO;
import com.yorosis.yoroflow.repository.OrgCustomAttributeRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class OrgCustomAttributeService {

	@Autowired
	private OrgCustomAttributeRepository orgCustomAttributeRepository;

	private FieldVO constructDTOToVO(OrgCustomAttributes orgCustomAttributes) {
		return FieldVO.builder().fieldId(orgCustomAttributes.getName()).fieldName(orgCustomAttributes.getName()).datatype(orgCustomAttributes.getDataType())
				.build();
	}

	@Transactional
	public List<FieldVO> getCustomAttributes() {
		List<FieldVO> list = new ArrayList<>();
		List<OrgCustomAttributes> orgCustomAttributesList = orgCustomAttributeRepository.getListBasedonTenantIdAndActiveFlag(YorosisContext.get().getTenantId(),
				YorosisConstants.YES);

		for (OrgCustomAttributes orgCustomAttributes : orgCustomAttributesList) {
			list.add(constructDTOToVO(orgCustomAttributes));
		}

		return list;
	}
}
