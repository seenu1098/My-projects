package bst;

public class BinarySearchTree {
	Node root;

	/*
	 * while inserting after getting all values and iterate through for loop, we
	 * will use below code
	 */

//	public Node insert(Node root, int value) {
//		if (root == null) {
//			return new Node(value);
//		} else {
//			Node cur;
//			if (value >= root.value) {
//				cur = insert(root.right, value);
//				root.right = cur;
//			} else if (value <= root.value) {
//				cur = insert(root.left, value);
//				root.left = cur;
//			}
//		}
//		return root;
//	}

	/*
	 * while inserting one by one, we will use below code
	 */

	public boolean insert(int value) {
		Node newNode = new Node(value);
		if (root == null) {
			root = newNode;
			return true;
		}

		Node temp = root;
		if (temp.value == newNode.value) {
			return false;
		}

		while (true) {
			if (temp.value > newNode.value) {
				if (temp.left == null) {
					temp.left = newNode;
					return true;
				}
				temp = temp.left;
			} else {
				if (temp.right == null) {
					temp.right = newNode;
					return true;
				}
				temp = temp.right;
			}
		}

	}

	public boolean contains(int value) {
		Node temp = root;
		while (temp != null) {
			if (temp.value < value) {
				temp = temp.right;
			} else if (temp.value > value) {
				temp = temp.left;
			} else {
				return true;
			}
		}
		return false;
	}
}
