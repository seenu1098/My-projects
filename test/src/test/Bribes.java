package test;

import java.util.Scanner;

public class Bribes {
	public static void main(String[] args) {
		try (Scanner in = new Scanner(System.in)) {
			int T = in.nextInt();
			for (int a0 = 0; a0 < T; a0++) {
				int n = in.nextInt();
				int q[] = new int[n];
				for (int q_i = 0; q_i < n; q_i++) {
					q[q_i] = in.nextInt();
				}

				int bribes = 0;
				for (int i = 1; i <= n; ++i) {
					if (q[i - 1] - i > 2) {
						System.out.println("Too chaotic");
						bribes = -1;
						break;
					}
				}

				if (bribes == 0) {
					for (int i = 0; i < n; ++i) {
						for (int j = i + 1; j < i + 100 && j < n; ++j) {
							if (q[j] < q[i]) {
								bribes++;
							}
						}
					}
					System.out.println(bribes);
				}
			}
		}
	}
}
