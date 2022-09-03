package queue;

public class MyQueue {

	public static void main(String args[]) {
		Queue queue = new Queue(7);
		queue.enqueue(8);

		queue.enqueue(2);

		queue.printQueue();

		System.out.println("Dequeue : " + queue.dequeue().value);

		queue.printQueue();
	}
}
