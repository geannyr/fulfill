# Fulfill

Fulfill é uma plataforma de gerenciamento de pedidos com arquitetura orientada a eventos. O projeto será desenvolvido de forma incremental para demonstrar conhecimento prático em Java 17+, Spring Boot, APIs REST, JPA/Hibernate, PostgreSQL, Apache Kafka, Docker, microsserviços, testes automatizados e boas práticas de desenvolvimento.

O projeto está sendo implementado de forma incremental. A etapa atual contém o `order-service` com cadastro e consulta de pedidos em PostgreSQL e publicação de eventos no Apache Kafka. O `notification-service` ainda não foi implementado.

## Visão Geral

A primeira versão planejada do Fulfill será composta por dois microsserviços:

- `order-service`: cria e consulta pedidos, persiste os dados em PostgreSQL e publica eventos de pedidos no Kafka.
- `notification-service`: consome eventos de pedidos de forma assíncrona e simula o envio de notificações por log ou histórico persistido.

Futuramente, o projeto poderá receber um `inventory-service` e um frontend em React, mas eles estão fora do escopo inicial.

## Arquitetura Inicial

```text
Cliente/API Client
       |
       | HTTP POST /api/orders
       v
order-service
       |
       | JPA/Hibernate
       v
PostgreSQL
       |
       | publica OrderCreatedEvent
       v
Apache Kafka
       |
       | consome evento
       v
notification-service
       |
       | log ou histórico
       v
Notificação simulada
```

O fluxo principal será orientado a eventos: o `order-service` não chamará diretamente o `notification-service`. Em vez disso, publicará um evento no Kafka, permitindo que a notificação aconteça de forma assíncrona e desacoplada.

## Responsabilidades dos Serviços

### order-service

- Expor API REST para criação e consulta de pedidos.
- Validar dados básicos da requisição.
- Persistir pedidos no PostgreSQL.
- Gerar um identificador único para cada pedido.
- Publicar o evento `OrderCreatedEvent` após a criação do pedido.
- Ser a fonte de verdade inicial para os dados do pedido.

### notification-service

- Consumir eventos `OrderCreatedEvent` do Kafka.
- Processar notificações de forma assíncrona.
- Simular envio de notificação por log na primeira versão.
- Opcionalmente persistir um histórico de notificações em uma etapa futura.
- Manter sua própria responsabilidade, sem consultar diretamente o banco do `order-service`.

## Fluxo de Criação de Pedido

1. Um cliente envia `POST /api/orders` para o `order-service`.
2. O `order-service` valida os dados recebidos.
3. O `order-service` cria o pedido com status inicial `CREATED`.
4. O pedido é salvo no PostgreSQL.
5. O `order-service` publica um `OrderCreatedEvent` no tópico Kafka `order-created`.
6. Em uma etapa futura, o `notification-service` consumirá o evento de forma assíncrona.
7. Em uma etapa futura, o `notification-service` registrará em log a notificação simulada.

## Contratos Principais

### Endpoint de criação de pedido

```http
POST /api/orders
Content-Type: application/json
```

Exemplo de requisição:

```json
{
  "customerName": "Ana Souza",
  "customerEmail": "ana@example.com",
  "totalAmount": 99.80
}
```

Exemplo de resposta:

```json
{
  "id": "5c6cc3ce-4b52-4cb6-9b16-86fa85920c2f",
  "customerName": "Ana Souza",
  "customerEmail": "ana@example.com",
  "status": "CREATED",
  "totalAmount": 99.80,
  "createdAt": "2026-08-17T21:30:00Z"
}
```

### Modelo básico de pedido

Campos iniciais:

- `id`: identificador único do pedido.
- `customerName`: nome do cliente.
- `customerEmail`: email do cliente.
- `status`: status do pedido, inicialmente `CREATED`.
- `totalAmount`: valor total informado na criação nesta etapa inicial.
- `createdAt`: data e hora de criação.

### Evento OrderCreatedEvent

O evento é publicado pelo `order-service` após a persistência do pedido.

```json
{
  "orderId": "5c6cc3ce-4b52-4cb6-9b16-86fa85920c2f",
  "customerName": "Ana Souza",
  "customerEmail": "ana@example.com",
  "status": "CREATED",
  "totalAmount": 99.80,
  "createdAt": "2026-08-17T21:30:00Z"
}
```

### Tópico Kafka

- Nome: `order-created`
- Chave da mensagem: `orderId`
- Valor da mensagem: JSON do `OrderCreatedEvent`
- Consumidor inicial: `notification-service`

## Estrutura Sugerida do Monorepo

```text
fulfill/
  README.md
  docker-compose.yml
  order-service/
    pom.xml
    src/
  notification-service/
    pom.xml
    src/
  docs/
    architecture.md
    api-contracts.md
  scripts/
```

Essa estrutura permite manter os serviços independentes, mas versionados juntos. Para um projeto de portfólio, isso facilita a navegação, a demonstração e a execução local com Docker Compose.

## Docker Compose

Componentes previstos:

- PostgreSQL para persistência do `order-service`.
- Apache Kafka para mensageria entre os serviços.
- Zookeeper ou Kafka em modo KRaft, dependendo da imagem escolhida.
- `order-service`, quando implementado.
- `notification-service`, quando implementado.
- Opcionalmente, Kafka UI para inspecionar tópicos e mensagens durante o desenvolvimento.

## Executando a Etapa Atual

Subir PostgreSQL e Kafka:

```bash
docker compose up -d postgres kafka
```

Executar o `order-service` localmente:

```bash
cd order-service
mvn spring-boot:run
```

Executar os testes:

```bash
cd order-service
mvn test
```

Endpoints disponíveis nesta etapa:

- `POST /api/orders`
- `GET /api/orders/{id}`
- `GET /api/orders`

Verificar mensagens publicadas no Kafka:

```bash
docker exec -it fulfill-kafka kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic order-created --from-beginning --max-messages 1
```

## Decisões Arquiteturais

- Monorepo: simplifica o desenvolvimento local e a apresentação do projeto.
- Microsserviços pequenos: cada serviço tem uma responsabilidade clara.
- Comunicação assíncrona via Kafka: reduz acoplamento entre pedido e notificação.
- REST para entrada externa: facilita testes manuais, documentação e consumo por futuro frontend.
- PostgreSQL no `order-service`: banco relacional e adequado para pedidos, itens e consistência transacional.
- Tópico `order-created`: nome simples e direto para esta etapa inicial do projeto.
- Serialização JSON no Kafka: facilita inspeção local e integração futura com outros serviços.
- Notificação simulada no início: mantém o projeto realista sem introduzir provedores externos cedo demais.

## Trade-offs e Pontos de Atenção

- Consistência eventual: a notificação pode acontecer alguns instantes depois da criação do pedido.
- Falha entre salvar pedido e publicar evento: em uma versão inicial pode ser aceito, mas futuramente vale estudar Outbox Pattern.
- Duplicidade de eventos: consumidores Kafka devem ser pensados para processamento idempotente.
- Evolução de contratos: mudanças no evento precisam preservar consumidores existentes.
- Complexidade operacional: Kafka adiciona valor arquitetural, mas também exige configuração e observabilidade.
- Microsserviços em portfólio: o escopo precisa ser controlado para não virar complexidade artificial.

## Próximos Passos

1. Expandir o modelo de pedido com itens.
2. Criar o `notification-service`.
3. Consumir eventos de pedido assincronamente.
4. Evoluir resiliência da publicação de eventos, possivelmente com Outbox Pattern.
