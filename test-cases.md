# Test Cases

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
