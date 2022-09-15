package bst;

public class MyBinarySearchTree {

	public static void main(String args[]) {
		BinarySearchTree bst = new BinarySearchTree();

		System.out.println(bst.insert(47));
		System.out.println(bst.insert(21));
		System.out.println(bst.insert(76));
		System.out.println(bst.insert(18));
		System.out.println(bst.insert(27));
		System.out.println(bst.insert(52));
		System.out.println(bst.insert(82));

		System.out.println(bst.contains(5));

		System.out.println(bst.BFS());

		System.out.println(bst.DFSPreOrder());
		System.out.println(bst.DFSPostOrder());
		System.out.println(bst.DFSInOrder());

	}

}
