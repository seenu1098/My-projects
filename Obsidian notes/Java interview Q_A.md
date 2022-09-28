Why java doesn't support multiple inheritance

      The reason behind this is to prevent the ambiguity
      Consider a case where class B extends class A and class C and both class A and class C have the same method display()
      Now java compiler cannot decide , which display method it should inherit. To prevent such situation, multiple inheritances is not allowed in java