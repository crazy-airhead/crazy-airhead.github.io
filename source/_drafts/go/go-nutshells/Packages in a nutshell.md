Basics
Declare a package
Package name conflicts
Dot imports
Package download
Package documentation
Basics
Every Go program is made up of packages and each package has an import path:

"fmt"
"math/rand"
"github.com/yourbasic/graph"
Packages in the standard library have short import paths, such as "fmt" and "math/rand". Third-party packages, such as "github.com/yourbasic/graph", typically have an import path that includes a hosting service (github.com) and an organization name (yourbasic).

By convention, the package name is the same as the last element of the import path:

fmt
rand
graph
References to other packages’ definitions must always be prefixed with their package names, and only the capitalized names from other packages are accessible.

package main

import (
    "fmt"
    "math/rand"

    "github.com/yourbasic/graph"
)

func main() {
    n := rand.Intn(100)
    g := graph.New(n)
    fmt.Println(g)
}
Declare a package
Every Go source file starts with a package declaration, which contains only the package name.

For example, the file src/math/rand/exp.go, which is part of the implementation of the math/rand package, contains the following code.

package rand
  
import "math"
  
const re = 7.69711747013104972
…
You don’t need to worry about package name collisions, only the import path of a package must be unique. How to Write Go Code shows how to organize your code and its packages in a file structure.

Package name conflicts
You can customize the name under which you refer to an imported package.

package main

import (
    csprng "crypto/rand"
    prng "math/rand"

    "fmt"
)

func main() {
    n := prng.Int() // pseudorandom number
    b := make([]byte, 8)
    csprng.Read(b) // cryptographically secure pseudorandom number
    fmt.Println(n, b)
}
Dot imports
If a period . appears instead of a name in an import statement, all the package’s exported identifiers can be accessed without a qualifier.

package main

import (
    "fmt"
    . "math"
)

func main() {
    fmt.Println(Sin(Pi/2)*Sin(Pi/2) + Cos(Pi)/2) // 0.5
}
Dot imports can make programs hard to read and generally should be avoided.

Package download
The go get command downloads packages named by import paths, along with their dependencies, and then installs the packages.

$ go get github.com/yourbasic/graph
The import path corresponds to the repository hosting the code. This reduces the likelihood of future name collisions.

The Go Wiki and Awesome Go provide lists of high-quality Go packages and resources.

For more information on using remote repositories with the go tool, see Command go: Remote import paths.

Package documentation
The GoDoc web site hosts documentation for all public Go packages on Bitbucket, GitHub, Google Project Hosting and Launchpad:

https://godoc.org/fmt
https://godoc.org/math/rand
https://godoc.org/github.com/yourbasic/graph
The godoc command extracts and generates documentation for all locally installed Go programs. The following command starts a web server that presents the documentation at http://localhost:6060/.

$ godoc -http=:6060 &
Package documentation
For more on how to access and create documentation, see the Package documentation article.