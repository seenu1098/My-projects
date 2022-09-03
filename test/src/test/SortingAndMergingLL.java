package test;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Scanner;

public class SortingAndMergingLL {
	static class SinglyLinkedListNode {
		public int data;
		public SinglyLinkedListNode next;

		public SinglyLinkedListNode(int nodeData) {
			this.data = nodeData;
			this.next = null;
		}
	}

	static class SinglyLinkedList {
		public SinglyLinkedListNode head;
		public SinglyLinkedListNode tail;

		public SinglyLinkedList() {
			this.head = null;
			this.tail = null;
		}

		public void insertNode(int nodeData) {
			SinglyLinkedListNode node = new SinglyLinkedListNode(nodeData);

			if (this.head == null) {
				this.head = node;
			} else {
				this.tail.next = node;
			}

			this.tail = node;
		}
	}

	public static void printSinglyLinkedList(SinglyLinkedListNode node, String sep, BufferedWriter bufferedWriter)
			throws IOException {
		while (node != null) {
			bufferedWriter.write(String.valueOf(node.data));

			node = node.next;

			if (node != null) {
				bufferedWriter.write(sep);
			}
		}
	}

	// Complete the mergeLists function below.

	/*
	 * For your reference:
	 *
	 * SinglyLinkedListNode { int data; SinglyLinkedListNode next; }
	 *
	 */
	static SinglyLinkedListNode mergeLists(SinglyLinkedListNode head1, SinglyLinkedListNode head2) {

		if (head1 == null) {
			return head2;
		}
		if (head2 == null) {
			return head1;
		}
		SinglyLinkedListNode t1 = head1, t2 = head2;
		SinglyLinkedListNode head = null, tail = null;
		if (t1.data <= t2.data) {
			head = t1;
			tail = t1;
			t1 = t1.next;
		} else {
			head = t2;
			tail = t2;
			t2 = t2.next;
		}
		while (t1 != null && t2 != null) {
			if (t1.data <= t2.data) {
				// System.out.println("1"+tail.data+"->"+tail.next.data+"->"+tail.next.next.data);
				tail.next = t1;
				// System.out.println("2"+tail.data+"->"+tail.next.data+"->"+tail.next.next.data);
				tail = t1;
				// System.out.println("3" + tail.data+"->"+tail.next.data);
				t1 = t1.next;
			} else {
				tail.next = t2;
				tail = t2;
				t2 = t2.next;
			}

		}
		if (t1 != null) {
			tail.next = t1;
		} else {
			tail.next = t2;
		}
		// System.out.println("tail-last"+tail.data);
		// System.out.println("head-last"+head.data);
		return head;
	}

	private static final Scanner scanner = new Scanner(System.in);

	public static void main(String[] args) throws IOException {
		BufferedWriter bufferedWriter = new BufferedWriter(new FileWriter("D:\\input.txt"));

		int tests = scanner.nextInt();
		scanner.skip("(\r\n|[\n\r\u2028\u2029\u0085])?");

		for (int testsItr = 0; testsItr < tests; testsItr++) {
			SinglyLinkedList llist1 = new SinglyLinkedList();

			int llist1Count = scanner.nextInt();
			scanner.skip("(\r\n|[\n\r\u2028\u2029\u0085])?");

			for (int i = 0; i < llist1Count; i++) {
				int llist1Item = scanner.nextInt();
				scanner.skip("(\r\n|[\n\r\u2028\u2029\u0085])?");

				llist1.insertNode(llist1Item);
			}

			SinglyLinkedList llist2 = new SinglyLinkedList();

			int llist2Count = scanner.nextInt();
			scanner.skip("(\r\n|[\n\r\u2028\u2029\u0085])?");

			for (int i = 0; i < llist2Count; i++) {
				int llist2Item = scanner.nextInt();
				scanner.skip("(\r\n|[\n\r\u2028\u2029\u0085])?");

				llist2.insertNode(llist2Item);
			}

			SinglyLinkedListNode llist3 = mergeLists(llist1.head, llist2.head);

			printSinglyLinkedList(llist3, " ", bufferedWriter);
			bufferedWriter.newLine();
		}

		bufferedWriter.close();

		scanner.close();
	}
}
