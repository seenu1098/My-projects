package com.yorosis.yoroflow.creation.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.EmailTemplate;

public interface EmailTemplateRepository extends JpaRepository<EmailTemplate, UUID> {

	@Query("select p from EmailTemplate p where p.templateId =:templateId and p.tenantId = :tenantId and p.activeFlag=:activeFlag")
	public EmailTemplate getEmailTemplate(@Param("templateId") String templateId, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select count(p) from EmailTemplate p where p.templateId=:templateId and p.activeFlag=:activeFlag and p.tenantId=:tenantId")
	public int findByTemplateIdAndTenantId(@Param("templateId") String pageName, @Param("activeFlag") String activeFlag, @Param("tenantId") String tenantId);

	public EmailTemplate findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(UUID id, String tenantId, String activeFlag);
}
