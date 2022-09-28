package thread;

//  mytask1 extend the thread class to implement the thread ,because we want to implement the method parallel.
//  so the first thing we need to override the run method that we have created. 
//  after that in main method we need to call the start method from mytask1 object, 
//  it will trigger the run method indirectly
//  but it will interfere when the main thread getting executed,  we need to achieve this with another implementation.
//  so for that look into thread2 class(thread2.java)

class MyTask1 extends Thread {

	@Override
	public void run() {
		System.out.println("Application printing 2");
		for (int i = 1; i < 11; i++) {
			System.out.println("Printing appliction 2 #" + i);
		}
		System.out.println("Application printing 2 ends");
	}
}

public class Thread1 {

	public static void main(String args[]) {
		System.out.println("Application starts");

		MyTask1 myTask = new MyTask1();
		myTask.start(); // this will trigger the run method

		System.out.println("Application printing 1");
		for (int i = 1; i < 11; i++) {
			System.out.println("Printing appliction 1 #" + i);
		}

		System.out.println("Application printing 1 ends");

	}

}