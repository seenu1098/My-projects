package test;

public class TwoD {
	public static void main(String[] args) {
		int[][] twoDimentional = { { 1, 1, 5, 6 }, { 2, 2, 6, 7 }, { 3, 3, 2, 9 }, { 4, 4, 3, 0 } };
		for (int i = 0; i < 4; i++) {
			for (int j = 0; j < 4; j++) {
				System.out.print(twoDimentional[i][j] + " ");
			}
			System.out.println();
		}
	}
}
