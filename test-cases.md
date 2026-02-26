# Test Cases

Manual playground snippets for quick copy / paste testing in a VS Code Extension Development Host.

### Adding `cn`

```svelte
<!-- before -->
<span class="font-bold"/>

<!-- after -->
<span class={cn("font-bold", <<cursor here>>)}/>
```

### Refactoring back to string literal

```svelte
<!-- before -->
<span class={cn("font-bold")}/>

<!-- after -->
<span class="font-bold"/>
```

## Handling variables

### Wrapping a variable

```svelte
<!-- before -->
<div class={fooClasses}>

<!-- after -->
<div class={cn(fooClasses, <<cursor here>>)}>
```

### Refactoring back to plain variable

```svelte
<!-- before -->
<div class={cn(fooClasses)}>

<!-- after -->
<div class={fooClasses}>
```

## Matching all `*class*` attributes (optional setting)

Enable: `cnHelper.matchAllContainingClass = true`

### Wrap on custom class-like attribute

```svelte
<!-- before -->
<MyComponent fooClass="p-4" />

<!-- after -->
<MyComponent fooClass={cn("p-4", <<cursor here>>)} />
```

### Unwrap on custom class-like attribute

```svelte
<!-- before -->
<MyComponent classFoo={cn(fooClasses)} />

<!-- after -->
<MyComponent classFoo={fooClasses} />
```
