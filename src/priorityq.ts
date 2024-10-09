export class PriorityQueue<T> {
    private heap: [number, T][] = [];
    private keySet: Set<T> = new Set();

    constructor() {}

    public isEmpty(): boolean {
        return this.heap.length === 0;
    }

    public size(): number {
        return this.heap.length;
    }

    public contains(item: T): boolean {
        return this.keySet.has(item);
    }

    public enqueue(item: T, priority: number): void {
        if (this.contains(item)) {
            return;
        }
        this.heap.push([priority, item]);
        this.bubbleUp(this.heap.length - 1);
        this.keySet.add(item);
    }

    public dequeue(): T | undefined {
        if (this.isEmpty()) {
            return undefined;
        }
        if (this.size() === 1) {
            const top = this.heap.pop()!;
            this.keySet.delete(top[1]);
            return top[1];
        }
        const top = this.heap[0];
        this.heap[0] = this.heap.pop()!;
        this.bubbleDown(0);
        this.keySet.delete(top[1]);
        return top[1];
    }

    
    public dequeueLowestPriority(): [number, T] | undefined {
        if (this.isEmpty()) {
            return undefined;
        }
        
        let lowestPriorityIndex = 0;
        for (let i = 1; i < this.heap.length; i++) {
            if (this.heap[i][0] > this.heap[lowestPriorityIndex][0]) {
                lowestPriorityIndex = i;
            }
        }
        
        const lowestPriorityItem = this.heap[lowestPriorityIndex];
        
        // Remove the item by replacing it with the last item in the heap
        const lastItem = this.heap.pop()!;
        if (lowestPriorityIndex < this.heap.length) {
            this.heap[lowestPriorityIndex] = lastItem;
            this.bubbleUp(lowestPriorityIndex);
            this.bubbleDown(lowestPriorityIndex);
        }

        this.keySet.delete(lowestPriorityItem[1]);
        return lowestPriorityItem;
    }

    public peek(): T | undefined {
        return this.isEmpty() ? undefined : this.heap[0][1];
    }

    private bubbleUp(index: number): void {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[index][0] >= this.heap[parentIndex][0]) break;
            [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
            index = parentIndex;
        }
    }

    private bubbleDown(index: number): void {
        while (true) {
            const leftChild = 2 * index + 1;
            const rightChild = 2 * index + 2;
            let smallest = index;

            if (leftChild < this.heap.length && this.heap[leftChild][0] < this.heap[smallest][0]) {
                smallest = leftChild;
            }
            if (rightChild < this.heap.length && this.heap[rightChild][0] < this.heap[smallest][0]) {
                smallest = rightChild;
            }

            if (smallest === index) break;

            [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
            index = smallest;
        }
    }
}
