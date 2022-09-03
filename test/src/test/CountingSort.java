package test;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class CountingSort {
	public static List<Integer> countingSort(List<Integer> arr) {
		// Write your code here
		List<Integer> list = new ArrayList<>();
		// IntStream.range(0, arr.size())
		// .forEach(index -> {
		// long count = arr.stream().filter(t->t==index).count();
		// list.add((int) count);
		// });

		// arr.stream().collect(Collectors.g)

		// return list.stream().limit(100).collect(Collectors.toList());

		int[] frequencies = new int[100];

		for (int i = 0; i < arr.size(); i++) {
			int num = arr.get(i);
			System.out.println("frequencies[num]:" + frequencies[num]);
			frequencies[num] = frequencies[num] + 1;
			System.out.println("array:" + num + " " + frequencies[num]);
		}

		for (int i = 0; i < frequencies.length; i++) {
			list.add(frequencies[i]);
		}
		return list;
	}

	public static void main(String[] args) throws IOException {

		List<Integer> list = new ArrayList<Integer>();
		list.add(3);
		list.add(1);
		list.add(1);
		list.add(2);
		list.add(2);
		list.add(3);
		list.add(3);
		list.add(3);
		list.add(4);

		System.out.println(countingSort(list));
	}
}
