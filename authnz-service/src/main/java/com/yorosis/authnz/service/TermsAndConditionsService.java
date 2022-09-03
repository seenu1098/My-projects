package com.yorosis.authnz.service;

import java.sql.Timestamp;
import java.util.Enumeration;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.yorosis.authnz.repository.LoginHistoryRepository;
import com.yorosis.authnz.repository.OrgTermsAcceptedRepository;
import com.yorosis.authnz.repository.UsersRepository;
import com.yorosis.yoroapps.entities.LoginHistory;
import com.yorosis.yoroapps.entities.OrgTermsAccepted;
import com.yorosis.yoroapps.entities.Users;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class TermsAndConditionsService {
	@Autowired
	private UsersRepository userRepository;

	@Autowired
	private LoginHistoryRepository loginHistoryRepository;

	@Autowired
	private OrgTermsAcceptedRepository orgTermsAcceptedRepository;
	
	private static final String[] IP_HEADER_CANDIDATES = { "X-Forwarded-For", "Proxy-Client-IP", "WL-Proxy-Client-IP", "HTTP_X_FORWARDED_FOR",
			"HTTP_X_FORWARDED", "HTTP_X_CLUSTER_CLIENT_IP", "HTTP_CLIENT_IP", "HTTP_FORWARDED_FOR", "HTTP_FORWARDED", "HTTP_VIA", "REMOTE_ADDR" };

	@Transactional
	private Users getLoggedInUser() {
		return userRepository.findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
				YorosisContext.get().getUserName(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
	}

	@Transactional
	public Boolean handleTermsAndConditions() {
		Users user = getLoggedInUser();
		Boolean returnValue = false;
		if (user.getTermsAccepted() == null || StringUtils.equals(user.getTermsAccepted(), YorosisConstants.NO)) {
			returnValue = false;
		} else {
			returnValue = true;
		}
		return returnValue;
	}

	private OrgTermsAccepted contructOrgTermsDTO(String remoteIp, Users user) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return OrgTermsAccepted.builder().termsAcceptedIpFrom(remoteIp).termsAcceptedDate(timestamp)
				.tenantId(YorosisContext.get().getTenantId()).activeFlag(YorosisConstants.YES).craetedDate(timestamp)
				.createdBy(YorosisContext.get().getUserName()).users(user).build();
	}

	private LoginHistory contructLoginDTO(String remoteIp, Users user) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return LoginHistory.builder().loginIpFrom(remoteIp).tenantId(YorosisContext.get().getTenantId())
				.activeFlag(YorosisConstants.YES).craetedDate(timestamp).createdBy(YorosisContext.get().getUserName())
				.users(user).build();
	}

	@Transactional
	public ResponseStringVO saveOrgTerms(String remoteIp) {
		Users user = getLoggedInUser();
		
		OrgTermsAccepted orgTermsAccepted = contructOrgTermsDTO(remoteIp, user);
//		LoginHistory loginHistory = contructLoginDTO(remoteIp, user);
		orgTermsAcceptedRepository.save(orgTermsAccepted);
//		loginHistoryRepository.save(loginHistory);
		
		user.setTermsAccepted(YorosisConstants.YES);
		userRepository.save(user);
		
		return ResponseStringVO.builder().response("Login IP saved successfully").build();
	}
	
	@Transactional
	public ResponseStringVO saveLoginDetails() {
		Users user = getLoggedInUser();
		String remoteIp = getClientIpAddressIfServletRequestExist();
		if (StringUtils.isBlank(remoteIp)) {
			remoteIp = "0.0.0.0";
		}
		LoginHistory loginHistory = contructLoginDTO(remoteIp, user);
		loginHistory = loginHistoryRepository.save(loginHistory);
		return ResponseStringVO.builder().pageId(loginHistory.getId()).response("Login History saved successfully").build();
	}
	
	private String getClientIpAddressIfServletRequestExist() {
		RequestAttributes requestAttributes = RequestContextHolder.getRequestAttributes();
		if (requestAttributes == null) {
			return "0.0.0.0";
		}

		HttpServletRequest request = ((ServletRequestAttributes) requestAttributes).getRequest();
		Enumeration<String> headerNames = request.getHeaderNames();
		while (headerNames.hasMoreElements()) {
			String header = headerNames.nextElement();
			System.out.println("###" + header + "####" + request.getHeader(header) + "###");
		}
		
		for (String header : IP_HEADER_CANDIDATES) {
			String ipAddress = request.getHeader(header);
			if (StringUtils.isNotBlank(ipAddress) && !StringUtils.equalsIgnoreCase("unknown", ipAddress)) {
				return ipAddress.split(",")[0];
			}
		}

		return request.getRemoteAddr();
	}
}
