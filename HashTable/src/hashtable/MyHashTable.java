package hashtable;

public class MyHashTable {

	public static void main(String args[]) {
		HashTable myHashTable = new HashTable();
		myHashTable.set("nails", 100);

		myHashTable.set("tile", 50);

		myHashTable.set("lumber", 80);

		myHashTable.set("bolts", 200);

		myHashTable.set("screws", 140);

		myHashTable.printHashTable();

		System.out.println("getting by key : " + myHashTable.get("screws"));

		System.out.println("List : " + myHashTable.getKeys());
		
		System.out.println("By index : " + myHashTable.dataMap[3].value);
	}
}
