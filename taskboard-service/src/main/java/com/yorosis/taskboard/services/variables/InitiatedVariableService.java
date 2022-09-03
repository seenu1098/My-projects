package com.yorosis.taskboard.services.variables;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.yorosis.taskboard.models.FieldVO;
import com.yorosis.taskboard.models.YoroDataType;
import com.yorosis.taskboard.repository.UsersRepository;

@Component
public class InitiatedVariableService {

	private static final String INITIATED_USER_CONTACT_EMAIL_ID = "initiatedUserContactEmailId";
	private static final String INITIATED_USER_LOGIN_EMAIL_ID = "initiatedUserLoginEmailId";
	private static final String INITIATED_USER_FIRST_NAME = "initiatedUserFirstName";
	private static final String INITIATED_USER_lAST_NAME = "initiatedUserLastName";
	private static final String INITIATED_USER_CONTACT_PHONE_NO = "initiatedUserContactPhoneNo";

	@Autowired
	UsersRepository usersRepo;

	public List<FieldVO> getFieldList() {
		List<FieldVO> fieldVoList = new ArrayList<>();
		fieldVoList.add(
				FieldVO.builder().fieldName(INITIATED_USER_CONTACT_EMAIL_ID).fieldId(INITIATED_USER_CONTACT_EMAIL_ID)
						.datatype(YoroDataType.STRING.toString().toLowerCase()).build());
		fieldVoList.add(FieldVO.builder().fieldName(INITIATED_USER_LOGIN_EMAIL_ID)
				.fieldId(INITIATED_USER_LOGIN_EMAIL_ID).datatype(YoroDataType.STRING.toString().toLowerCase()).build());
		fieldVoList.add(FieldVO.builder().fieldName(INITIATED_USER_FIRST_NAME).fieldId(INITIATED_USER_FIRST_NAME)
				.datatype(YoroDataType.STRING.toString().toLowerCase()).build());
		fieldVoList.add(FieldVO.builder().fieldName(INITIATED_USER_lAST_NAME).fieldId(INITIATED_USER_lAST_NAME)
				.datatype(YoroDataType.STRING.toString().toLowerCase()).build());
		fieldVoList.add(
				FieldVO.builder().fieldName(INITIATED_USER_CONTACT_PHONE_NO).fieldId(INITIATED_USER_CONTACT_PHONE_NO)
						.datatype(YoroDataType.STRING.toString().toLowerCase()).build());

		return fieldVoList;
	}
}
