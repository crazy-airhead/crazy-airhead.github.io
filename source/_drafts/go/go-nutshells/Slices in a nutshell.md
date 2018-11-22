Basics
Construction
Iteration
Append and copy
Stacks and queues
Basics
A slice doesn’t store any data, it just describes a section of an underlying array.

When you change an element of a slice, you modify the corresponding element of its underlying array, and other slices that share the same underlying array will see the change.
A slice can grow and shrink within the bounds of the underlying array.
Slices are indexed in the usual way: s[i] accesses the ith element, starting from zero. 
Construction
var s []int                   // a nil slice
s1 := []string{"foo", "bar"}
s2 := make([]int, 2)          // same as []int{0, 0}
s3 := make([]int, 2, 4)       // same as new([4]int)[:2]
fmt.Println(len(s3), cap(s3)) // 2 4
The default zero value of a slice is nil. The functions len, cap and append all regard nil as an empty slice with 0 capacity.
You create a slice either by a slice literal or a call to the make function, which takes the length and an optional capacity as arguments.
The built-in len and cap functions retrieve the length and capacity.
Slicing
a := [...]int{0, 1, 2, 3} // an array
s := a[1:3]               // s == []int{1, 2}        cap(s) == 3
s = a[:2]                 // s == []int{0, 1}        cap(s) == 4
s = a[2:]                 // s == []int{2, 3}        cap(s) == 2
s = a[:]                  // s == []int{0, 1, 2, 3}  cap(s) == 4
You can also create a slice by slicing an existing array or slice.

A slice is formed by specifying a low bound and a high bound: a[low:high]. This selects a half-open range which includes the first element, but excludes the last.
You may omit the high or low bounds to use their defaults instead. The default is zero for the low bound and the length of the slice for the high bound.
s := []int{0, 1, 2, 3, 4} // a slice
s = s[1:4]                // s == []int{1, 2, 3}
s = s[1:2]                // s == []int{2} (index relative to slice)
s = s[:3]                 // s == []int{2, 3, 4} (extend length)
When you slice a slice, the indexes are relative to the slice itself, not to the backing array.

The high bound is not bound by the slice’s length, but by it’s capacity, which means you can extend the length of the slice.
Trying to extend beyond the capacity causes a panic.
Iteration
s := []string{"Foo", "Bar"}
for i, v := range s {
    fmt.Println(i, v)
}
0 Foo
1 Bar
The range expression, s, is evaluated once before beginning the loop.
The iteration values are assigned to the respective iteration variables, i and v, as in an assignment statement.
The second iteration variable is optional.
If the slice is nil, the number of iterations is 0.
Append and copy
The append function appends elements to a slice. It will automatically allocate a larger backing array if the capacity is exceeded. See Append function.
The copy function copies elements into a destination slice dst from a source slice src. The number of elements copied is the minimum of len(dst) and len(src). See Copy function.
Stacks and queues
The idiomatic way to implement a stack or queue in Go is to use a slice directly. For code examples, see

Implement a stack (LIFO)
Implement a FIFO queue
More nutshells
Go nutshells: concise descriptions of core Go concepts
Core Go concepts: interfaces, slices, maps, for loops, switch statements, packages.