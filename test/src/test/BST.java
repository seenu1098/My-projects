package test;

import java.util.Scanner;

public class BST {

	public static Node insert(Node root, int data) {
		if (root == null) {
			return new Node(data);
		} else {
			Node cur;
			if (data <= root.data) {
				cur = insert(root.left, data);
				root.left = cur;
			}

			if (data >= root.data) {
				cur = insert(root.right, data);
				root.right = cur;
			}
		}
		return root;
	}

	public static int getHeight(Node root) {

		int heightRight = 0;
		int heightLeft = 0;

		if (root == null) {
			return 0;
		}

		if (root.right != null) {
			heightRight = getHeight(root.right) + 1;
		}

		if (root.left != null) {
			heightLeft = getHeight(root.left) + 1;
		}

		return heightLeft > heightRight ? heightLeft : heightRight;

	}

	public static void main(String args[]) {
		try (Scanner sc = new Scanner(System.in)) {
			int T = sc.nextInt();
			Node root = null;
			while (T-- > 0) {
				int data = sc.nextInt();
				root = insert(root, data);
			}

			System.out.println(root);
			int height = getHeight(root);
			System.out.println(height);
		}
	}
}
