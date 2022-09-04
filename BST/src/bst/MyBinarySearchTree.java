package bst;

public class MyBinarySearchTree {

	public static void main(String args[]) {
		BinarySearchTree bst = new BinarySearchTree();

		System.out.println(bst.insert(1));
		System.out.println(bst.insert(2));
		System.out.println(bst.insert(3));
		System.out.println(bst.root.right.right.value);
		System.out.println(bst.contains(5));
	}

}
