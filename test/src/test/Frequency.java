package test;

import java.util.HashMap;
import java.util.Map;

public class Frequency {

	public static void main(String[] args) {
		// TODO Auto-generated method stub

		String s = "sleeper cell";

		char ch[] = s.toCharArray();

		Map<Character, Integer> map = new HashMap<>();

		for (int i = 0; i < ch.length; i++) {
			if (ch[i] != ' ') {
				if (map.containsKey(ch[i])) {
					Integer count = map.get(ch[i]);
					map.put(ch[i], ++count);
				} else {
					map.put(ch[i], 1);
				}
			}

		}

		for (Map.Entry<Character, Integer> t : map.entrySet()) {
			System.out.println(t.getKey() + " " + t.getValue());
		}

	}

}
