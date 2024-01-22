package test3;

import java.util.Arrays;

public class SortedMatrix {
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		int[][] arr = { { 1, 2, 3, 4 }, { 5, 6, 7, 8 } };

		System.out.println(arr.length);
		System.out.println(Arrays.toString(search(arr, 8)));

	}

	static int[] binarySearch(int[][] arr, int rows, int cStart, int cEnd, int target) {
		while (cStart <= cEnd) {
			int mid = cStart + (cEnd - cStart) / 2;
			if (arr[rows][mid] < target) {
				cStart = mid + 1;
			} else if (arr[rows][mid] > target) {
				cEnd = mid - 1;
			} else {
				return new int[] { rows, mid };
			}
		}
		return new int[] { -1, -1 };
	}

	static int[] search(int[][] arr, int target) {

		int rows = arr.length;
		int cols = arr[0].length;

		if (rows == 1) {
			return binarySearch(arr, 0, 0, cols - 1, target);
		}

		int rStart = 0;
		int rEnd = rows - 1;
		int cMid = cols / 2;

		while (rStart < (rEnd - 1)) {
			int mid = rStart + (rEnd - rStart) / 2;

			if (arr[mid][cMid] == target) {
				return new int[] { mid, cMid };
			}

			if (arr[mid][cMid] < target) {
				rStart = mid;
			} else {
				rEnd = mid;
			}
		}

		if (arr[rStart][cMid] == target) {
			return new int[] { rStart, cMid };
		}

		if (arr[rStart + 1][cMid] == target) {
			return new int[] { rStart + 1, cMid };
		}

		if (target <= arr[rStart][cMid - 1]) {
			return binarySearch(arr, rStart, 0, cMid - 1, target);
		}

		if (target >= arr[rStart][cMid + 1] && target <= arr[rStart][cols - 1]) {
			return binarySearch(arr, rStart, cMid + 1, cols - 1, target);
		}

		if (target <= arr[rStart + 1][cMid - 1]) {
			return binarySearch(arr, rStart + 1, 0, cMid - 1, target);
		} else {
			return binarySearch(arr, rStart + 1, cMid + 1, cols - 1, target);
		}
	}
}
