package com.yorosis.yoroflow.service.decision.operators;

import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

@Component
public class OrLogicOperator implements LogicOperator {

	@Override
	public boolean operate(Deque<Boolean> stackStatus) {

		List<Boolean> listStatus = new ArrayList<>();
		while (stackStatus != null && !stackStatus.isEmpty()) {
			listStatus.add(stackStatus.pop());
		}
		if (CollectionUtils.isEmpty(listStatus)) {
			return false;
		}
		return listStatus.contains(true);

	}

	@Override
	public String getOperatorType() {

		return "OR";
	}

}
