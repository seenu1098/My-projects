huffman:
level order traverse based on 1 and 0.
1 is right and 0 is left
if the child is not there, it will come to the root

void decode(String s, Node root) {
		Node c = root;
		StringBuilder sb = new StringBuilder();
		char ch[] = s.toCharArray();
		for (int i = 0; i < ch.length; i++) {
			c = ch[i] == '1' ? c.right : c.left;
			if (c.right == null && c.left == null) {
				sb.append(c.data);
				c = root;
			}
		}
		System.out.println(sb);
	}
