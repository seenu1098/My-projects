package graph;

import java.util.ArrayList;
import java.util.HashMap;

public class Graph {

	HashMap<String, ArrayList<String>> adjsList = new HashMap<>();

	public void printGraph() {
		System.out.println(adjsList);
	}

	public boolean addVertex(String vertex) {
		if (adjsList.get(vertex) == null) {
			adjsList.put(vertex, new ArrayList<>());
			return true;
		}
		return false;
	}

	public boolean addEdge(String vertex1, String vertex2) {
		if (adjsList.get(vertex1) != null && adjsList.get(vertex2) != null) {
			adjsList.get(vertex1).add(vertex2);
			adjsList.get(vertex2).add(vertex1);
			return true;
		}
		return false;
	}

	public boolean removeEdge(String vertex1, String vertex2) {
		if (adjsList.get(vertex1) != null && adjsList.get(vertex2) != null) {
			adjsList.get(vertex1).remove(vertex2);
			adjsList.get(vertex2).remove(vertex1);
			return true;
		}
		return false;
	}

	public boolean removeVertex(String vertex) {
		if (adjsList.get(vertex) == null)
			return false;

		for (String otherVertex : adjsList.get(vertex)) {
			adjsList.get(otherVertex).remove(vertex);
		}
		adjsList.remove(vertex);
		return true;
	}

}
