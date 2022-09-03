package com.yorosis.yoroflow.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yorosis.yoroflow.entities.MessageGroups;

public interface MessageGroupsRepository extends JpaRepository<MessageGroups, UUID> {

}
