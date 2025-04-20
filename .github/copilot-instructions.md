# Commit Rules

This repository follows the rules of [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

Use the following format for your commit messages:

```
<type>[optional scope]: <description>

[optional body]

[optional footnote(s)]
```

## Allowed types

- feat: A new feature
- fix: A bug fix
- docs: Documentation changes
- style: Changes that do not affect the meaning of the code (whitespace, formatting, missing semicolons, etc.)
- refactor: Code changes that neither fix a bug nor add a feature
- perf: Changes that improve performance
- test: Adding or correcting tests
- build: Changes that affect the build system or external dependencies
- ci: Changes to CI configuration files and scripts
- chore: Other changes that do not modify src or test files
- revert: Revert a previous commit

## Scope

The scope must match the name of the folder modified inside `./src/<scope>`. For example, if you modify files in `./src/cli/`, the commit message should be:

```
<type>(cli): <description>
```

## Example

```
feat(cli): add --verbose option to run command

Allows users to see more details during execution.

BREAKING CHANGE: the --debug option has been replaced by --verbose
```

- Use the imperative mood in the description ("add" instead of "added" or "adds").
- Limit the description to 72 characters.
- If the commit introduces a breaking change, add a footnote with `BREAKING CHANGE:`.
- If the commit closes an issue, reference the number in the body or footnote.
