package test3;

public class FindInMountainArray {
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		// https://leetcode.com/problems/peak-index-in-a-mountain-array/
		// https://leetcode.com/problems/find-peak-element/
		int[] arr = { 2, 4, 6, 10, 18, 32, 28, 14, 16, 11, 7, 2, 1 };
		System.out.println(findInMountainArray(arr, 4));
	}

	static int findInMountainArray(int[] arr, int target) {
		// TODO Auto-generated method stub

		int peakIndex = findPeakIndex(arr);
		int firstTry = orderAgonisticSearch(arr, target, 0, peakIndex);
		if (firstTry != -1) {
			return firstTry;
		}
		return orderAgonisticSearch(arr, target, peakIndex + 1, arr.length - 1);
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

	static int orderAgonisticSearch(int[] arr, int target, int start, int end) {
		while (start <= end) {
			int mid = start + (end - start) / 2;

			boolean isAsc = arr[start] < arr[end];

			if (target == arr[mid]) {
				return mid;
			}

			if (isAsc) {
				if (target > arr[mid]) {
					start = mid + 1;
				} else {
					end = mid - 1;
				}
			} else {
				if (target < arr[mid]) {
					start = mid + 1;
				} else {
					end = mid - 1;
				}
			}
		}
		return -1;
	}

}
