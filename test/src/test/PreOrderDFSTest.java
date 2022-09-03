package test;

import java.util.Scanner;

public class PreOrderDFSTest {

	public static void main(String args[]) {

		try (Scanner sc = new Scanner(System.in)) {
			int t = sc.nextInt();
			Node root = null;

			while (t-- > 0) {
				int data = sc.nextInt();
				root = insert(root, data);
			}
		}
	}

	public static Node insert(Node root, int data) {
		if (root == null) {
			return new Node(data);
		} else {

			Node cur;
			if (data <= root.data) {
				cur = insert(root.left, data);
				root.left = cur;
			} else {
				cur = insert(root.right, data);
				root.right = cur;
			}
			return root;
		}

	}

	public static void preOrder(Node root) {
		System.out.println(root.data);

		if (root.left != null) {
			preOrder(root.left);
		}

		if (root.right != null) {
			preOrder(root.right);
		}
	}

	public static void inOrder(Node root) {

		if (root.left != null) {
			inOrder(root.left);
		}

		System.out.println(root.data);

		if (root.right != null) {
			inOrder(root.right);
		}
	}

	public static void postOrder(Node root) {

		if (root.left != null) {
			postOrder(root.left);
		}

		if (root.right != null) {
			postOrder(root.right);
		}

		System.out.println(root.data);
	}

}
