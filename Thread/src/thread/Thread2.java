package thread;

// In this class , we are creating dummy threadsample class, so that we can call the runnable object from MyTask2 ,
// so that we can pass that object to thread class,then thread will start
// because java doesn't allow multiple inheritance, 
// by doing this we can start the thread without interfering the main thread

class ThreadSample {

}

class MyTask2 extends ThreadSample implements Runnable {

	@Override
	public void run() {
		System.out.println("Application printing 2");
		for (int i = 1; i < 11; i++) {
			System.out.println("Printing appliction 2 #" + i);
		}
		System.out.println("Application printing 2 ends");
	}
}

public class Thread2 {

	public static void main(String args[]) {
		System.out.println("Application starts");

		// method 1
//		Runnable r = new MyTask2();
//		Thread t = new Thread(r);
//		t.start(); // this will trigger the run method

		// method 2
		new Thread(new MyTask2()).start();

		System.out.println("Application printing 1");
		for (int i = 1; i < 11; i++) {
			System.out.println("Printing appliction 1 #" + i);
		}

		System.out.println("Application printing 1 ends");

	}

}