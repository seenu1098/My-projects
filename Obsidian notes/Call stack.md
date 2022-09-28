What is a call stack frame?  

A call stack is composed of 1 or many several stack frames. Each stack frame corresponds to a call to a function or procedure which has not yet terminated with a return. To use a stack frame, a thread keeps two pointers, one is called the Stack Pointer (SP), and the other is called the Frame Pointer (FP).

A call stack is used for several related purposes, but the main reason for having one is to keep track of the point to which each active subroutine should return control when it finishes executing.  
  
The call stack works based on the LIFO principle i.e., last-in-first-out.  
  
The default value for the stack size in the JVM is 1024K. Therefore, you must increase the stack size for the JVM to 4M depending on the recursive logic defined in the workflow