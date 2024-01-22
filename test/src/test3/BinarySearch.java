package test3;

public class BinarySearch {

	public static void main(String[] args) {
		int[] arr = { 2, 4, 6, 10, 18, 32, 48, 51, 69, 75, 81, 93, 100 };
		System.out.println(binarySearch(arr, 4));
	}

	static int binarySearch(int[] arr, int target) {
		int start = 0;
		int end = arr.length - 1;

		while (start <= end) {
			int mid = start + (end - start) / 2;

			if (arr[mid] < target) {
				start = mid + 1;
			} else if (arr[mid] > target) {
				end = mid - 1;
			} else {
				return mid;
			}
		}
		return -1;
	}

}
