package test1;

public class NoPrefix {
	static class TrieNode {
		char ch;
		int count;
		TrieNode[] children;
		boolean isCompleted = false;

		TrieNode(char ch) {
			this.ch = ch;
			children = new TrieNode[12];
		}

	}

	public boolean add(TrieNode root, String in) {
		TrieNode curr = root;
		for (int i = 0; i < in.length(); i++) {
			char c = in.charAt(i);
			int index = c - 'a';
			if (curr.children[index] == null)
				curr.children[index] = new TrieNode(c);
			if (curr.isCompleted)
				return false;
			curr.count++;
			curr = curr.children[index];
		}
		curr.isCompleted = true;
		int i = ++curr.count;
		return i <= 1;

	}

}
