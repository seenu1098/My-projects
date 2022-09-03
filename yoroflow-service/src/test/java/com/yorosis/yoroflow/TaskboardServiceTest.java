package com.yorosis.yoroflow;

import java.sql.SQLException;

import javax.sql.DataSource;

import org.junit.jupiter.api.AfterEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.yorosis.yoroflow.repository.TaskboardColumnsRepository;
import com.yorosis.yoroflow.repository.TaskboardRepository;
import com.yorosis.yoroflow.repository.TaskboardTaskAssignedUsersRepository;
import com.yorosis.yoroflow.repository.TaskboardTaskCommentsRepository;
import com.yorosis.yoroflow.repository.TaskboardTaskRepository;
import com.yorosis.yoroflow.repository.UsersRepository;

@SpringBootTest
@ActiveProfiles(profiles = { "default", "test" })
public class TaskboardServiceTest extends AbstractBaseTest {

	@Autowired
	private DataSource datasource;

	@Autowired
	private TaskboardRepository taskboardRepository;

	@Autowired
	private TaskboardTaskRepository taskboardTaskRepository;

	@Autowired
	private UsersRepository userRepository;

	@Autowired
	private TaskboardColumnsRepository taskboardColumnsRepository;

	@Autowired
	private TaskboardTaskCommentsRepository taskboardTaskCommentsRepository;

	@Autowired
	private TaskboardTaskAssignedUsersRepository taskboardTaskAssignedUsersRepository;

	@AfterEach
	public void clearData() throws SQLException {
//		batchRepository.deleteAll();
//		environmentRepository.deleteAll();
		clearSequences();
	}

	@Override
	protected DataSource getDatasource() {
		return datasource;
	}

}
