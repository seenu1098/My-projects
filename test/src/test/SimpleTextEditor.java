package test;

import java.util.Scanner;
import java.util.Stack;

public class SimpleTextEditor {
	public static void main(String[] args) {

		Scanner sc = new Scanner(System.in);
		int n = sc.nextInt();

		String newString;
		String last;
		int option;

		int k;
		Stack<String> stack = new Stack<>();

		while (n-- > 0) {
			option = sc.nextInt();

			switch (option) {
			case 1:
				last = stack.isEmpty() ? "" : stack.peek();
				newString = last + sc.next();
				stack.push(newString);
				break;

			case 2:
				k = sc.nextInt();
				if (!stack.isEmpty()) {
					stack.push(stack.peek().substring(k));
				}
				break;

			case 3:
				k = sc.nextInt();
				if (!stack.isEmpty()) {
					System.out.println(stack.peek().charAt(k - 1));
				}
				break;

			case 4:
				stack.pop();
				break;
			}

		}

		sc.close();

		/* My Solution */
//		Scanner sc = new Scanner(System.in);
//		int n = sc.nextInt();
//
//		String s = "";
//		int c = 0;
//		Map<Integer, String> map = new HashMap<>();
//		for (int i = 0; i < n; i++) {
//			int ops = sc.nextInt();
//
//			if (ops == 1) {
//				String str = sc.next();
//				s = s + str;
//				map.put(c++, s);
//
//			} else if (ops == 2) {
//				int d = sc.nextInt();
//				s = s.substring(d);
//
//				if (s == "" || s == null || s.isEmpty()) {
//					map.put(c++, "empty");
//				} else {
//					map.put(c++, s);
//				}
//
//			} else if (ops == 3) {
//				int m = sc.nextInt();
//				if (s != null) {
//
//					System.out.println(s.charAt(m - 1));
//
//				}
//			} else if (ops == 4) {
//				map.remove(c - 1);
//				c--;
//				s = map.get(c - 1);
//
//			}
//		}
//		sc.close();
	}
}
