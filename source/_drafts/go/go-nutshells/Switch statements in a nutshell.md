
A switch is a cleaner way to write a sequence of if statements.

Basics
No condition
Case lists
Fallthrough
Exit a switch
Execution order
Basics
switch time.Now().Weekday() {
case time.Saturday:
    fmt.Println("Today is Saturday.")
case time.Sunday:
    fmt.Println("Today is Sunday.")
default:
    fmt.Println("Today is a weekday.")
}
A switch statement runs the first case equal to the condition expression.
The cases are evaluated from top to bottom, stopping when a case succeeds.
Unlike C and Java, the case expressions do not need to be constants.

No condition
hour := time.Now().Hour()
switch { // Same as: switch true
case hour < 12:
    fmt.Println("Good morning!")
case hour < 17:
    fmt.Println("Good afternoon!")
default:
    fmt.Println("Good evening!")
}
Case lists
func whiteSpace(c rune) bool {
    switch c {
    case ' ', '\t', '\n', '\f', '\r':
        return true
    }
    return false
}
Fallthrough
switch 2 {
case 1:
    fmt.Println("1")
    fallthrough
case 2:
    fmt.Println("2")
    fallthrough
case 3:
    fmt.Println("3")
}
2
3
A fallthrough statement transfers control to the next case.
It may be used only as the final statement in a clause.
Exit a switch
A break statement terminates execution of the innermost for, switch, or select statement.

If you need to break out of a surrounding loop, not the switch, you can put a label on the loop and break to that label. This example shows both uses.

Loop:
    for _, ch := range "a b\nc" {
        switch ch {
        case ' ': // skip space
            break
        case '\n': // break at newline
            break Loop
        default:
            fmt.Printf("%c\n", ch)
        }
    }
a
b
Execution order
// Foo prints and returns n.
func Foo(n int) int {
    fmt.Println(n)
    return n
}

func main() {
    switch Foo(2) {
    case Foo(1), Foo(2), Foo(3):
        fmt.Println("First case")
        fallthrough
    case Foo(4):
        fmt.Println("Second case")
    }
}
2
1
2
First case
Second case
First the switch expression is evaluated once.
Then case expressions are evaluated left-to-right and top-to-bottom:
the first one that equals the switch expression triggers execution of the statements of the associated case,
the other cases are skipped.
More nutshells
Go nutshells: concise descriptions of core Go concepts
Core Go concepts: interfaces, slices, maps, for loops, switch statements, packages.