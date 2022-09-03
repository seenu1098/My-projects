package test;

import java.util.Stack;

public class BalanceBraackets {
	public static String isBalanced(String s) {
		// Write your code here
		char ch[] = s.toCharArray();

		if (s == null || s.length() % 2 != 0) {
			return "NO";
		}

		Stack<Character> stack = new Stack<>();

		for (int i = 0; i < ch.length; i++) {
			if (ch[i] == '(' || ch[i] == '{' || ch[i] == '[') {
				stack.push(ch[i]);
			} else if (ch[i] == ')' || ch[i] == '}' || ch[i] == ']') {
				if (!stack.isEmpty()) {
					char c = stack.pop();
					if (c != '(' && ch[i] == ')') {
						return "NO";
					} else if (c != '{' && ch[i] == '}') {
						return "NO";
					} else if (c != '[' && ch[i] == ']') {
						return "NO";
					}
				} else {
					return "NO";
				}
			}
		}

		return stack.isEmpty() ? "YES" : "NO";

	}

	public static void main(String args[]) {
		System.out.println(isBalanced("{[()]}"));
	}
	
	
}
