package test;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class Pairs {
	public static int getPairs(int k, List<Integer> arr) {
		int p = 0;

		Set<Integer> set = new HashSet<>();
		for (int i = 0; i < arr.size(); i++) {
			set.add(arr.get(i));
			if (set.contains(arr.get(i) + k)) {
				p++;
			}
			if (set.contains(arr.get(i) - k)) {
				p++;
			}
		}

		return p;
	}

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		List<Integer> arr = new ArrayList<Integer>();
		arr.add(1);
		arr.add(5);
		arr.add(4);
		arr.add(3);
		arr.add(2);
		System.out.println(getPairs(2, arr));
	}

}
