package test1;

import java.util.HashMap;

public class ItemsInCommon {
	public static boolean itemsInCommon(int a[], int b[]) {
		// o(n) More Time Complexity if data is large

		/*
		 * for(int i : a) { for(int j :b) { if(i==j) return true; } } return false;
		 */

		// o(1) less Time Complexity even if data is large
		HashMap<Integer, Boolean> hashMap = new HashMap<>();

		for (int i : a) {
			hashMap.put(i, true);
		}

		for (int j : b) {
			if (hashMap.get(j) != null)
				return true;
		}

		return false;
	}

	public static void main(String args[]) {

		int a[] = { 1, 3, 5 };
		int b[] = { 8, 9, 5 };

		System.out.println(itemsInCommon(a, b));

	}

}
