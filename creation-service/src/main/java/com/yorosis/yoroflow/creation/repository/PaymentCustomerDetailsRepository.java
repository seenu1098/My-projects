package com.yorosis.yoroflow.creation.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yorosis.yoroapps.entities.PaymentCustomerDetails;

public interface PaymentCustomerDetailsRepository extends JpaRepository<PaymentCustomerDetails, UUID> {

}
