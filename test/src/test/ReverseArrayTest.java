package test;

import java.util.Arrays;

public class ReverseArrayTest {

	public static void main(String args[]) {
		int[] a = { 1, 2, 3, 4, 5, 6, 7, 8 };

		int t;
		int length = a.length;
		for (int i = 0; i < length / 2; i++) {
			t = a[i];
			a[i] = a[length - i - 1];
			a[length - i - 1] = t;
		}

		System.out.println(Arrays.toString(a));
	}
}
