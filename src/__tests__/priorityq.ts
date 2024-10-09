import { PriorityQueue } from '../priorityq';

describe('PriorityQueue', () => {
    let pq: PriorityQueue<string>;

    beforeEach(() => {
        pq = new PriorityQueue<string>();
    });

    test('should be empty when created', () => {
        expect(pq.isEmpty()).toBe(true);
        expect(pq.size()).toBe(0);
    });

    test('should enqueue and dequeue items correctly', () => {
        pq.enqueue('low', 3);
        pq.enqueue('medium', 2);
        pq.enqueue('high', 1);

        expect(pq.size()).toBe(3);
        expect(pq.dequeue()).toBe('high');
        expect(pq.dequeue()).toBe('medium');
        expect(pq.dequeue()).toBe('low');
        expect(pq.isEmpty()).toBe(true);
    });

    test('should peek at the highest priority item without removing it', () => {
        pq.enqueue('low', 3);
        pq.enqueue('high', 1);
        pq.enqueue('medium', 2);

        expect(pq.peek()).toBe('high');
        expect(pq.size()).toBe(3);
    });

    test('should dequeue the lowest priority item', () => {
        pq.enqueue('low', 3);
        pq.enqueue('high', 1);
        pq.enqueue('medium', 2);

        expect(pq.dequeueLowestPriority()).toEqual([3, 'low']);
        expect(pq.size()).toBe(2);
        expect(pq.dequeue()).toBe('high');
        expect(pq.dequeue()).toBe('medium');
    });

    test('should return undefined when dequeueing from an empty queue', () => {
        expect(pq.dequeue()).toBeUndefined();
        expect(pq.dequeueLowestPriority()).toBeUndefined();
    });

    test('should handle negative priorities correctly', () => {
        pq.enqueue('very high', -2);
        pq.enqueue('high', -1);
        pq.enqueue('normal', 0);
        pq.enqueue('low', 1);

        expect(pq.size()).toBe(4);
        expect(pq.dequeue()).toBe('very high');
        expect(pq.dequeue()).toBe('high');
        expect(pq.dequeue()).toBe('normal');
        expect(pq.dequeue()).toBe('low');
        expect(pq.isEmpty()).toBe(true);
    });

    test('should dequeue lowest priority item with negative priorities', () => {
        pq.enqueue('lowest', 2);
        pq.enqueue('highest', -2);
        pq.enqueue('medium', 0);
        pq.enqueue('low', 1);
        pq.enqueue('high', -1);

        expect(pq.dequeueLowestPriority()).toEqual([2, 'lowest']);
        expect(pq.size()).toBe(4);
        expect(pq.dequeue()).toBe('highest');
        expect(pq.dequeue()).toBe('high');
        expect(pq.dequeue()).toBe('medium');
        expect(pq.dequeue()).toBe('low');
    });

    test('should correctly check if an item is contained in the queue', () => {
        pq.enqueue('item1', 1);
        pq.enqueue('item2', 2);
        pq.enqueue('item3', 3);

        expect(pq.contains('item1')).toBe(true);
        expect(pq.contains('item2')).toBe(true);
        expect(pq.contains('item3')).toBe(true);
        expect(pq.contains('item4')).toBe(false);
    });

    test('should return false for contains on an empty queue', () => {
        expect(pq.contains('anyItem')).toBe(false);
    });

    test('should update contains status after dequeue operations', () => {
        pq.enqueue('item1', 1);
        pq.enqueue('item2', 2);

        expect(pq.contains('item1')).toBe(true);
        expect(pq.contains('item2')).toBe(true);

        pq.dequeue();
        expect(pq.contains('item1')).toBe(false);
        expect(pq.contains('item2')).toBe(true);

        pq.dequeue();
        expect(pq.contains('item1')).toBe(false);
        expect(pq.contains('item2')).toBe(false);
    });

    test('should update contains status after dequeueLowestPriority operations', () => {
        pq.enqueue('low', 3);
        pq.enqueue('high', 1);
        pq.enqueue('medium', 2);

        expect(pq.contains('low')).toBe(true);
        expect(pq.contains('high')).toBe(true);
        expect(pq.contains('medium')).toBe(true);

        pq.dequeueLowestPriority();
        expect(pq.contains('low')).toBe(false);
        expect(pq.contains('high')).toBe(true);
        expect(pq.contains('medium')).toBe(true);
    });

    test('should not enqueue duplicate items', () => {
        pq.enqueue('item', 1);
        pq.enqueue('item', 2);
        pq.enqueue('item', 3);

        expect(pq.size()).toBe(1);
        expect(pq.contains('item')).toBe(true);
        expect(pq.dequeue()).toBe('item');
        expect(pq.isEmpty()).toBe(true);
    });
});