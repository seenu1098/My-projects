package com.yorosis.livetester.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yorosis.livetester.entities.Categories;

public interface TestcaseGroupsRepository extends JpaRepository<Categories, Long> {

	public Categories findById(long id);

	public Categories findByTestcaseGroupName(String name);

	public List<Categories> findAllByOrderByIdDesc();

}
