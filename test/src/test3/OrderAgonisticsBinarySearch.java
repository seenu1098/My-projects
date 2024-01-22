package test3;

public class OrderAgonisticsBinarySearch {

	public static void main(String[] args) {
		// ascending int[] arr = { 2, 4, 6, 10, 18, 32, 48, 51, 69, 75, 81, 93, 100 };
		int[] arr = { 100, 69, 53, 45, 33, 28, 18, 11, 6, 1 };
		System.out.println(orderAgonisticsBinarySearch(arr, 6));
	}

	static int orderAgonisticsBinarySearch(int[] arr, int target) {
		int start = 0;
		int end = arr.length - 1;

		while (start <= end) {
			int mid = start + (end - start) / 2;

			boolean isAsc = arr[start] < arr[end];

			if (arr[mid] == target) {
				return mid;
			}

			if (isAsc) {
				if (arr[mid] < target) {
					start = mid + 1;
				} else {
					end = mid - 1;
				}
			} else {
				if (arr[mid] > target) {
					start = mid + 1;
				} else {
					end = mid - 1;
				}
			}
		}
		return -1;
	}

}
