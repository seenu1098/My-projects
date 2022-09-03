package com.yorosis.authnz.service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.jasypt.encryption.StringEncryptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.authnz.constants.YorosisConstants;
import com.yorosis.authnz.exception.YorosisException;
import com.yorosis.authnz.repository.OrganizationRepository;
import com.yorosis.authnz.repository.TwoFactorAuthMethodRepository;
import com.yorosis.authnz.repository.UserOTPRecoveryCodesRepository;
import com.yorosis.authnz.repository.UsersRepository;
import com.yorosis.authnz.vo.QrDetailsVo;
import com.yorosis.yoroapps.entities.Customers;
import com.yorosis.yoroapps.entities.Organization;
import com.yorosis.yoroapps.entities.TwoFactorAuthMethods;
import com.yorosis.yoroapps.entities.UserOTPRecoveryCodes;
import com.yorosis.yoroapps.entities.Users;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.ResponseStringVO.ResponseStringVOBuilder;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.exceptions.QrGenerationException;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.QrDataFactory;
import dev.samstevens.totp.qr.QrGenerator;
import dev.samstevens.totp.recovery.RecoveryCodeGenerator;
import dev.samstevens.totp.secret.SecretGenerator;

@Service
public class QrSetUpService {
	@Autowired
	private SecretGenerator secretGenerator;

	@Autowired
	private QrDataFactory qrDataFactory;

	@Autowired
	private QrGenerator qrGenerator;

	@Autowired
	private RecoveryCodeGenerator recoveryCodeGenerator;

	@Autowired
	private CodeVerifier verifier;

	@Autowired
	private UsersRepository userRepository;

	@Autowired
	private TwoFactorAuthMethodRepository twoFactorAuthMethodRepository;

	@Autowired
	private OrganizationRepository organizationRepository;

	@Autowired
	private UserOTPRecoveryCodesRepository userOTPRecoveryCodesRepository;

	@Autowired
	private DomainService domainService;

	@Autowired
	@Qualifier("jasyptEncryptor")
	private StringEncryptor jasyptEncryptor;

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public QrDetailsVo qrSetUp(String userName, String domain) throws QrGenerationException {
		// Generate and store the secret
		String secret = secretGenerator.generate();

		QrData data = qrDataFactory.newBuilder().label(userName).secret(secret).issuer(domain).build();
//		String[] codes = saveSecret(userName, secret);
		// Generate the QR code image data as a base64 string which
		// can be used in an <img> tag:
		return QrDetailsVo.builder().secret(secret)
				.qrImageUrl(getDataUriForImage(qrGenerator.generate(data), qrGenerator.getImageMimeType())).build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public ResponseStringVO checkTwoFactor(QrDetailsVo qrDetails, Customers customers) throws YorosisException {
		Users user = userRepository.findByUserNameIgnoreCase(qrDetails.getUserName());
		ResponseStringVOBuilder responseString = ResponseStringVO.builder();
		responseString.isSubscriptionExpired(domainService.isSubscriptionExpired(customers))
				.isAdminOrBillingRole(domainService.isAdminOrBillingRole())
				.isPayingCustomer(customers.getIsPayingCustomer())
				.remainingDays(domainService.getRemainingDays(customers)).customerId(customers.getId());

		if (checkTwoFactorEnabled(user)) {
			List<String> twoFactorNameList = new ArrayList<String>();
			List<TwoFactorAuthMethods> twoFactorAuthMethodsList = twoFactorAuthMethodRepository
					.getTwoFactorAuthMethodsList(YorosisConstants.YES, YorosisContext.get().getTenantId());
			twoFactorAuthMethodsList.stream().forEach(f -> {
				twoFactorNameList.add(f.getMethodName());
			});
			if (!StringUtils.isEmpty(user.getOtpSecret()) && twoFactorNameList.contains(user.getOtpProvider())) {
				return responseString.isDisable(true).twoFactorMethods(twoFactorNameList)
						.otpProvider(user.getOtpProvider()).response("valid").build();
			} else {
				return responseString.isDisable(false).twoFactorMethods(twoFactorNameList).response("valid").build();
			}
		}

		return responseString.isDisable(false).response("invalid").build();
	}

	private boolean checkTwoFactorEnabled(Users user) {
		if (user != null) {
			Organization organization = organizationRepository.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
					YorosisContext.get().getTenantId(), YorosisConstants.YES);
			if (organization != null && StringUtils.equals(organization.getEnableTwofactor(), YorosisConstants.YES)
					|| StringUtils.equals(user.getIsTwoFactor(), YorosisConstants.YES)) {
				return true;
			}
		}
		return false;
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public boolean checkOtp(String code, String userName) {
		Users user = userRepository.findByUserNameIgnoreCase(userName);
		if (user != null) {
			String secret = (StringUtils.isEmpty(user.getOtpSecret())) ? null
					: jasyptEncryptor.decrypt(user.getOtpSecret());
			if (verifier.isValidCode(secret, code) || getRecovery(code, user)) {
				return true;
			}
		}
		return false;
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public QrDetailsVo checkSetUpOtp(QrDetailsVo qrDetailsVo) {
		if (StringUtils.equals(qrDetailsVo.getIsCheck(), "verify")) {
			return QrDetailsVo.builder()
					.userName(checkOtp(qrDetailsVo.getOtp(), qrDetailsVo.getUserName()) ? "valid" : "invalid").build();
		} else {
			if (verifier.isValidCode(qrDetailsVo.getSecret(), qrDetailsVo.getOtp())) {
				return QrDetailsVo.builder().userName("valid").codes(
						saveSecret(qrDetailsVo.getUserName(), qrDetailsVo.getSecret(), qrDetailsVo.getOtpProvider()))
						.build();

			}
		}
		return QrDetailsVo.builder().userName("invalid").build();
	}

	private boolean getRecovery(String code, Users user) {
		if (user != null) {
			UserOTPRecoveryCodes userOTPRecoveryCodes = userOTPRecoveryCodesRepository.getRecoveryCode(code,
					YorosisContext.get().getTenantId(), YorosisConstants.YES, user.getUserId());
			if (userOTPRecoveryCodes != null) {
				userOTPRecoveryCodes.setActiveFlag(YorosisConstants.NO);
				userOTPRecoveryCodesRepository.save(userOTPRecoveryCodes);
				return true;
			}
		}
		return false;
	}

	private String[] saveRecoveryCodes(Users user) {
		List<UserOTPRecoveryCodes> userOTPRecoveryCodesList = userOTPRecoveryCodesRepository
				.getRecoveryCodeByUserId(user.getTenantId(), YorosisConstants.YES, user.getUserId());
		if (!userOTPRecoveryCodesList.isEmpty())
			userOTPRecoveryCodesRepository.deleteAll(userOTPRecoveryCodesList);
		String[] codes = recoveryCodeGenerator.generateCodes(10);
		for (String recoveryCode : codes) {
			userOTPRecoveryCodesRepository.save(constructDTo(user, recoveryCode));
		}
		return codes;
	}

	private UserOTPRecoveryCodes constructDTo(Users user, String recoveryCode) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return UserOTPRecoveryCodes.builder().recoveryCodes(recoveryCode).tenantId(user.getTenantId())
				.userId(user.getUserId()).createdBy(user.getEmailId()).activeFlag(YorosisConstants.YES)
				.createdOn(timestamp).build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	private String[] saveSecret(String userName, String secret, String otpProvider) {
		Users user = userRepository.findByUserNameIgnoreCase(userName);
		if (user != null) {
			user.setOtpSecret((StringUtils.isEmpty(secret)) ? null : jasyptEncryptor.encrypt(secret));
			user.setOtpProvider(otpProvider);
			userRepository.save(user);
			return saveRecoveryCodes(user);
		}
		return null;
	}

	private String getDataUriForImage(byte[] byteArray, String mineType) {
		return "data:image/jpeg;base64," + Base64.getEncoder().encodeToString(byteArray);

	}

}
