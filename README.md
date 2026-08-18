# Fulfill

Fulfill e uma plataforma de gerenciamento de pedidos com arquitetura orientada a eventos. O projeto sera desenvolvido de forma incremental para demonstrar conhecimento pratico em Java 17+, Spring Boot, APIs REST, JPA/Hibernate, PostgreSQL, Apache Kafka, Docker, microsservicos, testes automatizados e boas praticas de desenvolvimento.

O projeto esta sendo implementado de forma incremental. A etapa atual contem o `order-service` com cadastro e consulta de pedidos em PostgreSQL. Kafka e `notification-service` ainda nao foram implementados.

## Visao Geral

A primeira versao planejada do Fulfill sera composta por dois microsservicos:

- `order-service`: cria e consulta pedidos, persiste os dados em PostgreSQL e publica eventos de pedidos no Kafka.
- `notification-service`: consome eventos de pedidos de forma assincrona e simula o envio de notificacoes por log ou historico persistido.

Futuramente, o projeto podera receber um `inventory-service` e um frontend em React, mas eles estao fora do escopo inicial.

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
       | log ou historico
       v
Notificacao simulada
```

O fluxo principal sera orientado a eventos: o `order-service` nao chamara diretamente o `notification-service`. Em vez disso, publicara um evento no Kafka, permitindo que a notificacao aconteca de forma assincrona e desacoplada.

## Responsabilidades dos Servicos

### order-service

- Expor API REST para criacao e consulta de pedidos.
- Validar dados basicos da requisicao.
- Persistir pedidos no PostgreSQL.
- Gerar um identificador unico para cada pedido.
- Publicar o evento `OrderCreatedEvent` apos a criacao do pedido.
- Ser a fonte de verdade inicial para os dados do pedido.

### notification-service

- Consumir eventos `OrderCreatedEvent` do Kafka.
- Processar notificacoes de forma assincrona.
- Simular envio de notificacao por log na primeira versao.
- Opcionalmente persistir um historico de notificacoes em uma etapa futura.
- Manter sua propria responsabilidade, sem consultar diretamente o banco do `order-service`.

## Fluxo de Criacao de Pedido

1. Um cliente envia `POST /api/orders` para o `order-service`.
2. O `order-service` valida os dados recebidos.
3. O `order-service` cria o pedido com status inicial `CREATED`.
4. O pedido e salvo no PostgreSQL.
5. Em uma etapa futura, o `order-service` publicara um `OrderCreatedEvent` no topico Kafka `orders.v1.events`.
6. Em uma etapa futura, o `notification-service` consumira o evento de forma assincrona.
7. Em uma etapa futura, o `notification-service` registrara em log a notificacao simulada.

## Contratos Principais

### Endpoint de criacao de pedido

```http
POST /api/orders
Content-Type: application/json
```

Exemplo de requisicao:

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

### Modelo basico de pedido

Campos iniciais:

- `id`: identificador unico do pedido.
- `customerName`: nome do cliente.
- `customerEmail`: email do cliente.
- `status`: status do pedido, inicialmente `CREATED`.
- `totalAmount`: valor total informado na criacao nesta etapa inicial.
- `createdAt`: data e hora de criacao.

### Evento OrderCreatedEvent

Kafka ainda nao foi implementado. Este contrato sera usado como base futura e deve acompanhar o modelo vigente do pedido quando a etapa de eventos for iniciada.

```json
{
  "eventId": "evt_123",
  "eventType": "OrderCreatedEvent",
  "eventVersion": 1,
  "occurredAt": "2026-08-17T21:30:00Z",
  "orderId": "5c6cc3ce-4b52-4cb6-9b16-86fa85920c2f",
  "customerName": "Ana Souza",
  "customerEmail": "ana@example.com",
  "status": "CREATED",
  "totalAmount": 99.80
}
```

### Topico Kafka

- Nome: `orders.v1.events`
- Chave da mensagem: `orderId`
- Valor da mensagem: JSON do `OrderCreatedEvent`
- Consumidor inicial: `notification-service`

## Estrutura Sugerida do Monorepo

```text
fulfill/
  README.md
  CONTEXTO.md
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

Essa estrutura permite manter os servicos independentes, mas versionados juntos. Para um projeto de portfolio, isso facilita a navegacao, a demonstracao e a execucao local com Docker Compose.

## Docker Compose

Componentes previstos:

- PostgreSQL para persistencia do `order-service`.
- Apache Kafka para mensageria entre os servicos.
- Zookeeper ou Kafka em modo KRaft, dependendo da imagem escolhida.
- `order-service`, quando implementado.
- `notification-service`, quando implementado.
- Opcionalmente, Kafka UI para inspecionar topicos e mensagens durante o desenvolvimento.

## Executando a Etapa Atual

Subir o PostgreSQL:

```bash
docker compose up -d postgres
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

Endpoints disponiveis nesta etapa:

- `POST /api/orders`
- `GET /api/orders/{id}`
- `GET /api/orders`

## Decisoes Arquiteturais

- Monorepo: simplifica o desenvolvimento local e a apresentacao do projeto.
- Microsservicos pequenos: cada servico tem uma responsabilidade clara.
- Comunicacao assincrona via Kafka: reduz acoplamento entre pedido e notificacao.
- REST para entrada externa: facilita testes manuais, documentacao e consumo por futuro frontend.
- PostgreSQL no `order-service`: banco relacional e adequado para pedidos, itens e consistencia transacional.
- Evento versionado: `eventVersion` permite evoluir o contrato com mais seguranca.
- Topico com versao no nome: `orders.v1.events` deixa explicita a compatibilidade do contrato.
- Notificacao simulada no inicio: mantem o projeto realista sem introduzir provedores externos cedo demais.

## Trade-offs e Pontos de Atencao

- Consistencia eventual: a notificacao pode acontecer alguns instantes depois da criacao do pedido.
- Falha entre salvar pedido e publicar evento: em uma versao inicial pode ser aceito, mas futuramente vale estudar Outbox Pattern.
- Duplicidade de eventos: consumidores Kafka devem ser pensados para processamento idempotente.
- Evolucao de contratos: mudancas no evento precisam preservar consumidores existentes.
- Complexidade operacional: Kafka adiciona valor arquitetural, mas tambem exige configuracao e observabilidade.
- Microsservicos em portfolio: o escopo precisa ser controlado para nao virar complexidade artificial.

## Proximos Passos

1. Expandir o modelo de pedido com itens.
2. Configurar Kafka.
3. Publicar `OrderCreatedEvent`.
4. Criar o `notification-service`.
5. Consumir eventos de pedido assincronamente.
