package com.yorosis.yoroflow.service.variables;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.yorosis.yoroflow.entities.ProcessInstance;
import com.yorosis.yoroflow.entities.User;
import com.yorosis.yoroflow.models.FieldVO;
import com.yorosis.yoroflow.models.YoroDataType;
import com.yorosis.yoroflow.repository.ProcessInstanceRepo;
import com.yorosis.yoroflow.repository.UsersRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Component
public class InitiatedVariableService {

	private static final String INITIATED_USER_CONTACT_EMAIL_ID = "initiatedUserContactEmailId";
	private static final String INITIATED_USER_LOGIN_EMAIL_ID = "initiatedUserLoginEmailId";
	private static final String INITIATED_USER_FIRST_NAME = "initiatedUserFirstName";
	private static final String INITIATED_USER_lAST_NAME = "initiatedUserLastName";
	private static final String INITIATED_USER_CONTACT_PHONE_NO = "initiatedUserContactPhoneNo";

	@Autowired
	UsersRepository usersRepo;

	@Autowired
	ProcessInstanceRepo processInstanceRepo;

	public List<FieldVO> getFieldList() {
		List<FieldVO> fieldVoList = new ArrayList<>();
		fieldVoList.add(FieldVO.builder().fieldName(INITIATED_USER_CONTACT_EMAIL_ID).fieldId(INITIATED_USER_CONTACT_EMAIL_ID)
				.datatype(YoroDataType.STRING.toString().toLowerCase()).build());
		fieldVoList.add(FieldVO.builder().fieldName(INITIATED_USER_LOGIN_EMAIL_ID).fieldId(INITIATED_USER_LOGIN_EMAIL_ID)
				.datatype(YoroDataType.STRING.toString().toLowerCase()).build());
		fieldVoList.add(FieldVO.builder().fieldName(INITIATED_USER_FIRST_NAME).fieldId(INITIATED_USER_FIRST_NAME)
				.datatype(YoroDataType.STRING.toString().toLowerCase()).build());
		fieldVoList.add(FieldVO.builder().fieldName(INITIATED_USER_lAST_NAME).fieldId(INITIATED_USER_lAST_NAME)
				.datatype(YoroDataType.STRING.toString().toLowerCase()).build());
		fieldVoList.add(FieldVO.builder().fieldName(INITIATED_USER_CONTACT_PHONE_NO).fieldId(INITIATED_USER_CONTACT_PHONE_NO)
				.datatype(YoroDataType.STRING.toString().toLowerCase()).build());

		return fieldVoList;
	}

	public String resolveInitiatedVariable(String systemVariable, UUID instanceId) {
		String resolvedValue = null;
		switch (systemVariable) {
		case INITIATED_USER_CONTACT_EMAIL_ID:
			resolvedValue = getInitiatedUserContactEmailId(instanceId);
			break;
		case INITIATED_USER_LOGIN_EMAIL_ID:
			resolvedValue = getInitiatedUserLoginEmailId(instanceId);
			break;
		case INITIATED_USER_FIRST_NAME:
			resolvedValue = getInitiatedUserFirstName(instanceId);
			break;
		case INITIATED_USER_lAST_NAME:
			resolvedValue = getInitiatedUserLastName(instanceId);
			break;
		case INITIATED_USER_CONTACT_PHONE_NO:
			resolvedValue = getInitiatedUserContactPhoneNo(instanceId);
			break;

		default:
			break;
		}
		return resolvedValue;
	}

	private User getUser(UUID instanceId) {
		ProcessInstance processInstance = processInstanceRepo.findByProcessInstanceIdAndTenantId(instanceId, YorosisContext.get().getTenantId());
		if (processInstance != null) {
			User user = usersRepo.findByUserNameAndTenantId(processInstance.getStartedBy(), YorosisContext.get().getTenantId());
			return user;
		}
		return null;
	}

	private String getInitiatedUserContactEmailId(UUID instanceId) {
		User user = getUser(instanceId);
		return user != null ? user.getContactEmailId() : "";
	}

	private String getInitiatedUserLoginEmailId(UUID instanceId) {
		User user = getUser(instanceId);
		return user != null ? user.getEmailId() : "";
	}

	private String getInitiatedUserFirstName(UUID instanceId) {
		User user = getUser(instanceId);
		return user != null ? user.getFirstName() : "";
	}

	private String getInitiatedUserLastName(UUID instanceId) {
		User user = getUser(instanceId);
		return user != null ? user.getLastName() : "";
	}

	private String getInitiatedUserContactPhoneNo(UUID instanceId) {
		User user = getUser(instanceId);
		return user != null ? user.getMobileNumber() : "";
	}

}
