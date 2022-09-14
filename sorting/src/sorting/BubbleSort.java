package sorting;

import java.util.Arrays;

public class BubbleSort {

	public static void bubbleSort(int[] array) {
		int endPosition = array.length - 1;
		int swapPosition;

		while (endPosition > 0) {
			swapPosition = 0;
			for (int i = 0; i < endPosition; i++) {
				if (array[i] > array[i + 1]) {
					int temp = array[i];
					array[i] = array[i + 1];
					array[i + 1] = temp;
					swapPosition = i;
				}
			}
			endPosition = swapPosition;
		}
	}

	public static void bubbleSort1(int[] array) {
		for (int i = array.length - 1; i > 0; i--) {
			for (int j = 0; j < i; j++) {
				if (array[j] > array[j + 1]) {
					int temp = array[j];
					array[j] = array[j + 1];
					array[j + 1] = temp;
				}
			}
		}
	}

	public static void main(String[] args) {
		// TODO Auto-generated method stub

		int[] array = { 4, 6, 3, 2, 9, 1, 8 };

		bubbleSort1(array);

		System.out.println(Arrays.toString(array));

	}

}
