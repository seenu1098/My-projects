package test3;

public class RotatedBinarySearch {

	public static void main(String[] args) {
		// int[] arr = { 4, 5, 6, 7, 8, 9, 1, 2 };
		int[] arr = { 2, 9, 2, 2 };
		System.out.println(search(arr, 3));
	}

	static int search(int[] arr, int target) {
		int pivot = findPivotWithDuplicates(arr);

		if (-1 == pivot) {
			return binarySearch(arr, target, 0, arr.length - 1);
		}

		if (target == arr[pivot]) {
			return pivot;
		}

		if (target >= arr[0]) {
			return binarySearch(arr, target, 0, pivot - 1);
		}

		return binarySearch(arr, target, pivot + 1, arr.length - 1);
	}

	static int binarySearch(int[] arr, int target, int start, int end) {

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

	static int findPivotWithoutDuplicates(int[] arr) {

		int start = 0;
		int end = arr.length - 1;

		while (start <= end) {
			int mid = start + (end - start) / 2;

			if (mid < end && arr[mid] > arr[mid + 1]) {
				return mid;
			}

			if (start < mid && arr[mid] < arr[mid - 1]) {
				return mid - 1;
			}

			if (arr[mid] <= arr[start]) {
				end = mid - 1;
			} else {
				start = mid + 1;
			}
		}

		return -1;
	}

	static int findPivotWithDuplicates(int[] arr) {

		int start = 0;
		int end = arr.length - 1;

		while (start <= end) {
			int mid = start + (end - start) / 2;

			if (mid < end && arr[mid] > arr[mid + 1]) {
				return mid;
			}

			if (start < mid && arr[mid] < arr[mid - 1]) {
				return mid - 1;
			}

			if (arr[mid] == start && arr[mid] == arr[end]) {
				if (start < end && arr[start] > arr[start + 1]) {
					return start;
				}
				start++;

				if (end > start && arr[end] < arr[end - 1]) {
					return end - 1;
				}
				end--;
			} else if (arr[mid] > arr[start] || (arr[mid] == arr[start] && arr[mid] > arr[end])) {
				start = mid + 1;
			} else {
				end = mid - 1;
			}
		}
		return -1;
	}

}
