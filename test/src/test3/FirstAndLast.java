package test3;

import java.util.Arrays;

public class FirstAndLast {

	public static void main(String[] args) {
		int[] arr = { 2, 4, 4, 10, 18, 32, 48, 51, 69, 75, 81, 93, 100 };
		System.out.println(Arrays.toString(searchIndex(arr, 4)));
	}

	private static int[] searchIndex(int[] arr, int target) {
		// TODO Auto-generated method stub
		int[] ans = { -1, -1 };
		ans[0] = search(arr, target, true);
		if (ans[0] != -1) {
			ans[1] = search(arr, target, false);
		}
		return ans;
	}

	private static int search(int[] arr, int target, boolean findFirstIndex) {
		// TODO Auto-generated method stub
		int ans = -1;
		int start = 0;
		int end = arr.length - 1;

		while (start <= end) {
			int mid = start + (end - start) / 2;
			if (target > arr[mid]) {
				start = mid + 1;
			} else if (target < arr[mid]) {
				end = mid - 1;
			} else {
				ans = mid;
				if (findFirstIndex) {
					end = mid - 1;
				} else {
					start = mid + 1;
				}
			}
		}
		return ans;
	}
}
