package com.yorosis.yoroflow.creation.service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yorosis.yoroapps.entities.OrgCustomAttributes;
import com.yorosis.yoroapps.entities.UserCustomAttributes;
import com.yorosis.yoroapps.vo.CustomAttributeListVO;
import com.yorosis.yoroapps.vo.CustomAttributeVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.OrgCustomAttributeRepository;
import com.yorosis.yoroflow.creation.repository.UserCustomAttributeRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class OrgCustomattributeService {

	private static final String ATTRIBUTE_PREFIX = "userCustomAttribute_";

	@Autowired
	private OrgCustomAttributeRepository orgCustomAttributeRepository;

	@Autowired
	private UserCustomAttributeRepository userCustomAttributeRepository;

	@Autowired
	private ObjectMapper mapper;

	private String booleanToString(boolean value) {
		return value ? YoroappsConstants.YES : YoroappsConstants.NO;
	}

	private Boolean stringToBoolean(String value) {
		return StringUtils.equalsIgnoreCase(YoroappsConstants.YES, value);
	}

	private OrgCustomAttributes construcVOtoDTO(CustomAttributeListVO customAttributeListVO) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return OrgCustomAttributes.builder().name(ATTRIBUTE_PREFIX + customAttributeListVO.getName()).value(customAttributeListVO.getValue())
				.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp).createdBy(YorosisContext.get().getUserName()).createdDate(timestamp)
				.dataType(customAttributeListVO.getDataType()).size(customAttributeListVO.getSize()).attributeType(customAttributeListVO.getAttributeType())
				.required(booleanToString(customAttributeListVO.getRequired())).tenantId(YorosisContext.get().getTenantId()).activeFlag(YoroappsConstants.YES)
				.build();
	}

	private CustomAttributeListVO construcDTOtoVO(OrgCustomAttributes orgCustomAttributes) {
		return CustomAttributeListVO.builder().id(orgCustomAttributes.getId()).name(orgCustomAttributes.getName()).value(orgCustomAttributes.getValue())
				.dataType(orgCustomAttributes.getDataType()).attributeType(orgCustomAttributes.getAttributeType()).size(orgCustomAttributes.getSize())
				.required(stringToBoolean(orgCustomAttributes.getRequired())).build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public ResponseStringVO saveCustomAttribute(CustomAttributeVO customAttributeVO) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		ResponseStringVO response = null;
		deleteVariableList(customAttributeVO);
		for (CustomAttributeListVO customAttributeListVO : customAttributeVO.getCustomAttributeListVo()) {
			if (customAttributeListVO.getId() == null) {
				OrgCustomAttributes userCustomAttributes = construcVOtoDTO(customAttributeListVO);
				orgCustomAttributeRepository.save(userCustomAttributes);

				response = ResponseStringVO.builder().response("Organization Custom Attributes - created successfully").build();
			} else {
				OrgCustomAttributes orgCustomAttributes = orgCustomAttributeRepository.getListBasedonIdAndTenantIdAndActiveFlag(customAttributeListVO.getId(),
						YorosisContext.get().getTenantId(), YoroappsConstants.YES);
				orgCustomAttributes.setName(ATTRIBUTE_PREFIX + customAttributeListVO.getName());
				orgCustomAttributes.setValue(customAttributeListVO.getValue());
				orgCustomAttributes.setDataType(customAttributeListVO.getDataType());
				orgCustomAttributes.setAttributeType(customAttributeListVO.getAttributeType());
				orgCustomAttributes.setSize(customAttributeListVO.getSize());
				orgCustomAttributes.setRequired(booleanToString(customAttributeListVO.getRequired()));
				orgCustomAttributes.setModifiedBy(YorosisContext.get().getUserName());
				orgCustomAttributes.setModifiedOn(timestamp);
				orgCustomAttributeRepository.save(orgCustomAttributes);
				if (StringUtils.equals(orgCustomAttributes.getAttributeType(), "org")) {
					updateUserCustomAttribute(orgCustomAttributes);
				}
				response = ResponseStringVO.builder().response("Organization Custom Attributes - updated successfully").build();
			}
		}

		if (response != null) {
			return response;
		}
		return ResponseStringVO.builder().response("Organization Custom Attributes saved successfully").build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public List<CustomAttributeListVO> getCustomAttributes(String subdomain) {
		List<CustomAttributeListVO> list = new ArrayList<>();
		List<OrgCustomAttributes> orgCustomAttributesList = orgCustomAttributeRepository
				.getListBasedonUserNameAndTenantIdAndActiveFlag(YorosisContext.get().getTenantId(), YoroappsConstants.YES);

		for (OrgCustomAttributes orgCustomAttributes : orgCustomAttributesList) {
			list.add(construcDTOtoVO(orgCustomAttributes));
		}

		return list;
	}

	@Transactional
	public List<CustomAttributeListVO> getCustomAttributesForOrg(String subdomain) {
		List<CustomAttributeListVO> list = new ArrayList<>();
		List<OrgCustomAttributes> orgCustomAttributesList = orgCustomAttributeRepository
				.getListBasedonUserNameAndTenantIdAndActiveFlag(YorosisContext.get().getTenantId(), YoroappsConstants.YES);

		for (OrgCustomAttributes orgCustomAttributes : orgCustomAttributesList) {
			list.add(construcDTOtoVO(orgCustomAttributes));
		}

		return list;
	}

	@Transactional
	public ResponseStringVO saveCustomAttributeForOrg(String customAttribute) throws JsonProcessingException {
		ResponseStringVO response = null;
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

		CustomAttributeVO customAttributeVO = mapper.readValue(customAttribute, CustomAttributeVO.class);
		List<CustomAttributeListVO> list = customAttributeVO.getCustomAttributeListVo();
		deleteVariableList(customAttributeVO);

		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		for (CustomAttributeListVO customAttributeListVO : list) {
			if (customAttributeListVO.getId() == null) {
				OrgCustomAttributes userCustomAttributes = construcVOtoDTO(customAttributeListVO);
				orgCustomAttributeRepository.save(userCustomAttributes);

				response = ResponseStringVO.builder().response("Organization Custom Attributes - created successfully").build();
			} else {
				OrgCustomAttributes orgCustomAttributes = orgCustomAttributeRepository.getListBasedonIdAndTenantIdAndActiveFlag(customAttributeListVO.getId(),
						YorosisContext.get().getTenantId(), YoroappsConstants.YES);
				orgCustomAttributes.setName(ATTRIBUTE_PREFIX + customAttributeListVO.getName());
				orgCustomAttributes.setValue(customAttributeListVO.getValue());
				orgCustomAttributes.setDataType(customAttributeListVO.getDataType());
				orgCustomAttributes.setAttributeType(customAttributeListVO.getAttributeType());
				orgCustomAttributes.setSize(customAttributeListVO.getSize());
				orgCustomAttributes.setRequired(booleanToString(customAttributeListVO.getRequired()));
				orgCustomAttributes.setModifiedBy(YorosisContext.get().getUserName());
				orgCustomAttributes.setModifiedOn(timestamp);
				orgCustomAttributeRepository.save(orgCustomAttributes);
				if (StringUtils.equals(orgCustomAttributes.getAttributeType(), "org")) {
					updateUserCustomAttribute(orgCustomAttributes);
				}
				response = ResponseStringVO.builder().response("Organization Custom Attributes - updated successfully").build();
			}
		}

		return response;
	}

	private void deleteVariableList(CustomAttributeVO customAttributeVO) {
		if (customAttributeVO.getDeletedColumnIDList() != null && !customAttributeVO.getDeletedColumnIDList().isEmpty()) {
			for (UUID id : customAttributeVO.getDeletedColumnIDList()) {
				if (id != null) {
					OrgCustomAttributes orgCustomAttributes = orgCustomAttributeRepository.getListBasedonIdAndTenantIdAndActiveFlag(id,
							YorosisContext.get().getTenantId(), YoroappsConstants.YES);
					if (orgCustomAttributes != null) {
						updateUserCustomAttribute(orgCustomAttributes);
						orgCustomAttributes.setActiveFlag(YoroappsConstants.NO);
						orgCustomAttributeRepository.save(orgCustomAttributes);
					}
				}
			}
		}
	}

	private void updateUserCustomAttribute(OrgCustomAttributes orgCustomAttributes) {
		List<UserCustomAttributes> userCustomAttributes = userCustomAttributeRepository
				.getListBasedonAttributeNameAndTenantIdAndActiveFlag(orgCustomAttributes.getName(), YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		if (!CollectionUtils.isEmpty(userCustomAttributes)) {
			for (UserCustomAttributes userCustomAttribute : userCustomAttributes) {
				userCustomAttribute.setActiveFlag(YoroappsConstants.NO);
				userCustomAttributeRepository.save(userCustomAttribute);
			}
		}
	}

	@Transactional
	public ResponseStringVO updateAttributes(CustomAttributeVO customAttributes) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		ResponseStringVO response = null;
		deleteVariableList(customAttributes);
		for (CustomAttributeListVO customAttributeListVO : customAttributes.getCustomAttributeListVo()) {
			if (customAttributeListVO.getId() == null) {
				OrgCustomAttributes userCustomAttributes = construcVOtoDTO(customAttributeListVO);
				orgCustomAttributeRepository.save(userCustomAttributes);

				response = ResponseStringVO.builder().response("Organization Custom Attributes - created successfully").build();
			} else {
				OrgCustomAttributes orgCustomAttributes = orgCustomAttributeRepository.getListBasedonIdAndTenantIdAndActiveFlag(customAttributeListVO.getId(),
						YorosisContext.get().getTenantId(), YoroappsConstants.YES);
				orgCustomAttributes.setName(ATTRIBUTE_PREFIX + customAttributeListVO.getName());
				orgCustomAttributes.setValue(customAttributeListVO.getValue());
				orgCustomAttributes.setDataType(customAttributeListVO.getDataType());
				orgCustomAttributes.setAttributeType(customAttributeListVO.getAttributeType());
				orgCustomAttributes.setSize(customAttributeListVO.getSize());
				orgCustomAttributes.setRequired(booleanToString(customAttributeListVO.getRequired()));
				orgCustomAttributes.setModifiedBy(YorosisContext.get().getUserName());
				orgCustomAttributes.setModifiedOn(timestamp);
				orgCustomAttributeRepository.save(orgCustomAttributes);
				if (StringUtils.equals(orgCustomAttributes.getAttributeType(), "org")) {
					updateUserCustomAttribute(orgCustomAttributes);
				}
				response = ResponseStringVO.builder().response("Organization Custom Attributes - updated successfully").build();
			}
		}

		if (response != null) {
			return response;
		}
		return ResponseStringVO.builder().response("Organization Custom Attributes - saved successfully").build();
	}

}
