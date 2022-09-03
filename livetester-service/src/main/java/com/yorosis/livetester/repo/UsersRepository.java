package com.yorosis.livetester.repo;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.livetester.entities.Users;

public interface UsersRepository extends JpaRepository<Users, Integer> {

	public Users findByUserName(String userName);

	public Users findByUserId(int id);

	public Users findByEmailId(String emailId);

	@Query("select count(u) from Users u where u.emailId=:emailId")
	public int getTotalUsersCount(@Param("emailId") String emailId);

	@Query("select u from Users u")
	public List<Users> getUsersList(Pageable pageable);

	@Query("select count(u) from Users u")
	public String getTotalUsersCountForGrid();

}
