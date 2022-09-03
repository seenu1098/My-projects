package com.yorosis.yoroflow.creation.service;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroapps.entities.Organization;
import com.yorosis.yoroapps.entities.TwoFactorAuthMethods;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.TwoFactorAuthVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.OrganizationRepository;
import com.yorosis.yoroflow.creation.repository.TwoFactorAuthMethodRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class TwoFactorAuthMethodService {

	@Autowired
	private TwoFactorAuthMethodRepository twoFactorAuthMethodRepository;

	@Autowired
	private OrganizationRepository organizationRepository;

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public ResponseStringVO addTwoFactorAuth(TwoFactorAuthVO twofactor) {
		ResponseStringVO response = null;
		List<TwoFactorAuthMethods> twoFactorAuthMethodsList = twoFactorAuthMethodRepository.findAll();
		twoFactorAuthMethodsList.stream().forEach(f -> {
			f.setActiveFlag(twofactor.getSelectedTwofactorsList().contains(f.getMethodName()) ? YoroappsConstants.YES : YoroappsConstants.NO);
		});
		twoFactorAuthMethodRepository.saveAll(twoFactorAuthMethodsList);
		Organization organization = organizationRepository.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(YorosisContext.get().getTenantId(),
				YoroappsConstants.YES);
		if (organization != null) {
			organization.setEnableTwofactor(booleanToChar(twofactor.isEnableTwoFactor()));
			organizationRepository.save(organization);
		}
		response = ResponseStringVO.builder().response("Two Factor Auth Method are updated").build();
		return response;
	}

	@Transactional
	public ResponseStringVO updateTwofactor(TwoFactorAuthVO twofactor) {
		ResponseStringVO response = null;
		List<TwoFactorAuthMethods> twoFactorAuthMethodsList = twoFactorAuthMethodRepository.findAll();
		twoFactorAuthMethodsList.stream().forEach(f -> {
			f.setActiveFlag(twofactor.getSelectedTwofactorsList().contains(f.getMethodName()) ? YoroappsConstants.YES : YoroappsConstants.NO);
		});
		twoFactorAuthMethodRepository.saveAll(twoFactorAuthMethodsList);
		Organization organization = organizationRepository.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(YorosisContext.get().getTenantId(),
				YoroappsConstants.YES);
		if (organization != null) {
			organization.setEnableTwofactor(booleanToChar(twofactor.isEnableTwoFactor()));
			organizationRepository.save(organization);
		}
		response = ResponseStringVO.builder().response("Two Factor Auth Method are updated").build();
		return response;
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public TwoFactorAuthVO getTwoFactorList() {
		List<String> twoFactorNameList = new ArrayList<String>();
		List<String> selectedTwoFactorList = new ArrayList<String>();
		boolean hasTwoFactor = false;
		List<TwoFactorAuthMethods> twoFactorAuthMethodsList = twoFactorAuthMethodRepository
				.getTwoFactorAuthMethodsListWithoutActiveFlag(YorosisContext.get().getTenantId());
		twoFactorAuthMethodsList.stream().forEach(f -> {
			twoFactorNameList.add(f.getMethodName());
			if (StringUtils.equals(f.getActiveFlag(), YoroappsConstants.YES)) {
				selectedTwoFactorList.add(f.getMethodName());
			}
		});
		Organization organization = organizationRepository.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(YorosisContext.get().getTenantId(),
				YoroappsConstants.YES);
		if (organization != null) {
			hasTwoFactor = charToBoolean(organization.getEnableTwofactor());
		}
		return TwoFactorAuthVO.builder().enableTwoFactor(hasTwoFactor).selectedTwofactorsList(selectedTwoFactorList).twoFactorsList(twoFactorNameList).build();
	}

	@Transactional
	public TwoFactorAuthVO getTwoFactorListFromSameDomain() {
		List<String> twoFactorNameList = new ArrayList<String>();
		List<String> selectedTwoFactorList = new ArrayList<String>();
		boolean hasTwoFactor = false;
		List<TwoFactorAuthMethods> twoFactorAuthMethodsList = twoFactorAuthMethodRepository
				.getTwoFactorAuthMethodsListWithoutActiveFlag(YorosisContext.get().getTenantId());
		twoFactorAuthMethodsList.stream().forEach(f -> {
			twoFactorNameList.add(f.getMethodName());
			if (StringUtils.equals(f.getActiveFlag(), YoroappsConstants.YES)) {
				selectedTwoFactorList.add(f.getMethodName());
			}
		});
		Organization organization = organizationRepository.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(YorosisContext.get().getTenantId(),
				YoroappsConstants.YES);
		if (organization != null) {
			hasTwoFactor = charToBoolean(organization.getEnableTwofactor());
		}
		return TwoFactorAuthVO.builder().enableTwoFactor(hasTwoFactor).selectedTwofactorsList(selectedTwoFactorList).twoFactorsList(twoFactorNameList).build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void getTwoFactorListFromCustomer(ResponseStringVO responseStringVO) {
		List<String> twoFactorNameList = new ArrayList<String>();
		Organization organization = organizationRepository.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(YorosisContext.get().getTenantId(),
				YoroappsConstants.YES);
		if (organization != null) {
			responseStringVO.setDisable(charToBoolean(organization.getEnableTwofactor()));
		}
		List<TwoFactorAuthMethods> twoFactorAuthMethodsList = twoFactorAuthMethodRepository.getTwoFactorAuthMethodsList(YoroappsConstants.YES,
				YorosisContext.get().getTenantId());
		twoFactorAuthMethodsList.stream().forEach(f -> {
			twoFactorNameList.add(f.getMethodName());
		});
		responseStringVO.setTwoFactorMethods(twoFactorNameList);
	}

	private String booleanToChar(boolean value) {
		return value ? YoroappsConstants.YES : YoroappsConstants.NO;
	}

	private boolean charToBoolean(String value) {
		return StringUtils.equalsIgnoreCase(YoroappsConstants.YES, value);
	}

}
