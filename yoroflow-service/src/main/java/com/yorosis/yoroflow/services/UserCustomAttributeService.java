package com.yorosis.yoroflow.services;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroflow.entities.OrgCustomAttributes;
import com.yorosis.yoroflow.entities.User;
import com.yorosis.yoroflow.entities.UserCustomAttributes;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.models.FieldVO;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.models.UserCustomAttributeVO;
import com.yorosis.yoroflow.repository.OrgCustomAttributeRepository;
import com.yorosis.yoroflow.repository.UserCustomAttributeRepository;
import com.yorosis.yoroflow.repository.UsersRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class UserCustomAttributeService {

	@Autowired
	private UserCustomAttributeRepository userCustomAttributeRepository;

	@Autowired
	private UsersRepository usersRepository;

	@Autowired
	private OrgCustomAttributeRepository orgCustomAttributeRepository;

	private FieldVO constructDTOToVO(UserCustomAttributes userCustomAttributes) {
		return FieldVO.builder().fieldId(userCustomAttributes.getName()).fieldName(userCustomAttributes.getName()).datatype(userCustomAttributes.getDataType())
				.build();
	}

	@Transactional
	public List<FieldVO> getCustomAttributes() {
		List<FieldVO> list = new ArrayList<>();
		User user = usersRepository.findByUserName(YorosisContext.get().getUserName());
		List<UserCustomAttributes> userCustomAttributesList = userCustomAttributeRepository.getListBasedonUserNameAndTenantIdAndActiveFlag(user.getUserId(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);

		for (UserCustomAttributes userCustomAttributes : userCustomAttributesList) {
			list.add(constructDTOToVO(userCustomAttributes));
		}

		return list;
	}

	@Transactional
	public UserCustomAttributeVO getCustomAttribute(String name) {
		User user = usersRepository.findByUserName(YorosisContext.get().getUserName());
		UserCustomAttributes userCustomAttribute = userCustomAttributeRepository.getAttributeBasedonUserNameAndAttributeName(user.getUserId(), name,
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (userCustomAttribute == null) {
			OrgCustomAttributes orgCustomAttributes = orgCustomAttributeRepository.getAttributeBasedOnAttributeName(name, YorosisContext.get().getTenantId(),
					YorosisConstants.YES);
			if (orgCustomAttributes == null) {
				return null;
			} else {
				return UserCustomAttributeVO.builder().name(orgCustomAttributes.getName()).value(orgCustomAttributes.getValue())
						.dataType(orgCustomAttributes.getDataType()).build();
			}
		} else {
			return UserCustomAttributeVO.builder().name(userCustomAttribute.getName()).value(userCustomAttribute.getValue())
					.dataType(userCustomAttribute.getDataType()).build();
		}
	}

	@Transactional
	public ResponseStringVO checkCustomAttributes() {
		int orgCustomAttributesCount = orgCustomAttributeRepository.getListForUserCustomAttributes(YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (orgCustomAttributesCount == 0) {
			return ResponseStringVO.builder().response("Continue").build();
		} else {
			int userCustomAttributeCount = 0;
			User user = usersRepository.findByUserName(YorosisContext.get().getUserName());
			List<UserCustomAttributes> userCustomAttributesList = userCustomAttributeRepository.getListBasedonUserNameAndTenantIdAndActiveFlag(user.getUserId(),
					YorosisContext.get().getTenantId(), YorosisConstants.YES);
			for (UserCustomAttributes userCustomAttributes : userCustomAttributesList) {
				OrgCustomAttributes orgCustomAttributes = orgCustomAttributeRepository.getAttributeBasedOnAttributeName(userCustomAttributes.getName(),
						YorosisContext.get().getTenantId(), YorosisConstants.YES);
				if (orgCustomAttributes != null && StringUtils.equals(orgCustomAttributes.getRequired(), YorosisConstants.YES)) {
					userCustomAttributeCount++;
				}
			}
			if (userCustomAttributeCount == orgCustomAttributesCount) {
				return ResponseStringVO.builder().response("Continue").build();
			} else {
				return ResponseStringVO.builder().response("Stop").build();
			}
		}
	}

}
