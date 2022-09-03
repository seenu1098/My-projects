package com.yorosis.authnz.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yorosis.yoroapps.entities.OrgTermsAccepted;

public interface OrgTermsAcceptedRepository extends JpaRepository<OrgTermsAccepted, UUID> {
	
}
