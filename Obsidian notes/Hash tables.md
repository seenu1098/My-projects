Hash table is an address space

If we store key value map
{"nails":1000}

Hash method generates an index, based on that index it will store on the hash table

For example

For above key value pair if its generate index as 2. It will store that value in index 2.

It is an one way and deterministic

One way means by the key "nails" you can get index of that key value pair by hash method, but we can't get the key "nails" by index, so it's say as one way

Deterministic means every time we run the key "nails" through the hash method it will generate the same address which means index


Collision

Putting the key value pair in same address even if it's have previous value in that address

Then it is called seperate chaining 


Putting the key value pair in different spot until you spot an empty slot then it known as linear probing(open addressing)

Seperate chaining can be achieved by using linked list

We could have fewer collisins if we have prime number size of address spaces


Hashtable itself is an o(1)

Get and set always 0(1)

