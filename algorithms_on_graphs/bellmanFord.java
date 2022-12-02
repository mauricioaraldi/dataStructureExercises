// Input: First line "n m w", where n is number of vertices, m number of edges and w is weight.
// After this, m lines with "u v", where both are connected vertices of the graph.
// Example input: 4 4
//                1 2 -5
//                4 1 2
//                2 3 2
//                3 1 1
// Output: 1 is there's a negative cycle. 0 otherwise.
// Example output: 1

import java.util.ArrayList;
import java.util.Scanner;

public class bellmanFord {
    private static boolean bellmanFord(
      int verticesQt,
      ArrayList<ArrayList<Integer>>connections,
      int[] dist,
      int start
    ) {
      for (int i = 0; i < dist.length; i++) {
        dist[i] = 1001;
      }

      dist[start] = 0;

      for (int i = 1; i < verticesQt; i++) {
        for (int j = 0; j < connections.size(); j++) {
          int u = connections.get(j).get(0);
          int v = connections.get(j).get(1);
          int weight = connections.get(j).get(2);

          if (dist[u] != 1001 && dist[u] + weight < dist[v]) {
            dist[v] = dist[u] + weight;
          }
        }
      }

      for (int j = 0; j < connections.size(); j++) {
        int u = connections.get(j).get(0);
        int v = connections.get(j).get(1);
        int weight = connections.get(j).get(2);

        if (dist[u] != 1001 && dist[u] + weight < dist[v]) {
          return true;
        }
      }

      return false;
    }

    private static int negativeCycle(int verticesQt, ArrayList<ArrayList<Integer>> connections) {
      boolean[] visited = new boolean[verticesQt];
      int[] dist = new int[verticesQt];

      for (int i = 0; i < verticesQt; i++) {
        visited[i] = false;
      }

      for (int i = 0; i < verticesQt; i++) {
        dist[i] = 1001;
      }

      for (int i = 0; i < verticesQt; i++) {
        if (visited[i] == false) {
          if (bellmanFord(verticesQt, connections, dist, i)) {
            return 1;
          }

          for (int j = 0; j < verticesQt; j++) {
            if (dist[j] != 1001) {
              visited[j] = true;
            }
          }
        }
      }

      return 0;
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int verticesQt = scanner.nextInt();
        int edgesQt = scanner.nextInt();
        ArrayList<ArrayList<Integer>> connections = new ArrayList<ArrayList<Integer>>(edgesQt);

        for (int i = 0; i < edgesQt; i++) {
            int x, y, w;
            x = scanner.nextInt();
            y = scanner.nextInt();
            w = scanner.nextInt();

            ArrayList<Integer> connection = new ArrayList<Integer>(3);

            connection.add(x - 1);
            connection.add(y - 1);
            connection.add(w);

            connections.add(connection);
        }

        System.out.println(negativeCycle(verticesQt, connections));
    }
}

