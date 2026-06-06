# Desbravando OOP com Java

O objetivo é evoluir uma aplicação java dos principais recursos até os conceitos mais avançados.

## Variáveis e Tipos Primitivos

> [!IMPORTANT]
>  
> Se **não atribuir** nenhum valor o código não compila

```java
public class Main {
    public static void main(String[] args) {
        double livroJava8;
        livroJava8 = 10.5;
        System.out.println(livroJava8);
    }
}

```

### Tipos primitivos

| Tipo | Palavra-chave | Tamanho | Valores Suportados | Valor Padrão | Exemplo de Declaração |
|------|--------------|---------|-------------------|--------------|----------------------|
| Byte | `byte` | 8 bits | -128 a 127 | 0 | `byte idade = 25;` |
| Short | `short` | 16 bits | -32.768 a 32.767 | 0 | `short populacao = 15000;` |
| Inteiro | `int` | 32 bits | -2.147.483.648 a 2.147.483.647 | 0 | `int numero = 1000;` |
| Long | `long` | 64 bits | -9.223.372.036.854.775.808 a 9.223.372.036.854.775.807 | 0L | `long distancia = 123456789L;` |
| Float | `float` | 32 bits | ±3.40282347E+38F (6-7 dígitos significativos) | 0.0f | `float preco = 19.99f;` |
| Double | `double` | 64 bits | ±1.79769313486231570E+308 (15 dígitos significativos) | 0.0d | `double salario = 2500.50;` |
| Char | `char` | 16 bits | 0 a 65.535 (caracteres Unicode) | '\u0000' | `char letra = 'A';` |
| Boolean | `boolean` | 1 bit (teórico) | `true` ou `false` | `false` | `boolean ativo = true;` |


> [!TIP]  
>
> - **Long**: deve terminar com `L` ou `l` (recomenda-se `L` maiúsculo)
> - **Float**: deve terminar com `F` ou `f`
> - **Double**: pode terminar com `D` ou `d`, mas é opcional
> - **Char**: usa aspas simples `''` e pode receber números Unicode como `'\u0041'` (letra 'A')
> - Os tipos primitivos não são objetos e são armazenados diretamente na pilha (stack) de memória

### Atribuição por valor e por referência

Números (`int`, `double`, etc.) são armazenados **por valor**. Cada variável tem sua própria cópia independente.

```java
int a = 10;
int b = a;  // b recebe uma CÓPIA do valor de a

b = 20;     // altera apenas b

System.out.println(a); // 10 (não mudou)
System.out.println(b); // 20
```
Strings e objetos são armazenados por referência. Variáveis apontam para o mesmo objeto na memória.

```java
String nome1 = "João";
String nome2 = nome1;  // nome2 aponta para o MESMO objeto

nome1 = "Maria";       // nome1 aponta para novo objeto

System.out.println(nome1); // Maria
System.out.println(nome2); // João (aponta para o original)
```

### Casting

#### String → Número
```java
String texto = "42";
int numero = Integer.parseInt(texto);     // "42" → 42
double decimal = Double.parseDouble("3.14"); // "3.14" → 3.14
```

#### Número → String

```java
int idade = 25;
String texto = "" + idade;              // 25 → "25"
String texto2 = String.valueOf(99.9);   // 99.9 → "99.9"
```

#### Exemplo

```java
String valor1 = "10";
String valor2 = "20";

int soma = Integer.parseInt(valor1) + Integer.parseInt(valor2);

System.out.println(soma);        // 30
System.out.println("Total: " + soma); // "Total: 30"
```


## Construtores em Java

### O que é?
Construtor é um método especial que inicializa objetos quando são criados.

#### Exemplo com Livro e ISBN

```java
public class Livro {
    String titulo;
    String isbn;
    
    // Construtor
    public Livro() {
        isbn = "978-85-0000-000-0";  // valor padrão
    }
    
    public static void main(String[] args) {
        Livro livro = new Livro();  // construtor é chamado aqui
        System.out.println(livro.isbn);  // 978-85-0000-000-0
    }
}
```

```java
public Livro(String titulo) {
    this.titulo = titulo;
    this.isbn = "000-00-0000-00-0";  // ISBN padrão
}
```

## Encadeamento de Construtores (Constructor Chaining)

### O Problema

```java
public class Livro {
    String titulo;
    String isbn;
    String autor;
    
    // Construtor sem argumentos
    public Livro() {
        // ISBN NÃO é inicializado aqui!
    }
    
    // Construtor com autor
    public Livro(String autor) {
        this.autor = autor;
        // ISBN também NÃO é inicializado!
    }
}
```

### A Solução (this())
Use this() para delegar a outro construtor:

```java
public class Livro {
    String titulo;
    String isbn;
    String autor;
    
    // Construtor principal (com todos os parâmetros)
    public Livro(String titulo, String autor, String isbn) {
        this.titulo = titulo;
        this.autor = autor;
        this.isbn = isbn;
    }
    
    // Construtor com ISBN padrão
    public Livro(String titulo, String autor) {
        this(titulo, autor, "978-85-0000-000-0");  // delega para o construtor principal
    }
    
    // Construtor sem argumentos
    public Livro() {
        this("Sem título", "Autor desconhecido");  // delega para o construtor de 2 params
    }
    
    public static void main(String[] args) {
        Livro livro1 = new Livro();                                      // ISBN padrão
        Livro livro2 = new Livro("Java Moderno", "João");                // ISBN padrão
        Livro livro3 = new Livro("POO", "Maria", "978-85-12345-67-8");   // ISBN específico
        
        System.out.println(livro2.isbn);  // 978-85-0000-000-0
        System.out.println(livro3.isbn);  // 978-85-12345-67-8
    }
}
```

>[!IMPORTANT]
>
>**É uma prática moderna e recomendada!** É usada desde o Java 1.0 e continua sendo a forma correta de encadear construtores.


## Encapsulamento em Java - Exemplo Simples

### O que é?
Esconder os detalhes internos de uma classe e controlar o acesso aos atributos.

### Exemplo com Livro e ISBN

```java
public class Livro {
    // Atributos privados (ninguém acessa diretamente)
    private String titulo;
    private String isbn;
    private double preco;
    
    // Construtor
    public Livro(String titulo, String isbn, double preco) {
        this.titulo = titulo;
        this.isbn = isbn;
        this.preco = preco;
    }
    
    // Métodos públicos getters (ler)
    public String getTitulo() {
        return titulo;
    }
    
    public String getIsbn() {
        return isbn;
    }
    
    public double getPreco() {
        return preco;
    }
    
    // Métodos públicos setters (modificar com validação)
    public void setPreco(double preco) {
        if (preco > 0) {  // validação!
            this.preco = preco;
        } else {
            System.out.println("Preço inválido!");
        }
    }
    
    public void setIsbn(String isbn) {
        if (isbn != null && isbn.length() >= 10) {
            this.isbn = isbn;
        } else {
            System.out.println("ISBN inválido!");
        }
    }
}
```

### Uso da classe
```java
public class Main {
    public static void main(String[] args) {
        Livro livro = new Livro("Java POO", "978-85-0000-000-0", 49.90);
        
        // Acesso correto via getters
        System.out.println(livro.getTitulo());  // Java POO
        
        // Modificação via setter (com validação)
        livro.setPreco(59.90);     // ✅ funciona
        livro.setPreco(-10.00);    // ❌ "Preço inválido!"
        
        // Acesso direto NÃO é permitido!
        // livro.preco = 100;  // ERRO de compilação!
    }
}
```

>[!IMPORTANT]
> Atributos: private  ← ninguém vê
> Métodos:   public   ← interface de uso
> Getters  → ler valores
> Setters  → alterar com validação

## Encapsulamento - Alertas Importantes

> [!WARNING]
> **NUNCA exponha referências diretas de arrays ou coleções!**
>
> ```java
> public class Livro {
>     private String[] autores;
>     
>     // ❌ PERIGOSO - quebra o encapsulamento!
>     public String[] getAutores() {
>         return autores;  // quem chama pode modificar o array original!
>     }
> }
> 
> // O problema na prática:
> Livro livro = new Livro();
> String[] autores = livro.getAutores();
> autores[0] = "Hacker";  // modificou o livro sem passar pelo setter!
> ```
>
> **Solução correta:**
> ```java
> public String[] getAutores() {
>     return autores.clone();  // retorna cópia defensiva
> }
> ```

> [!CAUTION]
> **Cuidado com Getters/Setters Automáticos e Objetos Mutáveis!**
>
> ```java
> public class Livro {
>     private Date dataPublicacao;  // Date é mutável!
>     private double preco;
>     
>     // ❌ CAUTION - Retorna referência para objeto mutável
>     public Date getDataPublicacao() {
>         return dataPublicacao;  // quem recebe pode alterar sua data!
>     }
>     
>     // ❌ CAUTION - Setter sem validação
>     public void setPreco(double preco) {
>         this.preco = preco;  // aceita preço negativo! 😱
>     }
>     
>     // ✅ CORRETO - Cópia defensiva
>     public Date getDataPublicacao() {
>         return new Date(dataPublicacao.getTime());
>     }
>     
>     // ✅ CORRETO - Com validação
>     public void setPreco(double preco) {
>         if (preco <= 0) {
>             throw new IllegalArgumentException("Preço deve ser positivo!");
>         }
>         this.preco = preco;
>     }
> }
> 
> // O perigo na prática:
> Livro livro = new Livro();
> Date data = livro.getDataPublicacao();
> data.setYear(2000);  // MODIFICOU o livro sem controle! 💀
> ```

#### Resumo dos Perigos

| Ação | Consequência | Severidade |
|------|--------------|------------|
| Expor array diretamente | Dados corrompidos externamente | 🔴 Alta |
| Expor Date sem cópia | Estado interno alterado | 🔴 Alta |
| Setter sem validação | Dados inválidos (ex: preço negativo) | 🟡 Média |
| Getter/Setter para tudo | Encapsulamento quebrado | 🟡 Média |


## Herança e Polimorfismo em Java - Resumo

### Herança (extends)

Uma classe pode herdar atributos e métodos de outra classe usando `extends`.

```java
public class Livro {
    protected String titulo;
    protected String isbn;
    protected double preco;
    
    public Livro(String titulo, String isbn, double preco) {
        this.titulo = titulo;
        this.isbn = isbn;
        this.preco = preco;
    }
    
    public void aplicarDesconto(double percentual) {
        this.preco -= this.preco * percentual / 100;
    }
}

// Ebook HERDA de Livro
public class Ebook extends Livro {
    private String formato;  // PDF, EPUB, etc.
    
    public Ebook(String titulo, String isbn, double preco, String formato) {
        super(titulo, isbn, preco);  // 👈 delega para o construtor da superclasse
        this.formato = formato;
    }
}
```

### Delegando com super

O `super` chama o construtor ou método da classe pai.

```java
public class Ebook extends Livro {
    private double tamanhoArquivo;
    
    public Ebook(String titulo, String isbn, double preco, double tamanhoArquivo) {
        super(titulo, isbn, preco);  // construtor da classe Livro
        this.tamanhoArquivo = tamanhoArquivo;
    }
    
    @Override
    public void aplicarDesconto(double percentual) {
        if (percentual <= 30) {  // regra extra: ebook tem limite de 30%
            super.aplicarDesconto(percentual);  // 👈 delega para o método da superclasse
        }
    }
}
```

### this vs super - Cuidado! ⚠️

```java
public class Ebook extends Livro {
    @Override
    public void aplicarDesconto(double percentual) {
        if (percentual <= 30) {
            // ✅ CERTO - chama método da superclasse
            super.aplicarDesconto(percentual);
            
            // ❌ PERIGO - chamaria ele mesmo! (looping infinito)
            // this.aplicarDesconto(percentual);
        }
    }
}
```

### @Override (Anotação)

Marca que um método está sendo reescrito (sobrescrito).

```java
@Override  // 👈 opcional, mas recomendado!
public void aplicarDesconto(double percentual) {
    // nova implementação
}
```

**Vantagem:** O compilador valida se o método realmente existe na superclasse.

### Polimorfismo (é um)

Uma variável do tipo `Livro` pode referenciar um `Ebook`.

```java
// ✅ Polimorfismo em ação
Livro livro1 = new Livro("Java Básico", "123", 49.90);
Livro livro2 = new Ebook("Java Avançado", "456", 79.90, "PDF");

// O objeto continua sendo um Ebook!
// Apenas estamos referenciando como Livro (abstração)

livro2.aplicarDesconto(20);  // executa método do Ebook (se sobrescrito)
```

**Importante:** Não estamos transformando o objeto! Um `Ebook` sempre será um `Ebook`. Só estamos tratando ele de forma mais genérica.

### Herança Múltipla?

**Java NÃO permite herança múltipla!**

```java
// ❌ ISSO NÃO FUNCIONA EM JAVA!
// public class Ebook extends Livro, AudioBook { }

// ✅ Pode herdar de uma classe que herda de outra
// Livro → Ebook → EbookInterativo (cadeia)
```

### Herança ou Composição?

> [!WARNING]
> **Prefira composição ao invés de herança sempre que possível!**
>
> Herança aumenta o acoplamento e compromete o encapsulamento.

```java
// Composição (recomendado)
public class Ebook {
    private Livro livro;        // tem um Livro
    private String formato;
    
    public String getTitulo() {
        return livro.getTitulo();  // delega
    }
}
```

## Por que criar novas classes?

| Abordagem | Problema |
|-----------|----------|
| Uma classe `Livro` com tudo | Classe gigante, cheia de `if` e difícil manter |
| Classes específicas (`Ebook`, `LivroFisico`, `AudioBook`) | Código organizado, encapsulado e fácil dar manutenção |

✅ **Java é fortemente tipado! Crie classes para representar cada tipo do seu domínio!**

### Resumo Rápido

| Conceito | Palavra | Exemplo |
|----------|---------|---------|
| Herança | `extends` | `class Ebook extends Livro` |
| Chamar construtor pai | `super()` | `super(titulo, isbn, preco)` |
| Chamar método pai | `super.metodo()` | `super.aplicarDesconto(10)` |
| Sobrescrita | `@Override` | Marcar método reescrito |
| Polimorfismo | `Livro x = new Ebook()` | Referência mais genérica |

### Regra de Ouro
> [!Important]
> **"A Favor do uso da composição em vez de herança"** - Gang of Four
>
> Herança é poderosa, mas use com consciência. Classes pequenas e específicas são melhores que uma classe gigante!
