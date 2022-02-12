# Interfaces in a nutshell

## Basics
An interface type consists of a set of method signatures. A variable of interface type can hold any value that implements these methods.

接口类型是一组方法的签名集合。一个接口类型变量的值可以是实现这些方法的任意类型。

In this example both Temp and *Point implement the MyStringer interface.

在这个例子中Temp和*Point都实现了MyStringer接口。

```go
type MyStringer interface {
	String() string
}
type Temp int

func (t Temp) String() string {
	return strconv.Itoa(int(t)) + " °C"
}

type Point struct {
	x, y int
}

func (p *Point) String() string {
	return fmt.Sprintf("(%d,%d)", p.x, p.y)
}
```

Actually, *Temp also implements MyStringer, since the method set of a pointer type *T is the set of all methods with receiver *T or T.

事实上，*Temp也实现了MyStringer，因为指针类型 *T的方法集包含接有者为 *T和T的所有方法的集合。

When you call a method on an interface value, the method of its underlying type is executed.

当你调用一个接口变量的方法，接口的底层类型的方法被调用。

```go
var x MyStringer

x = Temp(24)
fmt.Println(x.String()) // 24 °C

x = &Point{1, 2}
fmt.Println(x.String()) // (1,2)
```

## Structural typing
A type implements an interface by implementing its methods. No explicit declaration is required.

一个类型实现一个接口，实现它的方法就可以，不需要显示的申明。

In fact, the Temp, *Temp and *Point types also implement the standard library fmt.Stringer interface. The String method in this interface is used to print values passed as an operand to functions such as fmt.Println.

```go
var x MyStringer

x = Temp(24)
fmt.Println(x) // 24 °C

x = &Point{1, 2}
fmt.Println(x) // (1,2)
```

## The empty interface
The interface type that specifies no methods is known as the empty interface.

没有指定任何方法的接口是空接口。

interface{}
An empty interface can hold values of any type since every type implements at least zero methods.

空接口可能存任务类型的值，因为任何类型都实现了空方法。

var x interface{}

x = 2.4
fmt.Println(x) // 2.4

x = &Point{1, 2}
fmt.Println(x) // (1,2)
The fmt.Println function is a chief example. It takes any number of arguments of any type.

func Println(a ...interface{}) (n int, err error)
Interface values
An interface value consists of a concrete value and a dynamic type: [Value, Type]

In a call to fmt.Printf, you can use %v to print the concrete value and %T to print the dynamic type.

var x MyStringer
fmt.Printf("%v %T\n", x, x) // <nil> <nil>

x = Temp(24)
fmt.Printf("%v %T\n", x, x) // 24 °C main.Temp

x = &Point{1, 2}
fmt.Printf("%v %T\n", x, x) // (1,2) *main.Point

x = (*Point)(nil)
fmt.Printf("%v %T\n", x, x) // <nil> *main.Point
The zero value of an interface type is nil, which is represented as [nil, nil].

Calling a method on a nil interface is a run-time error. However, it’s quite common to write methods that can handle a receiver value [nil, Type], where Type isn’t nil.

You can also use type assertions, type switches and reflection to access the dynamic type of an interface value. Find the type of an object has more details.

Equality
Two interface values are equal

if they have equal concrete values and identical dynamic types,
or if both are nil.
A value t of interface type T and a value x of non-interface type X are equal if

t’s concrete value is equal to x
and t’s dynamic type is identical to X.
var x MyStringer
fmt.Println(x == nil) // true

x = (*Point)(nil)
fmt.Println(x == nil) // false
In the second print statement, the concrete value of x equals nil, but its dynamic type is *Point, which is not nil.

Further reading
Generics (alternatives and workarounds)
Generics (alternatives and workarounds) discusses how interfaces, multiple functions, type assertions, reflection and code generation can be use in place of parametric polymorphism in Go.