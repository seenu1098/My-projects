package test3;

public class InfiniteArray {

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		// Q: https://www.geeksforgeeks.org/find-position-element-sorted-array-infinite-numbers/
		int[] arr = { 2, 4, 6, 10, 18, 32, 48, 51, 69, 75, 81, 93, 100 };
		System.out.println(ans(arr, 32));
	}

	public static int ans(int[] arr, int target) {
		int start = 0;
		int end = 1;

		while (target > arr[end]) {
			int temp = end + 1;
			end = end + (end - start + 1) * 2;
			start = temp;
		}
		return binarySearch(arr, target, start, end);
	}

	public static int binarySearch(int[] arr, int target, int start, int end) {
		while (start <= end) {
			int mid = start + (end - start) / 2;

			if (target > arr[mid]) {
				start = mid + 1;
			} else if (target < arr[mid]) {
				end = mid - 1;
			} else {
				return mid;
			}
		}
		return -1;
	}

}
