package com.yorosis.yoroflow.creation.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.ServiceToken;

public interface ServiceTokenRepository extends JpaRepository<ServiceToken, UUID> {

	public ServiceToken findBySecretKey(String secretKey);

	@Query("select st from ServiceToken st where  st.secretKey = :secretKey and st.activeFlag = :activeFlag and st.internal='N'")
	public ServiceToken getServiceTokenBySecretKey(@Param("secretKey") String secretKey, @Param("activeFlag") String flag);

	@Query("select st from ServiceToken st where  st.users.userId = :userId and st.activeFlag = :activeFlag and st.internal='N'")
	public List<ServiceToken> getServiceTokensByUserId(@Param("userId") UUID userId, @Param("activeFlag") String flag);

	@Query("select st from ServiceToken st where  st.id = :id and st.users.userId = :userId and st.activeFlag = :activeFlag and st.internal='N'")
	public ServiceToken getServiceTokenByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId, @Param("activeFlag") String flag);

	@Query("select st from ServiceToken st where  st.users.userId = :userId and st.apiKey = :apiKey and st.internal='N'")
	public ServiceToken getServiceTokenByUserIdAndApiKey(@Param("userId") UUID userId, @Param("apiKey") String apiKey);
}