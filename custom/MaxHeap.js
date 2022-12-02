class MaxHeap {
  #heap = [];

  #getLeftChild(index) {
    return index * 2 + 1;
  }

  #getRightChild(index) {
    return index * 2 + 2;
  }

  #getParent(index) {
    return Math.floor((index - 1) / 2);
  }

  #swap(a, b) {
    const tmp = this.#heap[a];

    this.#heap[a] = this.#heap[b];
    this.#heap[b] = tmp;
  }

  #siftDown(index) {
    const leftChild = this.#getLeftChild(index);
    const rightChild = this.#getRightChild(index);
    let minIndex = index;

    if (leftChild < this.#heap.length && this.#heap[minIndex] < this.#heap[leftChild]) {
      minIndex = leftChild;
    }

    if (rightChild < this.#heap.length && this.#heap[minIndex] < this.#heap[rightChild]) {
      minIndex = rightChild;
    }

    if (minIndex != index) {
      this.#swap(minIndex, index);
      this.#siftDown(minIndex);
    }
  }

  #siftUp(index) {
    let newIndex = index;
    let parentIndex = this.#getParent(index);

    while (newIndex !== 0 && this.#heap[newIndex] > this.#heap[parentIndex]) {
      this.#swap(newIndex, parentIndex);
      newIndex = parentIndex;
      parentIndex = this.#getParent(newIndex);
    }
  }

  peek() {
    return this.#heap[0];
  }

  insert(element) {
    this.#siftUp(this.#heap.push(element));
  }

  extractMax() {
    const root = this.#heap[0];
    const lastElement = this.#heap.pop();

    if (this.#heap.length) {
      this.#heap[0] = lastElement;
      this.#siftDown(0);
    }

    return root;
  }

  changePriority(index, newPriority) {
    const oldPriority = this.#heap[index];
    this.#heap[index] = newPriority;

    if (newPriority > oldPriority) {
      this.#siftUp(index);
    } else {
      this.#siftDown(index);
    }
  }

  get length() {
    return this.#heap.length;
  }

  get isEmpty() {
    return this.length === 0;
  }
}
