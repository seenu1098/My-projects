package com.yorosis.yoroflow.rendering.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.yorosis.yoroapps.entities.Users;
import com.yorosis.yoroapps.vo.FieldVO;
import com.yorosis.yoroapps.vo.YoroDataType;
import com.yorosis.yoroflow.rendering.repository.UsersRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Component
public class SystemVariableService {

	private static final String LOGGED_IN_USERNAME = "loggedInUsername";
	private static final String LOGGED_IN_USER_FIRST_NAME = "loggedInUserFirstname";
	private static final String LOGGED_IN_USER_LAST_NAME = "loggedInUserLastname";
	private static final String LOGGED_IN_USER_TENANTID = "loggedInUserTenantId";
	private static final String LOGGED_IN_USER_FULL_NAME = "loggedInUserFullname";

	private static final String CURRENT_DATE = "currentDate";
	private static final String CURRENT_TIME = "currentTime";
	private static final String CURRENT_YEAR = "currentYear";
	private static final String CURRENT_DAY_NAME = "currentDayName";
	private static final String CURRENT_DAY_MONTH = "currentMonthName";

	public List<FieldVO> getFieldList() {
		List<FieldVO> fieldVoList = new ArrayList<>();
		fieldVoList.add(FieldVO.builder().fieldName(LOGGED_IN_USERNAME).fieldId(LOGGED_IN_USERNAME)
				.dataType(YoroDataType.STRING.toString().toLowerCase()).build());
		fieldVoList.add(FieldVO.builder().fieldName(LOGGED_IN_USER_FIRST_NAME).fieldId(LOGGED_IN_USER_FIRST_NAME)
				.dataType(YoroDataType.STRING.toString().toLowerCase()).build());
		fieldVoList.add(FieldVO.builder().fieldName(LOGGED_IN_USER_FULL_NAME).fieldId(LOGGED_IN_USER_FULL_NAME)
				.dataType(YoroDataType.STRING.toString().toLowerCase()).build());
		fieldVoList.add(FieldVO.builder().fieldName(LOGGED_IN_USER_LAST_NAME).fieldId(LOGGED_IN_USER_LAST_NAME)
				.dataType(YoroDataType.STRING.toString().toLowerCase()).build());
		fieldVoList.add(FieldVO.builder().fieldName(LOGGED_IN_USER_TENANTID).fieldId(LOGGED_IN_USER_TENANTID)
				.dataType(YoroDataType.STRING.toString().toLowerCase()).build());
		fieldVoList.add(FieldVO.builder().fieldName(CURRENT_DATE).fieldId(CURRENT_DATE)
				.dataType(YoroDataType.DATE.toString().toLowerCase()).build());
		fieldVoList.add(FieldVO.builder().fieldName(CURRENT_TIME).fieldId(CURRENT_TIME).dataType("time").build());
		fieldVoList.add(FieldVO.builder().fieldName(CURRENT_DAY_NAME).fieldId(CURRENT_DAY_NAME)
				.dataType(YoroDataType.STRING.toString().toLowerCase()).build());
		fieldVoList.add(FieldVO.builder().fieldName(CURRENT_DAY_MONTH).fieldId(CURRENT_DAY_MONTH)
				.dataType(YoroDataType.STRING.toString().toLowerCase()).build());

		return fieldVoList;
	}

	public String resolveSystemVariable(String systemVariable) {
		String resolvedValue = null;
		switch (systemVariable) {
		case LOGGED_IN_USERNAME:
			resolvedValue = getLoggedInUsername();
			break;
		case LOGGED_IN_USER_FIRST_NAME:
			resolvedValue = getLoggedInUserFirstName();
			break;
		case LOGGED_IN_USER_LAST_NAME:
			resolvedValue = getLoggedInUserLastName();
			break;
		case LOGGED_IN_USER_FULL_NAME:
			resolvedValue = getLoggedInUserFullName();
			break;
		case LOGGED_IN_USER_TENANTID:
			resolvedValue = getLoggedInUserTenantId();
			break;
		case CURRENT_DATE:
			resolvedValue = getCurrentDate();
			break;
		case CURRENT_TIME:
			resolvedValue = getCurrentTime();
			break;
		case CURRENT_YEAR:
			resolvedValue = getCurrentYear();
			break;
		case CURRENT_DAY_NAME:
			resolvedValue = getCurrentDayName();
			break;
		case CURRENT_DAY_MONTH:
			resolvedValue = getCurrentMonthName();
			break;

		default:
			break;
		}
		return resolvedValue;
	}

	// public List<String>

	@Autowired
	UsersRepository usersRepo;

	private String getLoggedInUsername() {
		return YorosisContext.get().getUserName();
	}

	private String getLoggedInUserTenantId() {
		return YorosisContext.get().getTenantId();
	}

	private String getLoggedInUserFirstName() {
		Users user = usersRepo.findByUserNameAndTenantId(YorosisContext.get().getUserName(),
				YorosisContext.get().getTenantId());
		return user.getFirstName();
	}

	private String getLoggedInUserLastName() {
		Users user = usersRepo.findByUserNameAndTenantId(YorosisContext.get().getUserName(),
				YorosisContext.get().getTenantId());
		return user.getLastName();
	}

	private String getLoggedInUserFullName() {
		Users user = usersRepo.findByUserNameAndTenantId(YorosisContext.get().getUserName(),
				YorosisContext.get().getTenantId());
		return user.getFirstName().concat(" " + user.getLastName());
	}

	private String getCurrentDate() {
		return LocalDate.now().toString();
	}

	private String getCurrentTime() {
		return LocalTime.now().toString();
	}

	private String getCurrentYear() {
		return Integer.toString(LocalDate.now().getYear());
	}

	private String getCurrentDayName() {
		return LocalDate.now().getDayOfWeek().name();
	}

	private String getCurrentMonthName() {
		return LocalDate.now().getMonth().name();
	}

}
