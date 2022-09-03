package test;

public class RecursiveSum {
	public static void main(String[] args) {
		RecursiveSum s = new RecursiveSum();

		String str_n = "123";
		int k = 3;

		int pSum = Integer.parseInt(s.supdig(str_n));
		pSum *= k;

		String sup = Integer.toString(s.supdig(pSum));

		System.out.println(sup);
	}

	String supdig(String n) {
		if (n.length() == 1)
			return n;
		else {
			int np = 0;

			for (int i = 0; i < n.length(); i++) {
				np += Character.getNumericValue(n.charAt(i));
			}

			return supdig(Integer.toString(np));
		}
	}

	int supdig(int n) {
		if (n / 10 == 0)
			return n;
		else {
			int r = 0;

			while (n > 0) {
				r += n % 10;
				n /= 10;
			}

			return supdig(r);
		}
	}
	
	// my code
	
//	public static int getDigit(String n) {
//        int sum = 0;
//         if(n.length()>1){
//          for (int i=0;i<n.length();i++){
//               char c = n.charAt(i);
//               int m= Character.getNumericValue(c);
//               sum = sum + m;
//          }
//        }
//      String superDigitString = String.valueOf(sum);
//      if(superDigitString.length()>1){
//         return getDigit(superDigitString);
//      } 
//    return sum;
//   }
//    public static int superDigit(String n, int k) {
//    // Write your code here
//        
//        StringBuilder sb = new StringBuilder();
//        for(int i=0;i<k;i++){
//           sb.append(n);
//        }
//        
//     return getDigit(sb.toString());
//     
//    }
}
