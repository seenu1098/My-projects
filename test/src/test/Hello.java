package test;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class Hello {

	public static void main(String[] args) {
		List<Integer> list = new ArrayList<>();
		list.add(9);
		list.add(2);
		list.add(3);
		list.add(8);
		
		List<Integer> sortedList = list.stream().sorted().collect(Collectors.toList());
		int size = sortedList.size();
		int median;
		if (size % 2 == 0) {
			median = (sortedList.get(size / 2) + sortedList.get((size -1) / 2)) / 2;
		} else {
			System.out.println(size / 2);
			median = sortedList.get(size / 2);
		}
		System.out.println(sortedList);
		System.out.println(median);
	}
}
