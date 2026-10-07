/**
 * @template T
 * 
 * A simple binary heap-based priority queue implementation.
 * 
 * Binary min-heap stored in a flat array.
 *
 * For any element at index i:
 *   parent index = (i - 1) >> 1
 *   left child   = i * 2 + 1
 *   right child  = i * 2 + 2
 */
export default class PriorityQueue {
  /** @type {T[]} */ #heap;
  /** @type {(a: T, b: T) => number} */ #comparator;

  /**
   * @param {(a: T, b: T) => number} compareFn
   * Comparator like Array.prototype.sort:
   *   < 0 if a has higher priority than b
   */
  constructor(compareFn) {
    this.#heap = [];
    this.#comparator = compareFn;
  }

  get size() {
    return this.#heap.length;
  }

  isEmpty() {
    return this.#heap.length === 0;
  }

  /** @returns {T?} */
  peek() {
    return this.#heap[0] ?? null;
  }

  /** @param {T} value */
  enqueue(value) {
    this.#heap.push(value);
    this.#siftUp(this.#heap.length - 1);
  }

  /** @returns {T?} */
  dequeue() {
    if (this.#heap.length === 0) return null;

    const top = this.#heap[0];
    const last = this.#heap.pop();

    if (this.#heap.length > 0) {
      this.#heap[0] = last;
      this.#siftDown(0);
    }

    return top;
  }

  /**
   * Compare [two elements in the heap by their indices]'s priorities.
   * 
   * @param {number} i
   * @param {number} j
   * @returns {number}
   */
  #compare(i, j) {
    return this.#comparator(this.#heap[i], this.#heap[j]);
  }

  /**
   * Swap two elements in the heap array.
   *
   * This is a primitive heap operation used by siftUp and siftDown.
   *
   * @param {number} i
   * @param {number} j
   */
  #swap(i, j) {
    const temp = this.#heap[i];
    this.#heap[i] = this.#heap[j];
    this.#heap[j] = temp;
  }

  /**
   * Restore the heap invariant by moving an element *up* the tree.
   *
   * This is called after inserting a new element at the end of the heap array.
   * The element may violate the heap property by having higher priority than
   * its parent. We repeatedly swap it with its parent until the invariant holds.
   *
   * Heap invariant (min-heap):
   *   For every index i > 0,
   *     compare(heap[parent(i)], heap[i]) <= 0
   *
   * Algorithm:
   *   - While the element is not the root:
   *     - Compute its parent index: parent = (i - 1) >> 1
   *     - If the parent already has higher or equal priority, stop
   *     - Otherwise, swap the element with its parent and continue upward
   *
   * Termination:
   *   - The element reaches the root, or
   *   - The parent has higher or equal priority
   *
   * Time complexity:
   *   O(log n) in the worst case (tree height)
   *
   * @param {number} index
   *   Index of the newly inserted element in the heap array
   */
  #siftUp(index) {
    while (index > 0) {
      const parent = (index - 1) >> 1; // integer division by 2

      // If the parent is already higher priority, we're done
      if (this.#compare(index, parent) >= 0) return;

      this.#swap(index, parent);
      index = parent;
    }
  }

  /**
   * Restore the heap invariant by moving an element *down* the tree.
   *
   * This is called after removing the root element. The last element in the
   * heap array is moved to the root position and usually violates the heap property
   * by having lower priority than one or both of its children.
   *
   * Heap invariant (min-heap):
   *   For every index i > 0,
   *     compare(heap[parent(i)], heap[i]) <= 0
   *
   * Algorithm:
   *   - While the element has at least one child:
   *     - Compute indices of the left and right children
   *     - Select the child with the higher priority (smaller compare() value)
   *     - If the element already has higher or equal priority than that child, stop
   *     - Otherwise, swap with the selected child and continue downward
   *
   * Termination:
   *   - The element has no children, or
   *   - The heap invariant is restored at the current position
   *
   * Time complexity:
   *   O(log n) in the worst case (tree height)
   *
   * @param {number} index
   *   Index of the element to sift downward (typically 0)
   */
  #siftDown(index) {
    const length = this.#heap.length;
    let left;

    while ((left = index * 2 + 1) < length) { // While there is at least one child. Assignment in condition is intentional, takes this form to both avoid eslint warning (re: while(true)) and avoid duplicate computation.
      const right = left + 1;

      // If the parent is already higher priority, we're done
      const child = this.#higherPriorityChildIndex(left, right);
      if (this.#compare(index, child) <= 0) return;

      this.#swap(index, child);
      index = child;
    }
  }

  #higherPriorityChildIndex(left, right) {
    if (right < this.#heap.length && this.#compare(right, left) < 0) return right;
    return left;
  }
}