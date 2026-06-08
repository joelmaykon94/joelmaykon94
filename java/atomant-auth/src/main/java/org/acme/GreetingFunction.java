package org.acme;

import io.quarkus.funqy.Funq;

public class GreetingFunction {

  public static class NameInput {
    private String name;

    public String getName() {
      return name;
    }

    public void setName(String name) {
      this.name = name;
    }
  }

  @Funq("hello-funq")
  public String greet(NameInput input) {
    return "Hello " + input.getName();
  }
}
