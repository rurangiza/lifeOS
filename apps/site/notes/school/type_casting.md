# Type-casting in C++
What is type-casting?
What is a type?
Why/when is it useful?
How is it handled in other languages?
What are the best practices?
What should I avoid?

keywords: scalar, primitive, 

## Classic
1. conversion
2. reinterpretations
3. changement de type-qualifier
4. downcast
5. upcast

## Specific to C++
1. static cast
2. dynamic cast

### Static cast
```C++
int main()
{
    
    int a = 42;                      // Reference value

    double b = a;                    // Implicit promotion -> OK
    int    c = b;                    // Implicit demotion -> Hell, no!
    int    d = static_cast<int>(b);  // Explicit demotion -> Ok, I obey
    
    return 0;
}

```

### Dynamic cast
It's the only cast that happens in runtime, after compilation. Meaning cast can fail during execution. 