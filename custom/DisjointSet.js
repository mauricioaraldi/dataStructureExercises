class DisjointSet {
  #parent;
  #rank;

  constructor(size) {
    this.#parent = new Array(size);
    this.#rank = new Array(size);
  }

  makeSet(i) {
    this.#parent[i] = i;
    this.#rank[i] = 0;
  }

  find(i) {
    while (i !== this.#parent[i]) {
      i = this.#parent[i];
    }

    return i;
  }

  union(i, j) {
    const iId = this.find(i);
    const jId = this.find(j);

    if (iId === jId) {
      return;
    }

    if (this.#rank[iId] > this.#rank[jId]) {
      this.#parent[jId] = iId;
    } else {
      this.#parent[iId] = jId;

      if (this.#rank[iId] === this.#rank[jId]) {
        this.#rank[jId]++;
      }
    }
  }
}
