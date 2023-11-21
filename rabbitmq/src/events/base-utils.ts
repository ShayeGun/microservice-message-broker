export enum Keys {
    Default = "",
    TicketCreated = "ticket.create",
    TicketUpdated = "ticket.update",
    OrderCreated = "order.create",
    OrderCancelled = "order.cancel"
}

export enum ExchangeTypes {
    FANOUT = "fanout",
    DIRECT = "direct",
    TOPIC = "topic",
    HEADERS = "headers",
    MATCH = "match"
}

export enum Exchanges {
    Default = "E1",
    Ticket = "ticket",
}

export enum Queues {
    Default = "",
    Ticket = "ticket",
    Order = "order"
}

