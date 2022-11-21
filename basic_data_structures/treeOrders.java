// Input: First line is number of vertices n. The next n lines contain information
// about vertices in order. Each of these lines contains three integers i (key of
// the i-th vertex), left i (the index of the left child of the i-th vertex) and right
// i (the index of the right child of the i-th vertex). If i doesn’t have left or right
// child (or both), the corresponding left-i or right-i (or both) will be equal to −1.
// Example input: 5
//                4 1 2
//                2 3 4
//                5 -1 -1
//                1 -1 -1
//                3 -1 -1
// Output: Three lines. The first line should contain the keys of the vertices in the
// in-order traversal of the tree. The second line should contain the keys of the vertices
// in the pre-order traversal of the tree. The third line should contain the keys of the
// vertices in the post-order traversal of the tree.
// Example output: 1 2 3 4 5
//                 4 2 1 3 5
//                 1 3 2 5 4

import java.util.*;
import java.io.*;

public class treeOrders {
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

  public class TreeOrders {
    int n;
    int[] key, left, right;
    ArrayList<Integer> result = new ArrayList<Integer>();
    
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

    List<Integer> inOrder(int nodeIndex) {
      ArrayList<Integer> result = new ArrayList<Integer>();

      if (left[nodeIndex] != -1) {
        result.addAll(inOrder(left[nodeIndex]));
      }

      result.add(key[nodeIndex]);

      if (right[nodeIndex] != -1) {
        result.addAll(inOrder(right[nodeIndex]));
      }

      return result;
    }

    List<Integer> preOrder(int nodeIndex) {
      ArrayList<Integer> result = new ArrayList<Integer>();

      result.add(key[nodeIndex]);

      if (left[nodeIndex] != -1) {
        result.addAll(preOrder(left[nodeIndex]));
      }

      if (right[nodeIndex] != -1) {
        result.addAll(preOrder(right[nodeIndex]));
      }

      return result;
    }

    List<Integer> postOrder(int nodeIndex) {
      ArrayList<Integer> result = new ArrayList<Integer>();

      if (left[nodeIndex] != -1) {
        result.addAll(postOrder(left[nodeIndex]));
      }

      if (right[nodeIndex] != -1) {
        result.addAll(postOrder(right[nodeIndex]));
      }

      result.add(key[nodeIndex]);

      return result;
    }
  }

  static public void main(String[] args) throws IOException {
    new Thread(null, new Runnable() {
      public void run() {
        try {
          new treeOrders().run();
        } catch (IOException e) {
          //
        }
      }
    }, "1", 1 << 26).start();
  }

  public void print(List<Integer> x) {
    for (Integer a : x) {
      System.out.print(a + " ");
    }

    System.out.println();
  }

  public void run() throws IOException {
    TreeOrders tree = new TreeOrders();

    tree.read();

    print(tree.inOrder(0));
    print(tree.preOrder(0));
    print(tree.postOrder(0));
  }
}
