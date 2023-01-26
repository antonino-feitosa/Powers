using System;
using System.Collections.Generic;
using UnityEngine;

public class PriorityQueue<T> : IComparer<T>
{

    private IComparer<T> cmp;
    private List<T> values;
    private Dictionary<T, int> order;
    private int count;

    public PriorityQueue(IComparer<T> cmp)
    {
        count = 0;
        this.cmp = cmp;
        values = new List<T>();
        order = new Dictionary<T, int>();
    }

    public int Count { get { return values.Count; } }

    public T Remove(T element)
    {
        int index = values.FindIndex(e => element.Equals(e));
        if (index >= 0)
        {
            T e = values[index];
            values[index] = values[values.Count - 1];
            values.RemoveAt(values.Count - 1);
            if (values.Count > index)
            {
                Down(index);
            }
            order.Remove(e);
            return e;
        }
        return default(T);
    }

    public void Update(T element){ // TODO
        Remove(element);
        Push(element);
    }

    public void Push(T element)
    {
        values.Add(element);
        order.Add(element, count++);
        Up(values.Count - 1);
    }

    public T Pop()
    {
        if (Count == 0)
        {
            throw new IndexOutOfRangeException("The heap is empty!");
        }
        T e = this.values[0];
        values[0] = values[values.Count - 1];
        values.RemoveAt(values.Count - 1);
        if (values.Count > 0)
        {
            Down(0);
        }
        order.Remove(e);
        return e;
    }

    public T Peek()
    {
        if (Count == 0)
        {
            throw new IndexOutOfRangeException("The heap is empty!");
        }
        return this.values[0];
    }

    private void Up(int index)
    {
        if (index > 0)
        {
            int upindex = (int)Mathf.Floor((index - 1) / 2);
            if (Compare(values[index], values[upindex]) < 0)
            {
                Swap(index, upindex);
                Up(upindex);
            }
        }
    }

    private void Down(int index)
    {
        int left = index * 2 + 1;
        int right = index * 2 + 2;
        if (right < values.Count)
        {
            if (Compare(values[right], values[left]) < 0)
            {
                left = right;
            }
        }
        if (left < values.Count && Compare(values[index], values[left]) > 0)
        {
            Swap(index, left);
            Down(left);
        }
    }

    private void Swap(int a, int b)
    {
        var aux = values[a];
        values[a] = values[b];
        values[b] = aux;
    }

    public int Compare(T x, T y)
    {
        int diff = cmp.Compare(x, y);
        if (diff == 0)
        {
            diff = order[x] - order[y];
        }
        return diff;
    }
}

/*

        Heap = ig.Class.extend({

            init: function (values = [], compare = (x, y) => x - y) {
                this.compare = compare;
                this.heapfy(values);
            },

            heapfy: function (values) {
                this.values = [...values];
                if (this.values.length > 1) {
                    for (let i = Math.floor(this.values.length / 2); i >= 0; i--) {
                        this._down(i);
                    }
                }
            },

            length: function () {
                return this.values.length;
            },

            isEmpty: function () {
                return this.values.length === 0;
            },

            clear: function () {
                this.values = [];
            },

            has: function (equals) {
                return this.values.find(e => equals(e));
            },

            del: function (equals) {
                let index = this.values.findIndex(e => equals(e));
                if (index > 0) {
                    let e = this.values[index];
                    this.values[index] = this.values[this.values.length - 1];
                    this.values.length -= 1;
                    if (this.values.length > index) {
                        this._down(index);
                    }
                    return e;
                }
                return null;
            },

            push: function (element) {
                this.values.push(element);
                this._up(this.values.length - 1);
                return this;
            },

            pop: function () {
                if (this.isEmpty()) {
                    throw new Error('The heap is empty!');
                }
                let e = this.values[0];
                this.values[0] = this.values[this.values.length - 1];
                this.values.length -= 1;
                if (this.values.length > 0) {
                    this._down(0);
                }
                return e;
            },

            peek: function () {
                if (this.isEmpty()) {
                    throw new Error('The heap is empty!');
                }
                return this.values[0];
            },

            clone: function () {
                let ch = new Heap();
                ch.values = [... (this.values)];
                ch.compare = this.compare;
                return ch;
            },

            toArray: function (call) {
                let copy = this.clone();
                let array = [];
                while (!copy.isEmpty()) {
                    let e = copy.pop();
                    array.push(e);
                }
                return array;
            },

            _up: function (index) {
                if (index > 0) {
                    let upindex = Math.floor((index - 1) / 2);
                    if (this.compare(this.values[index], this.values[upindex]) < 0) {
                        this._swap(index, upindex);
                        this._up(upindex);
                    }
                }
            },

            _swap: function (a, b) {
                [this.values[a], this.values[b]] = [this.values[b], this.values[a]];
            },

            _down: function (index) {
                let left = index * 2 + 1;
                let right = index * 2 + 2;
                if (right < this.values.length) {
                    if (this.compare(this.values[right], this.values[left]) < 0) {
                        left = right;
                    }
                }
                if (left < this.values.length && this.compare(this.values[index], this.values[left]) > 0) {
                    this._swap(index, left);
                    this._down(left);
                }
            }
        });
        */