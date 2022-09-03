package com.yorosis.yoroflow.creation.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import com.yorosis.yoroapps.entities.Users;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.RecoveryCodesRepository;
import com.yorosis.yoroflow.creation.repository.UsersRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class QrService {

	@Autowired
	private RecoveryCodesRepository recoveryCodesRepository;

	@Autowired
	private UsersRepository usersRepository;

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void removeAuthentication() {
		if (recoveryCodesRepository.count() >= 1) {
			List<Users> users = usersRepository.getAllUsersWithTwoFactorSecret(YorosisContext.get().getTenantId(), YoroappsConstants.YES);
			if (!CollectionUtils.isEmpty(users)) {
				for (Users user : users) {
					user.setOtpProvider(null);
					user.setOtpSecret(null);
					usersRepository.save(user);
				}
			}
			recoveryCodesRepository.deleteAll();
		}
	}

}
