import java.util.*;

public class toposort {
    private static ArrayList<Integer> toposort(ArrayList<Integer>[] adj) {
        boolean[] used = new boolean[adj.length];
        ArrayList<Integer> order = new ArrayList<>();
        for(int i = 0; i < adj.length; i++) {
            Deque<Integer> stack = new ArrayDeque<>();
            stack.push(i);
            dfs(adj, stack, used, order);
        }
        Collections.reverse(order);
        return order;
    }
    
    private static void dfs(ArrayList<Integer>[] adj,
                            Deque<Integer> stack,
                            boolean[] used,
                            ArrayList<Integer> order) {
        Set<Integer> visited = new HashSet<>();
        while(!stack.isEmpty()) {
            int current = stack.peek();
            if(used[current]) {
                stack.pop();
                continue;
            }
            if(visited.contains(current)) {
                order.add(current);
                stack.pop();
                used[current] = true;
            } else {
                if(!adj[current].isEmpty()) {
                    visited.add(current);
                    adj[current].forEach(edge -> {
                        if(!used[edge]) stack.push(edge);
                    });
                } else {
                    order.add(current);
                    stack.pop();
                    used[current] = true;
                }
            }
        }
    }
    
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        int m = scanner.nextInt();
        ArrayList<Integer>[] adj = new ArrayList[n];
        for (int i = 0; i < n; i++) {
            adj[i] = new ArrayList<>();
        }
        for (int i = 0; i < m; i++) {
            int x, y;
            x = scanner.nextInt();
            y = scanner.nextInt();
            adj[x - 1].add(y - 1);
        }
        List<Integer> order = toposort(adj);
        for (int x : order) {
            System.out.print((x + 1) + " ");
        }
    }
}
