package doublylinkedlist;

public class DoublyLinkedList {
	Node head;
	Node tail;
	int length;

	public DoublyLinkedList(int value) {
		Node newNode = new Node(value);
		head = newNode;
		tail = newNode;
		length = 1;
	}

	public void printList() {
		Node temp = head;
		System.out.println("List:");
		while (temp != null) {
			System.out.println(temp.value);
			temp = temp.next;
		}
	}

	public void append(int value) {
		Node newNode = new Node(value);

		if (length == 0) {
			head = newNode;
			tail = newNode;
		} else {
			tail.next = newNode;
			newNode.prev = tail;
			tail = newNode;
		}
		length++;
	}

	public Node removeLast() {
		if (length == 0) {
			return null;
		}

		Node temp = tail;
		tail = tail.prev;
		temp.prev = null;
		tail.next = null;
		length--;
		if (length == 0) {
			head = null;
			tail = null;
		}
		return temp;

	}

	public void prepend(int value) {
		Node newNode = new Node(value);
		if (length == 0) {
			head = newNode;
			tail = newNode;
		} else {
			newNode.next = head;
			head.prev = newNode;
			head = newNode;
		}
		length++;

	}

	public Node removeFirst() {
		Node temp = head;
		if (length == 0) {
			return null;
		}

		if (length == 1) {
			head = null;
			tail = null;
		} else {
			head = head.next;
			head.prev = null;
			temp.next = null;
		}

		length--;
		return temp;

	}

	public Node get(int index) {
		Node temp = head;
		if (index < 0 || index >= length)
			return null;

		if (index == length / 2) {
			for (int i = 0; i < index; i++) {
				temp = temp.next;
			}
		} else {
			temp = tail;
			for (int i = length - 1; i > index; i--) {
				temp = temp.prev;
			}
		}
		return temp;
	}

	public boolean set(int index, int value) {

		Node temp = get(index);
		if (temp != null) {
			temp.value = value;
			return true;
		}
		return false;
	}

	public boolean insert(int index, int value) {
		if (index < 0 || index > length)
			return false;

		if (index == 0) {
			prepend(value);
			return true;
		}
		if (index == length) {
			append(value);
			return true;
		}

		Node newNode = new Node(value);

		Node before = get(index - 1);
		Node after = before.next;

		newNode.next = after;
		newNode.prev = before;

		before.next = newNode;
		after.prev = newNode;

		length++;

		return true;

	}

	public Node remove(int index) {
		if (index < 0 || index >= length)
			return null;

		if (index == 0)
			return removeFirst();

		if (index == length - 1)
			return removeLast();

		Node temp = get(index);

		Node before = temp.prev;
		Node after = temp.next;

		before.next = after;
		after.prev = before;

		temp.prev = null;
		temp.next = null;

		length--;

		return temp;

	}
}
