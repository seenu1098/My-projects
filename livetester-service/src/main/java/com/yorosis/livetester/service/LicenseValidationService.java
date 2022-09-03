package com.yorosis.livetester.service;

import java.io.IOException;

import javax.annotation.PostConstruct;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.yorosis.livetester.exception.LicenseException;

import javax0.license3j.Feature;
import javax0.license3j.License;
import javax0.license3j.io.IOFormat;
import javax0.license3j.io.LicenseReader;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class LicenseValidationService {
	private static final String MODULE_ID = "livetester";
	private static final long LICENSE_INTERVAL_CHECK_TIME = 10 * 60_000L;

	@Value("${license.file}")
	private String licenseFile;

	private License license = null;

	private long lastLicenseCheck = 0;

	@PostConstruct
	private void validateDuringStartup() {
		validateLicense();
	}

	public void validateLicense() {
		if (license == null) {
			log.info("Reading license file: {}", licenseFile);
			try (LicenseReader reader = new LicenseReader(licenseFile)) {
				license = reader.read(IOFormat.STRING);
			} catch (IOException e) {
				throw new LicenseException("LIC100", "Invalid License", e);
			}
		}

		if (lastLicenseCheck + LICENSE_INTERVAL_CHECK_TIME > System.currentTimeMillis()) {
			log.debug("Interval for license check is still not expired.  Skipping license check. Remaining seconds: "
					+ ((lastLicenseCheck + LICENSE_INTERVAL_CHECK_TIME) - System.currentTimeMillis()) / 1000);
			return;
		}
		lastLicenseCheck = System.currentTimeMillis();

		Feature moduleFeature = getFeature("moduleId", license);
		if (moduleFeature != null && StringUtils.containsAny(MODULE_ID, moduleFeature.getString().split(","))) {
			// good to go
		} else {
			throw new LicenseException("LIC101", "Module Id [" + MODULE_ID + "] is not licensed to use", null);
		}

		Feature endFeature = getFeature("endDate", license);
		if (endFeature != null && endFeature.getDate() != null) {
			if (endFeature.getDate().getTime() < System.currentTimeMillis()) {
				throw new LicenseException("LIC102", "License has expired or not a valid license " + endFeature.getDate(), null);
			}
		} else {
			throw new LicenseException("LIC103", "License is invalid as it doesn't have expiration date", null);
		}

		log.info("License is valid for the customer");
	}

	public void validateUserLimit(long activeUserCount) {
		Feature userFeature = getFeature("users", license);

		if (userFeature != null && userFeature.getLong() > activeUserCount) {
			// good to go
		} else {
			if (userFeature != null) {
				throw new LicenseException("LIC104", "Total no. of users allowed is [" + userFeature.getLong()
						+ "].  But total no. of users active in the system is [" + activeUserCount + "]", null);
			} else {
				throw new LicenseException("LIC104", "Invalid license without total users allowed.  Please request a new license with a user limit", null);
			}
		}
	}

	private Feature getFeature(String featureName, License license) {
		return license.get(featureName);
	}
}
