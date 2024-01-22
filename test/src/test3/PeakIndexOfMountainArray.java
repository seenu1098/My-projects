package test3;

public class PeakIndexOfMountainArray {

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		// https://leetcode.com/problems/peak-index-in-a-mountain-array/
		// https://leetcode.com/problems/find-peak-element/
		int[] arr = { 2, 4, 6, 10, 18, 32, 28, 14, 16, 11, 7, 2, 1 };
		System.out.println(findPeakIndex(arr));
	}

	static int findPeakIndex(int[] arr) {
		int start = 0;
		int end = arr.length - 1;

		while (start < end) {
			int mid = start + (end - start) / 2;

			if (arr[mid] > arr[mid + 1]) {
				end = mid;
			} else {
				start = mid + 1;
			}
		}
		return start;
	}

}
