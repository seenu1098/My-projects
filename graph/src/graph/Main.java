package graph;

public class Main {

	public static void main(String args[]) {
		Graph graph = new Graph();

		System.out.println(graph.addVertex("A"));
		System.out.println(graph.addVertex("B"));
		System.out.println(graph.addVertex("C"));
		System.out.println(graph.addVertex("D"));

		graph.addEdge("A", "B");
		graph.addEdge("A", "C");
		graph.addEdge("A", "D");
		graph.addEdge("B", "D");
		graph.addEdge("C", "D");

//		graph.removeEdge("A", "B");
		
		graph.removeVertex("D");

		graph.printGraph();
	}
}
