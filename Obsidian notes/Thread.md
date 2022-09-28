Thread is a lightweight sub process

It is the smallest independent unit of a program

Contains a seperate path of execution

Every java program contains atleast one thread

A thread is created and controlled by java.lang.thread class

Thread always execute the jobs in a sequence

Till one job is not finished,below written jobs are waiting and are not executed(which means other jobs wil be in blocking state)

Jvm can perform the time slicing,so that it can give some time to the main thread, some time to the worker thread or child thread

Java Main Thread :

     Main thread is the most important thread of a java program
     
     It is executed whenever a java program starts
     
     Every program must contain this thread for its execution to take place
     
     Java Main thread is needed because of the following reasons
         1. From this other "child" threads are spawned
         2. It must be the last thread to finish execution i.e., when the main thread stops program terminates


Thread methods:
    Creating multiple threads
       Thread.start()
   Joining the threads
   Inter thread communication
       Wait()
       Notify()
   Daemon thread
       If we mention the method as daemon thread it will execute after the main thread

  







     