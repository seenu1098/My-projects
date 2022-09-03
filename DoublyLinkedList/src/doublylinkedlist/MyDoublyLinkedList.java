package doublylinkedlist;

public class MyDoublyLinkedList {

	public static void main(String args[]) {
		DoublyLinkedList doublyLinkedList = new DoublyLinkedList(1);

		doublyLinkedList.append(2);

		doublyLinkedList.prepend(0);

		doublyLinkedList.printList();
//
//		System.out.println(doublyLinkedList.get(2).value);

//		doublyLinkedList.set(2, 5);

//		System.out.println(doublyLinkedList.get(2).value);

		System.out.println("removed: " + doublyLinkedList.remove(1).value);

		doublyLinkedList.printList();
	}

}
