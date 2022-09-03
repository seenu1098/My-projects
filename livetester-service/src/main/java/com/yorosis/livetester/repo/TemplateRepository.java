
package com.yorosis.livetester.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.livetester.entities.Template;

public interface TemplateRepository extends JpaRepository<Template, Long> {

	public Template findByTemplateName(String name);

	@Query("select t.templateName from Template t")
	public List<String> getTemplateList();

	@Query("select count(t) from Template t where t.templateName=:name")
	public int getTemplateCount(@Param("name") String name);

	public List<Template> findAllByOrderByIdDesc();

	@Query("select t from Template t where t.createdBy=:user")
	public List<Template> findTemplateByUser(String user);

}
