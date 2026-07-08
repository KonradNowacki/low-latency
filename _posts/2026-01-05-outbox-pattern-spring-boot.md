---
title: "Implementing the Outbox Pattern with Spring Boot and Kafka"
date: 2026-01-05 09:00:00 +0100
tags: [java, spring-boot, kafka, microservices]
excerpt: "A minimal example of how to publish events reliably from a Spring Boot service using the transactional outbox pattern."
---

When a service needs to update its database **and** publish an event about that
update, you can't just do both separately — a crash between the two leaves you
in an inconsistent state. The **outbox pattern** solves this by writing the
event to an `outbox` table in the *same* database transaction as the business
change, then relaying it to Kafka asynchronously (often via Debezium CDC).

## The entity

{% highlight java linenos %}
@Entity
@Table(name = "outbox_event")
public class OutboxEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String aggregateType;
    private String aggregateId;
    private String eventType;

    @Lob
    private String payload;

    private Instant createdAt = Instant.now();

    // getters and setters omitted
}
{% endhighlight %}

## Writing to the outbox in the same transaction

{% highlight java linenos %}
@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OutboxEventRepository outboxRepository;
    private final ObjectMapper objectMapper;

    public OrderService(OrderRepository orderRepository,
                         OutboxEventRepository outboxRepository,
                         ObjectMapper objectMapper) {
        this.orderRepository = orderRepository;
        this.outboxRepository = outboxRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public Order createOrder(CreateOrderCommand command) {
        Order order = Order.from(command);
        orderRepository.save(order);

        OrderCreatedEvent event = new OrderCreatedEvent(order.getId(), order.getTotal());
        outboxRepository.save(toOutboxEvent(order, event));

        return order;
    }

    private OutboxEvent toOutboxEvent(Order order, OrderCreatedEvent event) {
        try {
            OutboxEvent outboxEvent = new OutboxEvent();
            outboxEvent.setAggregateType("Order");
            outboxEvent.setAggregateId(order.getId().toString());
            outboxEvent.setEventType("OrderCreated");
            outboxEvent.setPayload(objectMapper.writeValueAsString(event));
            return outboxEvent;
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize event", e);
        }
    }
}
{% endhighlight %}

Because `orderRepository.save` and `outboxRepository.save` happen inside the
same `@Transactional` boundary, they either both commit or both roll back.
Debezium then tails the outbox table's write-ahead log and publishes each row
to Kafka — no dual-write problem, no distributed transaction needed.

## Debezium connector config

{% highlight json linenos %}
{
"name": "order-outbox-connector",
"config": {
"connector.class": "io.debezium.connector.postgresql.PostgresConnector",
"database.hostname": "postgres",
"database.dbname": "orders",
"table.include.list": "public.outbox_event",
"transforms": "outbox",
"transforms.outbox.type": "io.debezium.transforms.outbox.EventRouter",
"transforms.outbox.route.by.field": "aggregateType"
}
}
{% endhighlight %}

That's the whole pattern in miniature: one table, one transaction, one CDC
connector — and your downstream consumers get a reliable stream of domain
events without ever touching a two-phase commit.
