class MinHeapKey {
  #heap = [];
  #positionKey = {};
  #keyPosition = {};

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
    const aKey = this.#positionKey[a];
    const bKey = this.#positionKey[b];

    this.#heap[a] = this.#heap[b];
    this.#heap[b] = tmp;

    this.#positionKey[a] = bKey;
    this.#positionKey[b] = aKey;

    this.#keyPosition[aKey] = b;
    this.#keyPosition[bKey] = a;
  }

  #siftDown(index) {
    const leftChild = this.#getLeftChild(index);
    const rightChild = this.#getRightChild(index);
    let maxIndex = index;

    if (leftChild < this.#heap.length && this.#heap[leftChild] < this.#heap[maxIndex]) {
      maxIndex = leftChild;
    }

    if (rightChild < this.#heap.length && this.#heap[rightChild] < this.#heap[maxIndex]) {
      maxIndex = rightChild;
    }

    if (maxIndex != index) {
      this.#swap(maxIndex, index);
      this.#siftDown(maxIndex);
    }
  }

  #siftUp(index) {
    let newIndex = index;
    let parentIndex = this.#getParent(index);

    while (newIndex !== 0 && this.#heap[newIndex] < this.#heap[parentIndex]) {
      this.#swap(newIndex, parentIndex);
      newIndex = parentIndex;
      parentIndex = this.#getParent(newIndex);
    }
  }

  peek() {
    return this.#heap[0];
  }

  insert(priority, key) {
    const newIndex = this.#heap.push(priority) - 1;

    this.#keyPosition[key] = newIndex;
    this.#positionKey[newIndex] = key;

    this.#siftUp(newIndex);
  }

  extractMin() {
    const root = this.#heap[0];
    const rootKey = this.#positionKey[0];
    const lastElementIndex = this.#heap.length - 1;
    const lastElementKey = this.#positionKey[lastElementIndex];
    const lastElement = this.#heap.pop();

    delete this.#keyPosition[rootKey];

    if (this.#heap.length) {
      this.#heap[0] = lastElement;

      this.#positionKey[0] = lastElementKey;
      this.#keyPosition[lastElementKey] = 0;

      this.#siftDown(0);
    }

    return { value: root, key: rootKey };
  }

  changePriority(key, newPriority) {
    const elementPosition = this.#keyPosition[key];
    const oldPriority = this.#heap[elementPosition];
    this.#heap[elementPosition] = newPriority;

    if (newPriority < oldPriority) {
      this.#siftUp(elementPosition);
    } else {
      this.#siftDown(elementPosition);
    }
  }

  get length() {
    return this.#heap.length;
  }

  get isEmpty() {
    return this.length === 0;
  }
}
