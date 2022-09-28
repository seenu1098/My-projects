package thread;

class Printer {
// when synchronizing it will lock the job until its got executed
// synchronized void printDocs(int number, String docName) {
// this above method is the one of the implementation of synchronized
	public void printDocs(int number, String docName) {
		for (int i = 1; i <= number; i++) {
			try {
				Thread.sleep(500);
			} catch (Exception ex) {

			}
			System.out.println("Printing " + docName + " #" + i);
		}
	}
}

class MyThread extends Thread {
	Printer printer;

	public MyThread(Printer p) {
		printer = p;
	}

	@Override
	public void run() {
		synchronized (printer) {
			printer.printDocs(10, "Jhon");
		}
	}
}

class YourThread extends Thread {
	Printer printer;

	public YourThread(Printer p) {
		printer = p;
	}

	@Override
	public void run() {
		synchronized (printer) {
			printer.printDocs(10, "alice");
		}
	}
}

public class MultiThread {

	public static void main(String args[]) {
		Printer p = new Printer();
		new MyThread(p).start();
		new YourThread(p).start();
	}

}
