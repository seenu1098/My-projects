package test;

import java.util.Arrays;

public class MergeSort {

	public static void main(String args[]) {
		int a[] = { 4, 3, 6, 5, 2, 1, 8, 7 };
		System.out.println(Arrays.toString(mergeSort(a)));
	}

	public static int[] mergeSort(int[] a) {
		if (a.length == 1)
			return a;
		int mid = a.length / 2;
		int[] left = Arrays.copyOfRange(a, 0, mid);
		int[] right = Arrays.copyOfRange(a, mid, a.length);
		return sort(mergeSort(left), mergeSort(right));
	}

	public static int[] sort(int[] a1, int[] a2) {
		int[] combined = new int[a1.length + a2.length];
		int index = 0;
		int i = 0;
		int j = 0;

		while (i < a1.length && j < a2.length) {
			if (a1[i] < a2[j]) {
				combined[index] = a1[i];
				index++;
				i++;
			} else {
				combined[index] = a2[j];
				index++;
				j++;
			}
		}

		while (i < a1.length) {
			combined[index] = a1[i];
			index++;
			i++;
		}

		while (j < a2.length) {
			combined[index] = a2[j];
			index++;
			j++;
		}

		return combined;
	}

}
