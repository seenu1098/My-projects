package test3;

import java.util.Arrays;

public class TwoDBinarySearch {

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		int[][] arr = { { 1, 2, 3, 4 }, { 5, 6, 7, 8 } };
		
		System.out.println(arr.length);
		System.out.println(Arrays.toString(search(arr, 8)));

	}

	static int[] search(int[][] arr, int target) {
		int r = 0;
		int c = arr[0].length - 1;

		while (r < arr.length && c >= 0) {

			if (arr[r][c] == target) {
				return new int[] { r, c };
			}
			if (arr[r][c] < target) {
				r++;
			} else {
				c--;
			}
		}
		return new int[] { -1, -1 };
	}

}
