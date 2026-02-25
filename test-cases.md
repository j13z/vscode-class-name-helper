# Test Cases

Manual playground snippets for quick copy / paste testing in a VS Code Extension Development Host.

### Adding `cn`

```svelte
<!-- before -->
<span class="font-bold"/>

<!-- after -->
<span class={cn("font-bold", "<<cursor here>>")}/>
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
<div class={cn(fooClasses, "<<cursor here>>")}>
```

### Refactoring back to plain variable

```svelte
<!-- before -->
<div class={cn(fooClasses)}>

<!-- after -->
<div class={fooClasses}>
```
