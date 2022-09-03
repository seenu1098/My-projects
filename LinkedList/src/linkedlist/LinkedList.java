package linkedlist;

public class LinkedList {

	Node head;
	Node tail;
	int length;

	public LinkedList(int value) {
		Node newNode = new Node(value);
		head = newNode;
		tail = newNode;
		length = 1;
	}

	public void printNodeList() {
		Node temp = head;
		System.out.println("In list");
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
			tail = newNode;
		}
		length++;
	}

	public Node removeLast() {
		if (length == 0) {
			return null;
		}
		Node pre = head;
		Node temp = head;

		while (temp.next != null) {
			pre = temp;
			temp = temp.next;
		}
		tail = pre;
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
			head = newNode;
		}
		length++;
	}

	public Node removeFirst() {
		Node temp = head;
		if (length == 0) {
			return null;
		} else {
			head = temp.next;
			temp.next = null;
			length--;
			if (length == 0) {
				tail = null;
			}
		}
		return temp;
	}

	public Node get(int index) {
		Node temp = head;
		if (index < 0 || index > length) {
			return null;
		}

		for (int i = 0; i < index; i++) {
			temp = temp.next;
		}
		return temp;
	}

	public boolean insert(int index, int value) {

		if (index < 0 || index > length) {
			return false;
		}

		if (index == 0) {
			prepend(value);
			return true;
		}

		if (index == length) {
			append(value);
			return true;
		}

		Node newNode = new Node(value);
		Node temp = get(index - 1);
		newNode.next = temp.next;
		temp.next = newNode;
		length++;
		return true;

	}

	public boolean set(int index, int value) {
		Node temp = get(index);
		if (temp != null) {
			temp.value = value;
			return true;
		}
		return false;
	}

	public Node remove(int index) {

		Node temp = head;
		Node pre = head;
		if (index < 0 || index >= length) {
			return null;
		}

		if (index == 0) {
			return removeFirst();
		}

		if (index == length - 1) {
			return removeLast();
		}

		pre = get(index - 1);
		temp = pre.next;
		pre.next = temp.next;
		temp.next = null;
		length--;

		return temp;

	}

	public void reverse() {
		Node temp = head;
		head = tail;
		tail = temp;

		Node after = temp.next;
		Node before = null;

		for (int i = 0; i < length; i++) {
			after = temp.next;
			temp.next = before;
			before = temp;
			temp = after;
		}
	}

}
