package test3;

import java.util.Arrays;

public class Sorting1DArray {

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		int[] arr = { 69, 75, 81, 93, 100, 2, 4, 6, 10, 18, 32, 48, 51 };
		Arrays.sort(arr);
		System.out.println(Arrays.toString(arr));

		for (int i = 0; i < arr.length; i++) {
			for (int j = i + 1; j < arr.length; j++) {
				if (arr[i] > arr[j]) {
					int temp = arr[i];
					arr[j] = arr[i];
					arr[i] = temp;
				}
			}
		}

		System.out.println(Arrays.toString(arr));

	}

}
