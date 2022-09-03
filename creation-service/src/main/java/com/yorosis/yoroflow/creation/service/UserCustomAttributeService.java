package com.yorosis.yoroflow.creation.service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroapps.entities.OrgCustomAttributes;
import com.yorosis.yoroapps.entities.UserCustomAttributes;
import com.yorosis.yoroapps.entities.Users;
import com.yorosis.yoroapps.vo.CustomAttributeListVO;
import com.yorosis.yoroapps.vo.CustomAttributeVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.OrgCustomAttributeRepository;
import com.yorosis.yoroflow.creation.repository.UserCustomAttributeRepository;
import com.yorosis.yoroflow.creation.repository.UsersRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class UserCustomAttributeService {
	private static final String ATTRIBUTE_PREFIX = "userCustomAttribute_";

	@Autowired
	private UserCustomAttributeRepository userCustomAttributeRepository;

	@Autowired
	private UsersRepository usersRepository;

	@Autowired
	private OrgCustomAttributeRepository orgCustomAttributeRepository;

	private Timestamp timestamp = new Timestamp(System.currentTimeMillis());

	private UserCustomAttributes construcVOtoDTO(CustomAttributeListVO customAttributeListVO) {
		return UserCustomAttributes.builder().name(customAttributeListVO.getName()).value(customAttributeListVO.getValue())
				.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp).createdBy(YorosisContext.get().getUserName()).createdDate(timestamp)
				.dataType(customAttributeListVO.getDataType()).tenantId(YorosisContext.get().getTenantId()).activeFlag(YoroappsConstants.YES).build();
	}

	private CustomAttributeListVO construcDTOtoVO(UserCustomAttributes userCustomAttributes) {
		return CustomAttributeListVO.builder().id(userCustomAttributes.getId()).name(userCustomAttributes.getName()).value(userCustomAttributes.getValue())
				.required(stringFromvalue(userCustomAttributes.getValue())).dataType(userCustomAttributes.getDataType()).build();
	}

	private CustomAttributeListVO constructOrgDTOtoVO(OrgCustomAttributes userCustomAttributes) {
		return CustomAttributeListVO.builder().name(userCustomAttributes.getName()).value(userCustomAttributes.getValue())
				.required(stringToBoolean(userCustomAttributes.getRequired())).dataType(userCustomAttributes.getDataType()).build();
	}

	@Transactional
	public ResponseStringVO saveCustomAttribute(CustomAttributeVO customAttributeVO) {
		ResponseStringVO response = null;

		List<CustomAttributeListVO> list = customAttributeVO.getCustomAttributeListVo();
		deleteVariableList(customAttributeVO);

		for (CustomAttributeListVO customAttributeListVO : list) {
			if (customAttributeListVO.getId() == null) {
				Users user = usersRepository.findByUserName(YorosisContext.get().getUserName());
				UserCustomAttributes userCustomAttribute = userCustomAttributeRepository.getListBasedonUserNameAndAttributeNameAndTenantIdAndActiveFlag(
						customAttributeListVO.getName(), user.getUserId(), YorosisContext.get().getTenantId(), YoroappsConstants.YES);
				if (userCustomAttribute == null) {
					UserCustomAttributes userCustomAttributes = construcVOtoDTO(customAttributeListVO);
					userCustomAttributes.setUsers(user);
					userCustomAttributeRepository.save(userCustomAttributes);
					response = ResponseStringVO.builder().response("User Custom Attributes are saved").build();
				} else {
					response = ResponseStringVO.builder().response("User Custom Attributes already saved").build();
				}

			} else {
				UserCustomAttributes userCustomAttributes = userCustomAttributeRepository
						.getListBasedonIdAndTenantIdAndActiveFlag(customAttributeListVO.getId(), YorosisContext.get().getTenantId(), YoroappsConstants.YES);
				userCustomAttributes.setName(customAttributeListVO.getName());
				userCustomAttributes.setValue(customAttributeListVO.getValue());
				userCustomAttributes.setDataType(customAttributeListVO.getDataType());
				userCustomAttributes.setModifiedBy(YorosisContext.get().getUserName());
				userCustomAttributes.setModifiedOn(timestamp);
				userCustomAttributeRepository.save(userCustomAttributes);

				response = ResponseStringVO.builder().response("User Custom Attributes are updated").build();
			}
		}

		return response;
	}

	@Transactional
	public Set<CustomAttributeListVO> getCustomAttributes() {
		Set<CustomAttributeListVO> list = new HashSet<>();
		List<String> name = new ArrayList<>();
		Users user = usersRepository.findByUserName(YorosisContext.get().getUserName());
		List<UserCustomAttributes> userCustomAttributesList = userCustomAttributeRepository.getListBasedonUserNameAndTenantIdAndActiveFlag(user.getUserId(),
				YorosisContext.get().getTenantId(), YoroappsConstants.YES);

		for (UserCustomAttributes userCustomAttributes : userCustomAttributesList) {
			list.add(construcDTOtoVO(userCustomAttributes));
			name.add(userCustomAttributes.getName());
		}
		name.add(ATTRIBUTE_PREFIX);
		List<OrgCustomAttributes> orgCustomAttributesList = orgCustomAttributeRepository.getListForUserCustomAttributes(name,
				YorosisContext.get().getTenantId(), YoroappsConstants.YES);

		for (OrgCustomAttributes userCustomAttributes : orgCustomAttributesList) {
			list.add(constructOrgDTOtoVO(userCustomAttributes));
		}
		return list;
	}

	private void deleteVariableList(CustomAttributeVO customAttributeVO) {
		if (!customAttributeVO.getDeletedColumnIDList().isEmpty()) {
			for (UUID id : customAttributeVO.getDeletedColumnIDList()) {
				if (id != null) {
					UserCustomAttributes userCustomAttributes = userCustomAttributeRepository.getListBasedonIdAndTenantIdAndActiveFlag(id,
							YorosisContext.get().getTenantId(), YoroappsConstants.YES);
					userCustomAttributes.setActiveFlag(YoroappsConstants.NO);
					userCustomAttributeRepository.save(userCustomAttributes);
				}
			}
		}
	}

	private Boolean stringToBoolean(String value) {
		return StringUtils.equalsIgnoreCase(YoroappsConstants.YES, value);
	}

	private Boolean stringFromvalue(String value) {
		return !StringUtils.isEmpty(value);
	}

}
