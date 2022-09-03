package com.yorosis.yoroflow.service.decision.operators;

import java.util.Deque;

public interface LogicOperator {

	public boolean operate(Deque<Boolean> stackStatus);

	public String getOperatorType();

}
