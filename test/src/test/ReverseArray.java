package test;

import java.util.Arrays;

public class ReverseArray {

	public static void main(String args[]) {
		int[] array = { 1, 2, 3, 4, 5, 6 };
		int t;
//		int[] newA = new int[array.length];
		int length = array.length;
//		for (int i = 0; i < array.length; i++) {
//			int l = length - (i + 1);
//			newA[i] = array[l];
//		}

		for (int i = 0; i < length / 2; i++) {
			t = array[i];
			array[i] = array[length - i - 1];
			array[length - i - 1] = t;
		}
		System.out.println(Arrays.toString(array));
	}

}
