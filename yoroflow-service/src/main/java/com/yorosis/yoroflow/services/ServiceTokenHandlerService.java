package com.yorosis.yoroflow.services;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroflow.entities.ServiceToken;
import com.yorosis.yoroflow.entities.User;
import com.yorosis.yoroflow.models.ServiceTokenVO;
import com.yorosis.yoroflow.repository.ServiceTokenRepository;
import com.yorosis.yoroflow.repository.UsersRepository;

@Service
public class ServiceTokenHandlerService {

	@Autowired
	private ServiceTokenRepository serviceTokenRepository;

	@Autowired
	private UsersRepository usersRepository;

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public ServiceTokenVO loadServiceTokenByUserName(String userName) {
		User user = usersRepository.findByUserName(userName);
		if (user == null) {
			return null;
		}

		ServiceToken serviceToken = serviceTokenRepository.getInternalServiceTokenByUserId(user.getUserId());
		if (serviceToken == null || StringUtils.isBlank(serviceToken.getApiKey()) || StringUtils.isBlank(serviceToken.getSecretKey())) {
			return null;
		}
		if (StringUtils.isNotEmpty(serviceToken.getSecretKey())) {
			return ServiceTokenVO.builder().apiKey(serviceToken.getApiKey()).secretKey(serviceToken.getSecretKey()).build();
		}

		return null;

	}

}
