---
layout: post
title: "Mastering Mutual Exclusion in Java"
date: 2026-07-14
categories: [java, concurrency]
tags: [concurrency, synchronized, locks]
excerpt: "A guided tour of every mutual exclusion mechanism in Java — what problem each one solves and when to reach for it. First post in a deep-dive series."
---

Every multithreaded program is eventually going to hit the problem of two concurrent threads trying to read, write 
or modify an object stored in a shared memory.

Java offers many tools to deal with this problem, one better than the other, each coming with its own set of pros
and cons.

This article is going to introduce the problem, give an overview of the available solutions (always with examples!)
and introduce you, my dear reader, to the world of concurrent programming in Java.

## Understanding the problem





====================================

---
layout: post
title: "Mastering Mutual Exclusion in Java"
date: 2026-07-14
categories: [java, concurrency]
tags: [concurrency, synchronized, locks, jvm]
excerpt: "A guided tour of every mutual exclusion mechanism in Java — what problem each one solves and when to reach for it. First post in a deep-dive series."
---

Every concurrent program eventually runs into the same wall: two threads touching the same piece of state at the same time. Java gives you a surprising number of tools to stop that from going wrong — `synchronized`, `ReentrantLock`, read-write locks, atomics, and more. The trouble is that most tutorials introduce exactly one of them (`synchronized`) and stop, leaving you to discover the rest by accident, usually during a production incident.

This post is a map of the whole territory. It stays deliberately mid-level: no monitor internals, no AQS queue mechanics, no CAS retry loops — just what each mechanism does, what it costs you, and when it's the right call. Each section links to a dedicated deep-dive chapter where we'll open the hood.

## What mutual exclusion actually protects against

Before picking a tool, it helps to separate three problems that get lumped together as "thread safety":

- **Race condition** — the outcome of your program depends on the timing of thread execution, when it shouldn't.
- **Lost update** — two threads read the same value, both compute an update, and one overwrite silently wins, discarding the other.
- **Visibility issue** — one thread writes a value, and another thread never sees the write because of caching or reordering, even without any interleaving problem.

Mutual exclusion — letting only one thread touch a piece of state at a time — solves the first two directly, and solves the third as a side effect (entering and leaving a lock also creates the memory barriers needed for visibility).

Here's the classic lost-update example:

```java
public class Counter {
    private int count = 0;

    public void increment() {
        count++; // NOT atomic: read, add 1, write — three separate steps
    }

    public int get() {
        return count;
    }
}
```

Run two threads calling `increment()` a million times each, and `get()` will almost never return 2,000,000. `count++` decompiles to a read, an add, and a write — and another thread can slip in between any of those steps.

Now let's fix it, one mechanism at a time.

## `synchronized` — the default tool

`synchronized` is Java's built-in mutual exclusion mechanism: every object carries an implicit lock (its *monitor*), and only one thread can hold it at a time.

```java
public class Counter {
    private int count = 0;

    public synchronized void increment() {
        count++;
    }

    public synchronized int get() {
        return count;
    }
}
```

Or, locking on an explicit object instead of `this`, which is usually the better habit since it keeps the lock private to your class:

```java
public class Counter {
    private final Object lock = new Object();
    private int count = 0;

    public void increment() {
        synchronized (lock) {
            count++;
        }
    }

    public int get() {
        synchronized (lock) {
            return count;
        }
    }
}
```

**What it gives you:** correctness, simplicity, and — since JDK 6 — genuinely good performance for uncontended or lightly contended locks. It's also impossible to forget to release: the lock is released automatically when the block exits, even via an exception.

**Its one real limitation:** it's inflexible. You can't try to acquire the lock without blocking, you can't time out, you can't interrupt a thread that's waiting on it, and you can't ask for a "fair" ordering among waiting threads. When you need any of that, you reach for `ReentrantLock`.

<!-- → Deep dive: "synchronized Internals: Monitors, Mark Words, and Lock Inflation" -->

## `ReentrantLock` — when you need more control

`ReentrantLock`, from `java.util.concurrent.locks`, does the same job as `synchronized` but as an ordinary object instead of a language keyword — which means it can expose capabilities `synchronized` structurally can't.

```java
import java.util.concurrent.locks.ReentrantLock;

public class Counter {
    private final ReentrantLock lock = new ReentrantLock();
    private int count = 0;

    public void increment() {
        lock.lock();
        try {
            count++;
        } finally {
            lock.unlock(); // never forget this — it won't happen automatically
        }
    }

    public int get() {
        lock.lock();
        try {
            return count;
        } finally {
            lock.unlock();
        }
    }
}
```

Notice the trade-off immediately: you're now responsible for calling `unlock()`, and it must be in a `finally` block. That's the price for the extra power:

```java
if (lock.tryLock()) {
    try {
        // got the lock without blocking — do the work
    } finally {
        lock.unlock();
    }
} else {
    // someone else has it — do something else instead of waiting
}
```

You can also time out (`tryLock(1, TimeUnit.SECONDS)`), respond to interruption (`lockInterruptibly()`), and request fairness (`new ReentrantLock(true)`) so threads acquire the lock roughly in the order they asked for it — useful for avoiding starvation, at some throughput cost.

<!-- → Deep dive: "ReentrantLock and AQS Under the Hood" -->

## Read-write locks — when reads dominate

Both `synchronized` and `ReentrantLock` are exclusive: even two threads that only want to *read* shared state have to take turns. For workloads where reads vastly outnumber writes — a configuration cache, a routing table — that's wasted serialization.

`ReentrantReadWriteLock` splits the lock in two: any number of readers can hold the read lock simultaneously, but a writer needs exclusive access.

```java
import java.util.concurrent.locks.ReentrantReadWriteLock;

public class Cache {
    private final ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();
    private String value = "initial";

    public String read() {
        rwLock.readLock().lock();
        try {
            return value;
        } finally {
            rwLock.readLock().unlock();
        }
    }

    public void write(String newValue) {
        rwLock.writeLock().lock();
        try {
            value = newValue;
        } finally {
            rwLock.writeLock().unlock();
        }
    }
}
```

`StampedLock` (Java 8+) goes further with an *optimistic read* mode: readers don't take a lock at all, they just validate afterward that nothing changed underneath them, and retry with a real lock only if it did. It's faster under heavy read contention but noticeably trickier to use correctly — no reentrancy, and you have to remember the validation step.

We'll benchmark all three against plain `synchronized` in the dedicated chapter — the read-heavy numbers are the ones worth seeing for yourself.

<!-- → Deep dive: "ReentrantReadWriteLock vs StampedLock: Optimistic Reads Explained" -->

## Lock-free alternatives — when locks are overkill

Sometimes the shared state is small enough — a single counter, a single reference — that taking a full lock is more overhead than the operation itself. Java's `java.util.concurrent.atomic` package gives you compare-and-swap–based updates with no locking at all:

```java
import java.util.concurrent.atomic.AtomicInteger;

public class Counter {
    private final AtomicInteger count = new AtomicInteger(0);

    public void increment() {
        count.incrementAndGet();
    }

    public int get() {
        return count.get();
    }
}
```

This looks like a strict upgrade over `synchronized`, and under low-to-moderate contention it is — no thread ever blocks. But it's not free of cost: under *heavy* contention, many threads retrying a compare-and-swap loop against the same memory location can actually perform worse than a lock, because every failed attempt is wasted work plus a fresh cache-line bounce. We'll measure exactly where that crossover happens in the lock-free chapter — it's one of the more surprising results in this whole series.

For the specific, very common case of a hot counter under high write contention, `LongAdder` is usually the right answer — it spreads updates across internal cells to reduce contention, at the cost of a slightly more expensive read:

```java
import java.util.concurrent.atomic.LongAdder;

public class Counter {
    private final LongAdder count = new LongAdder();

    public void increment() {
        count.increment();
    }

    public long get() {
        return count.sum();
    }
}
```

<!-- → Deep dive: "Lock-Free Programming in Java: CAS, Atomics, and When They Lose" -->

## Virtual threads and an old rule that changed

Virtual threads (Project Loom, finalized in JDK 21) run many logical threads on top of a small pool of OS "carrier" threads. For a while, this interacted badly with `synchronized`: holding a `synchronized` block would *pin* the virtual thread to its carrier, blocking that carrier entirely instead of letting it serve other virtual threads — defeating much of the point of using virtual threads in the first place.

As of JDK 24, this pinning behavior was largely fixed at the JVM level, so `synchronized` is safe to use with virtual threads in most cases again. If you're on an earlier JDK, or writing code that has to run on one, `ReentrantLock` avoids the issue entirely, since it was never affected. Worth double-checking the exact JDK version behavior before you rely on either claim in production — this is an area that moved fast.

This is the first post in a series on mutual exclusion in Java. Each mechanism above gets its own deep-dive with JMH benchmarks and internals — links will go live as each chapter is published.