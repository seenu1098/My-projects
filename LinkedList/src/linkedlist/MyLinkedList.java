package linkedlist;

public class MyLinkedList {

	public static void main(String args[]) {
		LinkedList linkedList = new LinkedList(2);
		linkedList.append(3);

		linkedList.prepend(1);
		linkedList.prepend(0);
//		System.out.println(linkedList.removeLast().value);
//		System.out.println(linkedList.removeLast().value);
//		System.out.println(linkedList.removeLast());

		linkedList.printNodeList();
		System.out.println("removed " + linkedList.removeFirst().value);

		linkedList.printNodeList();

		System.out.println("By index 1:" + linkedList.get(1).value);

		linkedList.insert(0, 0);

		System.out.println("insert index 0:");
		linkedList.printNodeList();

		System.out.println("set index 0 as 23:");
		System.out.println(linkedList.set(0, 23));
		linkedList.printNodeList();

		System.out.println("Reverse Linked List:");
		linkedList.reverse();
		linkedList.printNodeList();
	}

}
