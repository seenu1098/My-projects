package sorting;

import java.util.Arrays;

public class Sorting {
	private static void printArray(String s, int[] x) {
		System.out.print(s + " Array: ");
		for (int i : x) {
			System.out.print(i + " ");
		}
		System.out.println();
	}

	// o(n)
	public static void bubbleSort(int[] x) {
		printArray("Initial", x);

		int endPosition = x.length - 1;
		int swapPosition;

		while (endPosition > 0) {
			swapPosition = 0;

			for (int i = 0; i < endPosition; i++) {

				if (x[i] > x[i + 1]) {
					// Swap elements 'i' and 'i + 1':
					int tmp = x[i];
					x[i] = x[i + 1];
					x[i + 1] = tmp;

					swapPosition = i;
				} // end if

				printArray("Current", x);
			} // end for

			endPosition = swapPosition;
		} // end while

		printArray("Sorted", x);
	} // end bubbleSort

	public static void main(String[] args) {
//		Scanner scan = new Scanner(System.in);
//		int n = scan.nextInt();
//		int[] unsorted = new int[n];
//		for (int i = 0; i < n; i++) {
//			unsorted[i] = scan.nextInt();
//		}
//		scan.close();
		int[] unsorted = { 4, 5, 1, 3, 2, 7, 9, 8 };
		bubbleSort(unsorted);
		bubbleSort1(unsorted);

		System.out.println(Arrays.toString(unsorted));
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
}
