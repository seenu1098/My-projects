 A java thread can lie only in one of the shown states at any point of time

![[IMG_20220926_123617.jpg]]


New :
  A new thread begins its life cycle in this state and remains here until the program starts the thread. It is also known as born thread

Runnable
   Once a newly born thread starts,the thread comes under runnable state. A thread stays in this state is until it is executing it's task

Running 
   In this state a thread starts executing by entering run() method and the yield() method can send them to go back to the runnable state.

Waiting
   A thread enters this state when it is temporarily in an inactive state i.e., it is still alive but is not eligible to run. It can be in waiting , sleeping or blocked state.

Terminated
   A runnable thread enters the terminated state when it completes its task or otherwise terminates.