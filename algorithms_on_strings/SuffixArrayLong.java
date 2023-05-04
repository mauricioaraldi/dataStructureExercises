// Input: A string ending with $
// Example input: AAA$
// Output: The list of starting positions of sorted suffixes separated by spaces
// Example output: 3 2 1 0

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.StringTokenizer;

public class SuffixArrayLong {
  String ALPHABET = "$ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  static public void main(String[] args) throws IOException {
    new SuffixArrayLong().run();
  }

  public void run() throws IOException {
    FastScanner scanner = new FastScanner();
    String text = scanner.next();

    System.out.println(suffixArrayLong(text));
  }

  int[] sortCharacters(String text) {
    int[] order = new int[text.length()];
    int[] count = new int[ALPHABET.length()];

    for (int i = 0; i < count.length; i++) {
      count[i] = 0;
    };

    for (int i = 0; i < text.length(); i++) {
      count[ALPHABET.indexOf(text.charAt(i))]++;
    };

    for (int i = 1; i < ALPHABET.length(); i++) {
      count[i] += count[i - 1];
    }

    for (int i = text.length() - 1; i >= 0; i--) {
      int alphabetCode = ALPHABET.indexOf(text.charAt(i));

      count[alphabetCode]--;

      order[count[alphabetCode]] = i;
    }

    return order;
  }

  int[] computeCharClasses(String text, int[] order) {
    int[] classes = new int[text.length()];

    classes[order[0]] = 0;

    for (int i = 1; i < text.length(); i++) {
      if (text.charAt(order[i]) != text.charAt(order[i - 1])) {
        classes[order[i]] = classes[order[i - 1]] + 1;
      } else {
        classes[order[i]] = classes[order[i - 1]];
      }
    }

    return classes;
  }

  int[] sortDoubled(String text, int cycleLength, int[] order, int[] classes) {
    int[] count = new int[text.length()];
    int[] newOrder = new int[text.length()];

    for (int i = 0; i < count.length; i++) {
      count[i] = 0;
    }

    for (int i = 0; i < text.length(); i++) {
      count[classes[i]]++;
    }

    for (int i = 1; i < text.length(); i++) {
      count[i] += count[i - 1];
    }

    for (int i = text.length() - 1; i >= 0; i--) {
      int start = (order[i] - cycleLength + text.length()) % text.length();
      int cl = classes[start];

      count[cl] = count[cl] - 1;
      newOrder[count[cl]] = start;
    }

    return newOrder;
  }

  int[] updateClasses(int[] newOrder, int[] classes, int cycleLength) {
    int[] newClasses = new int[newOrder.length];

    newClasses[newOrder[0]] = 0;

    for (int i = 1; i < newOrder.length; i++) {
      int cur = newOrder[i];
      int prev = newOrder[i - 1];
      int mid = (cur + cycleLength);
      int midPrev = (prev + cycleLength) % newOrder.length;

      if (classes[cur] != classes[prev] || classes[mid] != classes[midPrev]) {
        newClasses[cur] = newClasses[prev] + 1;
      } else {
        newClasses[cur] = newClasses[prev];
      }
    }

    return newClasses;
  }

  int[] buildSuffixArray(String text) {
    int[] order = sortCharacters(text);
    int[] classes = computeCharClasses(text, order);
    int cycleLength = 1;

    while (cycleLength < text.length()) {
      order = sortDoubled(text, cycleLength, order, classes);
      classes = updateClasses(order, classes, cycleLength);
      cycleLength = 2 * cycleLength;
    }

    return order;
  }

  String suffixArrayLong(String text) {
    StringBuilder result = new StringBuilder();
    int[] suffixArray = buildSuffixArray(text);

    for(int i = 0; i < suffixArray.length; i++) {
      result.append(" " + suffixArray[i]);
    }

    return result.toString();
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
