package test3;

public class CountDigits {

	public static void main(String args[]) {
		int n = 123;

		System.out.println((int) (Math.log10(n) + 1));

		int count = 0;

		while (n > 0) {
			count++;
			n = n / 10;
		}

		System.out.println(count);
	}

}
