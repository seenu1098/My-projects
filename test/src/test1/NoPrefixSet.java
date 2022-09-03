package test1;

import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

import test1.NoPrefix.TrieNode;

public class NoPrefixSet {
	public static void main(String[] args) {

//		aab
//		aac
//		aacghgh
//		aabghgh

//		aab
//		defgab
//		abcde
//		aabcde
//		cedaaa
//		bbbbbbbbbb
//		jabjjjad

		List<String> list = new ArrayList<>();

		list.add("aab");
		list.add("defgab");
		list.add("abcde");
		list.add("aabcde");
		list.add("cedaaa");
		list.add("bbbbbbbbbb");
		list.add("jabjjjad");

		NoPrefix tst = new NoPrefix();
		boolean found = false;
		TrieNode root = new TrieNode(' ');
		Scanner sc = new Scanner(System.in);
//		int n = sc.nextInt();
		int n = list.size();
		for (int i = 0; i < n; i++) {
//			String str = sc.next();

			boolean add = tst.add(root, list.get(i));
			if (!add) {
				System.out.println("BAD SET \n" + list.get(i));
				found = true;
				break;
			}

		}
		System.out.println(!found ? "GOOD SET" : "");
		sc.close();
	}
}
