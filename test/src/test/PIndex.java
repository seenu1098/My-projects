package test;

public class PIndex {
	public static int palindromeIndex(String s) {
		// Write your code here
		StringBuilder sb = new StringBuilder(s);

		sb.reverse();

		if (s.equals(sb.toString())) {
			return -1;
		} else {
			StringBuilder sb1 = new StringBuilder(s);
			char c[] = sb1.toString().toCharArray();
			for (int i = 0; i < c.length; i++) {
				StringBuilder deletedBuilder = new StringBuilder(sb1.deleteCharAt(i));
				String deletedString = deletedBuilder.toString();

				deletedBuilder.reverse();
				if (deletedString.equals(deletedBuilder.toString())) {
					return i;
				}
				sb1.insert(i, c[i]);
			}
		}
		return -1;
	}

	public static int palindromeIndex1(String s) {
		int start = 0;
		int end = s.length() - 1;
		System.out.println("before start"+ start);
		System.out.println("before end"+end);
		while (start < end && s.charAt(start) == s.charAt(end)) {
			start++;
			end--;
		}
		if (start >= end)
			return -1; // already a palindrome
		// We need to delete here
		if (isPalindrome(s, start + 1, end))
			return start;
		System.out.println("aftre start"+ start);
		System.out.println("aftre end"+end);
		if (isPalindrome(s, start, end - 1))
			return end;
		return -1;
	}

	public static boolean isPalindrome(String s, int start, int end) {
		while (start < end && s.charAt(start) == s.charAt(end)) {
			start++;
			end--;
		}
		return start >= end;
	}

	public static void main(String[] args) {
		System.out.println(palindromeIndex1("aaab"));
	}
}
