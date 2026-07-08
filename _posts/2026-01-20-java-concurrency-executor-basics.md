---
title: "Java Concurrency Basics: Taming ExecutorService"
date: 2026-01-20 09:00:00 +0100
tags: [java, concurrency]
excerpt: "A quick tour of ExecutorService, why you should almost never call `new Thread()` directly, and how virtual threads change the calculus."
image: /assets/images/example.png
---

Manually spinning up `Thread` objects doesn't scale — you lose control over
pool size, backpressure, and shutdown. `ExecutorService` fixes that by giving
you a managed pool of worker threads.

## A basic fixed thread pool

```java
ExecutorService executor = Executors.newFixedThreadPool(4);

List<Future<Integer>> results = new ArrayList<>();

for (int i = 0; i < 10; i++) {
    int taskId = i;
    results.add(executor.submit(() -> {
        Thread.sleep(100);
        return taskId * taskId;
    }));
}

for (Future<Integer> result : results) {
    System.out.println(result.get());
}

executor.shutdown();
```

Four threads, ten tasks — the pool queues the rest and reuses threads as they
free up. Simple, but you're on the hook for sizing the pool correctly and
remembering to call `shutdown()`.

## Structured shutdown the right way

```java
public void shutdownGracefully(ExecutorService executor) {
    executor.shutdown();
    try {
        if (!executor.awaitTermination(30, TimeUnit.SECONDS)) {
            executor.shutdownNow();
        }
    } catch (InterruptedException e) {
        executor.shutdownNow();
        Thread.currentThread().interrupt();
    }
}
```

## Enter virtual threads (Java 21+)

For I/O-bound workloads — think calling downstream services, hitting a
database, or consuming from Kafka — virtual threads let you use a
thread-per-task style without exhausting OS threads:

```java
try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
    List<Future<String>> futures = orderIds.stream()
        .map(id -> executor.submit(() -> fetchOrderStatus(id)))
        .toList();

    for (Future<String> future : futures) {
        System.out.println(future.get());
    }
}
```

Each task gets its own cheap virtual thread instead of competing for a small
fixed pool, so blocking calls stop being a scarce resource you have to
carefully budget. The mental model stays the same as a normal
`ExecutorService` — you just stop worrying about pool size for I/O-bound work.

That's the short version: prefer `ExecutorService` over raw threads, shut it
down deliberately, and reach for virtual threads when your bottleneck is
waiting on I/O rather than burning CPU.
