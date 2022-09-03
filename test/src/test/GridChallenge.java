package test;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class GridChallenge {
	public static String gridChallenge(List<String> grid) {
		// Write your code here
		System.out.println(grid);
		List<String> sortedList = new ArrayList<>();
		grid.stream().forEach(t -> {
			List<Character> charList = new ArrayList<>();
			for (int i = 0; i < t.length(); i++) {
				charList.add(t.charAt(i));
			}
			Collections.sort(charList);
			StringBuilder sb = new StringBuilder();
			for (char ch : charList) {
				sb.append(ch);
			}
			sortedList.add(sb.toString());
		});
		System.out.println("List:" + sortedList);

		boolean ok = true;
		int n = sortedList.get(0).length();
		System.out.println("size:" + n);
		for (int i = 0; i < n; i++) {
			for (int j = 1; j < n; j++) {
				if (sortedList.get(j).charAt(i) < sortedList.get(j - 1).charAt(i)) {
					ok = false;
					break;
				}
			}
		}
		
//		List<Character> firstLetter = new ArrayList<>();
//		
//		for (int i = 0; i < n; i++) {
//			for (int j = 1; j < n; j++) {
//				firstLetter.add(sortedList.get(j-1).charAt(i));
//			}
//		}
//		System.out.println("firstLetterList:" + firstLetter);

		return ok ? "YES" : "NO";
	}

	public static void main(String args[]) {
//		 [abc, lmp, qrt]
//				 [mpxz, abcd, wlmf]
//						 [abc, hjk, mpq, rtv]
		List<String> list1 = new ArrayList<>();
		list1.add("abc");
		list1.add("lmp");
		list1.add("qrt");
		List<String> list2 = new ArrayList<>();
		list2.add("mpxz");
		list2.add("abcd");
		list2.add("wlmf");
		List<String> list3 = new ArrayList<>();
		list3.add("abc");
		list3.add("hjk");
		list3.add("mpq");
		list3.add("rtv");

		for (int i = 1; i < 4; i++) {
			if (i == 1)
				System.out.println(gridChallenge(list1));

			if (i == 2)
				System.out.println(gridChallenge(list2));
			if (i == 3)
				System.out.println(gridChallenge(list3));
		}

	}
}
