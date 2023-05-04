import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.StringTokenizer;

public class Kmp {
  static public void main(String[] args) throws IOException {
    new Kmp().run();
  }

  public void run() throws IOException {
    FastScanner scanner = new FastScanner();
    String pattern = scanner.next();
    String text = scanner.next();

    System.out.println(kmp(pattern, text));
  }

  String findAllOcurrences(String pattern, String text) {
    String fullString = pattern + "$" + text;
    int[] prefix = computePrefixFunction(fullString);
    StringBuilder result = new StringBuilder();

    for (int i = pattern.length() + 1; i < fullString.length(); i++) {
      if (prefix[i] == pattern.length()) {
        result.append(" " + (i - (2 * pattern.length())));
      }
    }

    return result.toString();
  }

  int[] computePrefixFunction(String pattern) {
    int[] positions = new int[pattern.length()];

    int border = 0;

    positions[0] = 0;

    for (int i = 1; i < pattern.length(); i++) {
      while (border > 0 && pattern.charAt(i) != pattern.charAt(border)) {
        border = positions[border - 1];
      }

      if (pattern.charAt(i) == pattern.charAt(border)) {
        border = border + 1;
      } else {
        border = 0;
      }

      positions[i] = border;
    }

    return positions;
  }

  String kmp(String pattern, String text) {
    if (pattern.length() > text.length()) {
      return "";
    }

    return findAllOcurrences(pattern, text);
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
