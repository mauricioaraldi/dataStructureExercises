import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.StringTokenizer;

import static java.util.Arrays.sort;
import static java.util.Comparator.comparingInt;

public class BwtInverse {
  static public void main(String[] args) throws IOException {
    new BwtInverse().run();
  }

  public void run() throws IOException {
    FastScanner scanner = new FastScanner();
    String text = scanner.next();

    System.out.println(inverseBWT(text));
  }

  String inverseBWT(String text) {
    int[][] matrix = new int[text.length()][3];

    prepareMatrix(matrix, text);

    execute(matrix);

    StringBuilder result = new StringBuilder();

    for(int i = 0; i < matrix.length; i++) {
      result.append((char) matrix[i][1]);
    }

    return result.toString();
  }

  private void prepareMatrix(int[][] matrix, String text) {
    for(int i = 0; i < matrix.length; i++) {
      matrix[i][0] = text.charAt(i);
      matrix[i][2] = i;
    }
  }

  private void execute(int[][] matrix) {
    sort(matrix, comparingInt(o -> o[0]));

    int dollarSignPosition = matrix[0][2];

    for(int i = 0, next = dollarSignPosition; i < matrix.length; i++) {
      matrix[i][1] = matrix[next][0];
      next = matrix[next][2];
    }
  }

  static class FastScanner {
    StringTokenizer tok = new StringTokenizer("");
    BufferedReader in;

    FastScanner() {
      in = new BufferedReader(new InputStreamReader(System.in));
    }

    String next() throws IOException {
      while (!tok.hasMoreElements()) {
        tok = new StringTokenizer(in.readLine());
      }

      return tok.nextToken();
    }

    int nextInt() throws IOException {
      return Integer.parseInt(next());
    }
  }
}
