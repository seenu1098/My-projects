package test3;

public class Ceiling {

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		int[] arr = { 2, 4, 6, 10, 18, 32, 48, 51, 69, 75, 81, 93, 100 };
		System.out.println(ceiling(arr, 43));
	}

	// smallest number in the array greater than or equal to target
	static int ceiling(int[] arr, int target) {

		if (target > arr[arr.length - 1]) {
			return -1;
		}

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
		return start;
	}

}
