package test3;

public class SmallestLetterCeiling {

	// leetcode problem
	// smallest letter in the array greater than target otherwise return 0 index
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		char[] arr = { 'c', 'd', 'f', 'j' };
		System.out.println(ceiling(arr, 'j'));
	}

	static char ceiling(char[] letters, char target) {

		int start = 0;
		int end = letters.length - 1;

		while (start <= end) {
			int mid = start + (end - start) / 2;

			if (target < letters[mid]) {
				end = mid - 1;
			} else {
				start = mid + 1;
			}

//			if (letters[mid] < target) {
//				start = mid + 1;
//			} else {
//				end = mid - 1;
//			}
		}
		return letters[start % letters.length];
	}

}
