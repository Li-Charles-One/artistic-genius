// Command artistic-genius is a config- and plugin-driven coding agent CLI.
package main

import (
	"os"

	"artistic-genius/internal/cli"

	// Blank imports wire compile-time built-ins into their registries.
	_ "artistic-genius/internal/provider/anthropic"
	_ "artistic-genius/internal/provider/openai"
	_ "artistic-genius/internal/tool/builtin"
)

// version is injected at build time via -ldflags "-X main.version=...".
var version = "dev"

func main() {
	os.Exit(cli.Run(os.Args[1:], version))
}
