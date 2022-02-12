Basics
Add, find and delete
Iteratation
Implementation
Basics
A map is an unordered collection of key-value pairs, where each key is unique.

var m map[string]int                // m == nil, len(m) == 0
m1 := make(map[string]float64)      // empty map of string-float64 pairs
m2 := make(map[string]float64, 100) // preallocate room for 100 entries
m3 := map[string]float64{
    "e":  2.71828,
    "pi": 3.1416,
}
fmt.Println(len(m1), len(m2), len(m3)) // 0 0 2
The default zero value of a map is nil. A nil map is equivalent to an empty map except that no elements can be added.
You create a map either by a map literal or a call to the make function, which takes an optional capacity as argument.
The built-in len function retrieves the number of key-value pairs.
Add, find and delete
m := make(map[string]float64)

m["pi"] = 3.1416 // Add a new key-value pair.
fmt.Println(m)   // map[pi:3.1416]

v1 := m["pi"]  // v1 == 3.1416
v2 := m["foo"] // v2 == 0 (zero value)

_, exists := m["pi"] // exists == true
_, exists = m["foo"] // exists == false

if x, ok := m["pi"]; ok { // Prints 3.1416.
    fmt.Println(x)
}

delete(m, "pi") // Delete a key-value pair.
fmt.Println(m)  // map[]
Iteration
m := map[string]float64{
    "e":  2.71828,
    "pi": 3.1416,
}
for key, value := range m { // order not specified 
    fmt.Println(key, value)
}
Iteration order is not specified and may vary from iteration to iteration.
If an entry that has not yet been reached is removed during iteration, the corresponding iteration value will not be produced.
If an entry is created during iteration, that entry may or may not be produced during the iteration.
Implementation
Maps are backed by hash tables.
They provide lookup, insert, and delete operations in constant amortized time.
The comparison operators == and != must be defined for the key type.