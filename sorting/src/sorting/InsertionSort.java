package sorting;

import java.util.Arrays;

public class InsertionSort {

	public static void main(String args[]) {
		int[] array = { 4, 2, 1, 5, 7, 3, 6 };

		insertionSort1(array);

		System.out.println(Arrays.toString(array));
	}

	// with while loop
	public static void insertionSort(int[] array) {
		for (int i = 1; i < array.length; i++) {
			int temp = array[i];
			int j = i - 1;
			while (j > -1 && temp < array[j]) {
				array[j + 1] = array[j];
				array[j] = temp;
				j--;
			}
		}
	}

	// without while loop
	public static void insertionSort1(int[] array) {
		for (int i = 1; i < array.length; i++) {
			for (int j = 0; j < i; j++) {
				if (array[i] < array[j]) {
					int temp = array[i];
					array[i] = array[j];
					array[j] = temp;
				}
			}
		}
	}

}
