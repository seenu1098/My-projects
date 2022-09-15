package bst;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

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

	public List<Integer> BFS() {
		Node currentNode = root;
		List<Integer> list = new ArrayList<>();
		Queue<Node> queue = new LinkedList<>();
		queue.add(currentNode);
		while (queue.size() > 0) {
			currentNode = queue.remove();
			list.add(currentNode.value);
			if (currentNode.left != null) {
				queue.add(currentNode.left);
			}

			if (currentNode.right != null) {
				queue.add(currentNode.right);
			}

		}
		return list;

	}

	public List<Integer> DFSPreOrder() {
		List<Integer> results = new ArrayList<>();
		class Traverse {
			public Traverse(Node currentNode) {
				results.add(currentNode.value);
				if (currentNode.left != null) {
					new Traverse(currentNode.left);
				}

				if (currentNode.right != null) {
					new Traverse(currentNode.right);
				}

			}
		}
		new Traverse(root);

		return results;
	}

	public List<Integer> DFSPostOrder() {
		List<Integer> results = new ArrayList<>();
		class Traverse {
			public Traverse(Node currentNode) {
				if (currentNode.left != null) {
					new Traverse(currentNode.left);
				}

				if (currentNode.right != null) {
					new Traverse(currentNode.right);
				}

				results.add(currentNode.value);
			}
		}
		new Traverse(root);

		return results;
	}

	public List<Integer> DFSInOrder() {
		List<Integer> results = new ArrayList<>();
		class Traverse {
			public Traverse(Node currentNode) {
				if (currentNode.left != null) {
					new Traverse(currentNode.left);
				}

				results.add(currentNode.value);

				if (currentNode.right != null) {
					new Traverse(currentNode.right);
				}

			}
		}
		new Traverse(root);

		return results;
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
