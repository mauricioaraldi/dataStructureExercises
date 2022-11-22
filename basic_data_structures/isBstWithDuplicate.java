// Input: First line is number of vertices n. The next n lines contain information
// about vertices in order. Each of these lines contains three integers i (key of
// the i-th vertex), left i (the index of the left child of the i-th vertex) and right
// i (the index of the right child of the i-th vertex). If i doesn’t have left or right
// child (or both), the corresponding left-i or right-i (or both) will be equal to −1.
// Example input: 3
//                2 1 2
//                1 -1 -1
//                3 -1 -1
// Output: "CORRECT" for a valid binary tree, or "INCORRECT" otherwise.
// Example output: CORRECT

import java.util.*;
import java.io.*;

public class isBstWithDuplicate {
  class FastScanner {
    StringTokenizer tok = new StringTokenizer("");
    BufferedReader in;

    FastScanner() {
      in = new BufferedReader(new InputStreamReader(System.in));
    }

    String next() throws IOException {
      while (!tok.hasMoreElements())
        tok = new StringTokenizer(in.readLine());
      return tok.nextToken();
    }

    int nextInt() throws IOException {
      return Integer.parseInt(next());
    }
  }

  public class Tree {
    int n;
    int[] key, left, right;

    void read() throws IOException {
      FastScanner in = new FastScanner();

      n = in.nextInt();
      key = new int[n];
      left = new int[n];
      right = new int[n];

      for (int i = 0; i < n; i++) { 
        key[i] = in.nextInt();
        left[i] = in.nextInt();
        right[i] = in.nextInt();
      }
    }

    boolean isBST(int nodeIndex, int min, int max) {
      System.out.println(nodeIndex + " " + key[nodeIndex] + " " + min + " " + max);

      if (key[nodeIndex] < min || key[nodeIndex] > max) {
        System.out.println("Returned at"+ " " + nodeIndex + " " + key[nodeIndex] + " " + min + " " + max);
        return false;
      }

      boolean leftValue = true;
      boolean rightValue = true;

      if (left[nodeIndex] != -1) {
        leftValue = isBST(left[nodeIndex], min, key[nodeIndex] - 1);
      }

      if (right[nodeIndex] != -1) {
        rightValue = isBST(right[nodeIndex], key[nodeIndex], max);
      }

      return leftValue && rightValue;
    }
  }

  static public void main(String[] args) throws IOException {
    new Thread(null, new Runnable() {
      public void run() {
        try {
          new isBstWithDuplicate().run();
        } catch (IOException e) {
          //
        }
      }
    }, "1", 1 << 26).start();
  }

  public void run() throws IOException {
    Tree tree = new Tree();

    tree.read();

    if (tree.key.length <= 1) {
      System.out.print("CORRECT");
      return;
    }

    boolean result = tree.isBST(0, Integer.MIN_VALUE, Integer.MAX_VALUE);

    if (result == true) {
      System.out.print("CORRECT");
    } else {
      System.out.print("INCORRECT");
    }
  }
}
