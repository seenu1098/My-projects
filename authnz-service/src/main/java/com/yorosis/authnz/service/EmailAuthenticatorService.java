package com.yorosis.authnz.service;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import org.apache.commons.lang3.StringUtils;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.authnz.config.RabbitConfig;
import com.yorosis.authnz.repository.UsersRepository;
import com.yorosis.authnz.vo.QrDetailsVo;
import com.yorosis.yoroapps.automation.Email;
import com.yorosis.yoroapps.automation.EmailPerson;
import com.yorosis.yoroapps.entities.Users;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.cache.service.CacheService;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import dev.samstevens.totp.exceptions.QrGenerationException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class EmailAuthenticatorService {

	@Autowired(required = false)
	private CacheService cacheService;

	@Autowired
	private RabbitTemplate publisherTemplate;

	@Autowired
	private UsersRepository userRepository;

	private static final String TOKEN_CACHE_KEY = "token-cache";

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public QrDetailsVo emailQrSetup(QrDetailsVo qrDetails) throws QrGenerationException {
		UUID uuid = UUID.randomUUID();
		Random rnd = new Random();
		int number = rnd.nextInt(999999);
		String contactEmail = null;
		String numberString = String.format("%06d", number);
		String key = uuid.toString() + qrDetails.getUserName();
		Users user = userRepository.findByUserNameIgnoreCase(qrDetails.getUserName());
		if (user != null) {
			if (!StringUtils.equals(qrDetails.getSecret(), "verify")) {
				user.setOtpSecret(key);
				user.setOtpProvider(qrDetails.getOtpProvider());
				userRepository.save(user);
			}
			sentEmail(numberString, user);
			contactEmail = user.getContactEmailId().substring(0, 3) + "****"
					+ user.getContactEmailId().substring(user.getContactEmailId().lastIndexOf('@'));
		}
		cacheService.putKeyValue(TOKEN_CACHE_KEY, key, String.format("%06d", number), 10L, TimeUnit.MINUTES);
		return QrDetailsVo.builder().otp(uuid.toString()).qrImageUrl(contactEmail).build();
	}

	private void sentEmail(String otp, Users user) {
		Map<String, String> templateMap = new HashMap<>();
		templateMap.put("secretCode", otp);
		Set<EmailPerson> setEmailPerson = new HashSet<>();
		setEmailPerson.add(EmailPerson.builder().emailId(user.getContactEmailId()).build());
		Email email = Email.builder().tenantId(YorosisContext.get().getTenantId()).isHTML(true)
				.templateBodyId("emailAuthenticator").templateValues(templateMap).toRecipientList(setEmailPerson)
				.build();
		publishToEmail(email);
	}

	@Transactional
	public void publishToEmail(Email email) {
		try {
			log.info("### pushed to email {}", email);
			publisherTemplate.convertAndSend(RabbitConfig.DEFAULT_EXCHANGE, RabbitConfig.EMAIL_QUEUE, email);
		} catch (Exception ex) {
			// Ignore the error when the error happens as it shouldn't stop the process
			log.error("Unable to post in the queue", ex);
		}
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public ResponseStringVO checkOtp(QrDetailsVo vo) throws QrGenerationException {
		String otp = cacheService.getKeyValue(TOKEN_CACHE_KEY, vo.getSecret() + vo.getUserName());
		if (StringUtils.equals(otp, vo.getOtp())) {
			return ResponseStringVO.builder().response("valid").build();
		}
		return ResponseStringVO.builder().response("invalid").build();
	}

}
