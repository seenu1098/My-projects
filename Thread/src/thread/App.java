package thread;

// method 1 
// main thread will start first
// inside main based on sequence the job will execute, once the sequence get executing , 
// other sequence will be in blocked state 
// we want to achieve the parallel job execution for the methods , 
// so for that we are gonna implement this in thread(thread1.java) 

class MyTask {

	public void run() {
		System.out.println("Application printing 2");
		for (int i = 1; i < 11; i++) {
			System.out.println("Printing appliction #" + i);
		}
		System.out.println("Application printing 2 ends");
	}
}

public class App {

	public static void main(String args[]) {
		System.out.println("Application starts");

		MyTask myTask = new MyTask();
		myTask.run();

		System.out.println("Application printing 1");
		for (int i = 1; i < 11; i++) {
			System.out.println("Printing appliction #" + i);
		}

		System.out.println("Application printing 1 ends");

	}

}
