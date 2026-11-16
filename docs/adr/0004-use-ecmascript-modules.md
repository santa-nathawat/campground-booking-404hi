# ADR-0004: Use ECMAScript modules

Status: Accepted

## Context

Assignment 7 uses CommonJS. The team prefers standard `import` and `export` syntax.

## Decision

Use ECMAScript modules in backend source files.

## Consequences

Adapt existing `require` and `module.exports` code.
TypeScript, runtime, package configuration, and tests must use compatible module settings.
