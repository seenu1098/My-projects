package test1;

public class Addition implements Calulation {

	@Override
	public int calculation(int a, int b) {
		// TODO Auto-generated method stub
		return a + b;
	}

	public static void main(String args[]) {
		Addition c = new Addition();
		System.out.println(c.calculation(4, 5));
	}

}
