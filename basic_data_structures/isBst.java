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

public class isBst {
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

    private int getMaxValue(int nodeIndex) {
      int nodeValue = key[nodeIndex];
      int leftValue = Integer.MIN_VALUE;
      int rightValue = Integer.MIN_VALUE;

      if (left[nodeIndex] != -1) {
        leftValue = getMaxValue(left[nodeIndex]);
      }

      if (right[nodeIndex] != -1) {
        rightValue = getMaxValue(right[nodeIndex]);
      }

      return Math.max(nodeValue, Math.max(leftValue, rightValue));
    }

    private int getMinValue(int nodeIndex) {
      int nodeValue = key[nodeIndex];
      int leftValue = Integer.MAX_VALUE;
      int rightValue = Integer.MAX_VALUE;

      if (left[nodeIndex] != -1) {
        leftValue = getMinValue(left[nodeIndex]);
      }

      if (right[nodeIndex] != -1) {
        rightValue = getMinValue(right[nodeIndex]);
      }

      return Math.min(nodeValue, Math.min(leftValue, rightValue));
    }

    boolean isBST(int nodeIndex) {
      if (key.length < 1 || nodeIndex == -1) {
        return true;
      }

      int nodeValue = key[nodeIndex];
      int leftIndex = left[nodeIndex];
      int rightIndex = right[nodeIndex];

      if (
        (leftIndex != -1 && getMaxValue(leftIndex) > nodeValue)
        || (rightIndex != -1 && getMinValue(rightIndex) < nodeValue)
        || (leftIndex != -1 && !isBST(leftIndex))
        || (rightIndex != -1 && !isBST(rightIndex))
      ) {
        return false;
      }

      return true;
    }
  }

  static public void main(String[] args) throws IOException {
    new Thread(null, new Runnable() {
      public void run() {
        try {
          new isBst().run();
        } catch (IOException e) {
          //
        }
      }
    }, "1", 1 << 26).start();
  }

  public void run() throws IOException {
    Tree tree = new Tree();

    tree.read();

    boolean result = tree.isBST(0);

    if (result == true) {
      System.out.print("CORRECT");
    } else {
      System.out.print("INCORRECT");
    }
  }
}
