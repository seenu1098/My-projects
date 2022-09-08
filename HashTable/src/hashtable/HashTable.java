package hashtable;

import java.util.ArrayList;
import java.util.List;

public class HashTable {

	public class Node {
		String key;
		int value;
		Node next;

		public Node(String key, int value) {
			this.key = key;
			this.value = value;
		}
	}

	int size = 7;
	Node[] dataMap;

	public HashTable() {
		dataMap = new Node[size];
	}

	public void printHashTable() {
		for (int i = 0; i < dataMap.length; i++) {
			System.out.println(i + ":");
			Node temp = dataMap[i];
			while (temp != null) {
				System.out.println("Key : " + temp.key + " value: " + temp.value);
				temp = temp.next;
			}
		}
	}

	public int hash(String key) {
		int hash = 0;
		char[] keys = key.toCharArray();
		for (int i = 0; i < keys.length; i++) {
			int ascii = keys[i];
			hash = (hash + ascii * 23) % dataMap.length;
		}
		return hash;
	}

	public void set(String key, int value) {
		int index = hash(key);
		Node newNode = new Node(key, value);
		if (dataMap[index] == null) {
			dataMap[index] = newNode;
		} else {
			Node temp = dataMap[index];
			while (temp.next != null) {
				temp = temp.next;
			}
			temp.next = newNode;
		}
	}

	public int get(String key) {
		int index = hash(key);
		Node temp = dataMap[index];

		while (temp != null) {
			if (temp.key == key) {
				return temp.value;
			}
			temp = temp.next;
		}
		return 0;
	}

	public List<String> getKeys() {
		List<String> keys = new ArrayList<>();

		if (dataMap.length != 0) {
			for (int i = 0; i < dataMap.length; i++) {
				Node temp = dataMap[i];
				while (temp != null) {
					keys.add(temp.key);
					temp = temp.next;
				}
			}
		}
		return keys;

	}

}
