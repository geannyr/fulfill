# Contexto do Projeto Fulfill

Este arquivo guarda as principais decisoes e contratos do projeto Fulfill para evitar repeticao durante o desenvolvimento incremental.

## Objetivo

Construir um projeto de portfolio chamado Fulfill: uma plataforma de gerenciamento de pedidos com arquitetura orientada a eventos.

O projeto deve demonstrar conhecimento pratico de:

- Java 17+
- Spring Boot
- APIs REST
- JPA / Hibernate
- PostgreSQL
- Apache Kafka
- Docker e Docker Compose
- Arquitetura de microsservicos
- Testes automatizados
- Boas praticas de desenvolvimento

O projeto deve permanecer compativel com nivel de portfolio, evitando complexidade desnecessaria.

## Escopo Atual

Etapa atual:

- `order-service` implementado com Spring Boot, Maven, Spring Web, Spring Data JPA, Bean Validation, Flyway e PostgreSQL.
- Docker Compose contem apenas PostgreSQL.
- Kafka ainda nao foi implementado.
- `notification-service` ainda nao foi implementado.

Escopo planejado da primeira versao:

- `order-service`
- `notification-service`
- PostgreSQL
- Kafka
- Docker Compose para ambiente local

Nao implementar agora:

- `inventory-service`
- frontend em React
- autenticacao
- gateway de API
- observabilidade avancada
- envio real de email, SMS ou push

## Arquitetura Inicial

O Fulfill usara microsservicos com comunicacao assincrona baseada em eventos.

O `order-service` recebe requisicoes REST e persiste pedidos em PostgreSQL. Em etapa futura, ele publicara eventos no Kafka. O `notification-service` ainda sera implementado para consumir esses eventos e processar notificacoes simuladas.

Fluxo principal:

1. Cliente chama `POST /api/orders`.
2. `order-service` valida a requisicao.
3. `order-service` salva o pedido com status `CREATED`.
4. Nesta etapa, o fluxo termina na persistencia e resposta HTTP.
5. Em etapa futura, `order-service` publicara `OrderCreatedEvent` no Kafka.
6. Em etapa futura, `notification-service` consumira o evento.
7. Em etapa futura, `notification-service` registrara a notificacao simulada por log.

## Servicos

### order-service

Responsabilidades:

- Criar pedidos.
- Consultar pedidos.
- Persistir pedidos em PostgreSQL.
- Receber `totalAmount` no request nesta etapa inicial.
- Definir status inicial `CREATED`.
- Publicar `OrderCreatedEvent` em etapa futura.

Limites:

- Nao deve enviar notificacoes diretamente.
- Nao deve chamar o `notification-service`.
- Nao deve cuidar de estoque nesta etapa.

### notification-service

Responsabilidades:

- Consumir `OrderCreatedEvent`.
- Processar notificacao de pedido criado.
- Simular notificacao por log.

Limites:

- Nao deve acessar o banco do `order-service`.
- Nao deve alterar pedidos.
- Nao deve depender de chamada HTTP sincrona do `order-service`.

## Contratos

### Endpoint de Criacao de Pedido

Metodo e rota:

```http
POST /api/orders
```

Request body:

```json
{
  "customerName": "Ana Souza",
  "customerEmail": "ana@example.com",
  "totalAmount": 99.80
}
```

Response body:

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

### Modelo Basico de Pedido

Pedido:

- `id`
- `customerName`
- `customerEmail`
- `status`
- `totalAmount`
- `createdAt`

Status inicial:

- `CREATED`

### OrderCreatedEvent Futuro

Kafka ainda nao foi implementado. Quando a etapa de eventos chegar, o contrato abaixo deve ser revisado para refletir o modelo vigente do pedido.

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

Topico Kafka:

- `orders.v1.events`

Chave Kafka:

- `orderId`

Formato:

- JSON

## Docker Compose

Componentes previstos:

- PostgreSQL

Componentes futuros:

- Kafka
- Zookeeper ou Kafka KRaft, se necessario pela imagem escolhida
- `order-service` containerizado
- `notification-service`
- Kafka UI opcional para desenvolvimento

## Decisoes Arquiteturais

- Usar monorepo para facilitar desenvolvimento local e demonstracao.
- Separar pedidos e notificacoes em servicos diferentes para demonstrar limites de responsabilidade.
- Usar REST para operacoes externas porque e simples de testar e integrar.
- Usar Kafka para comunicacao entre servicos porque o caso de notificacao e naturalmente assincrono.
- Usar PostgreSQL para pedidos porque dados de pedido se beneficiam de transacoes e modelo relacional.
- Versionar eventos com `eventVersion`.
- Versionar topico no nome com `orders.v1.events`.
- Comecar notificacao por log para manter o escopo controlado.
- Usar UUID como identificador do pedido na primeira implementacao.
- Usar Flyway para versionamento de schema e `spring.jpa.hibernate.ddl-auto=validate`.
- Nao usar Lombok para manter o codigo explicito e facil de ler em contexto de portfolio.

## Trade-offs

- Kafka aumenta complexidade local, mas demonstra arquitetura orientada a eventos.
- Microsservicos exigem mais configuracao que um monolito, mas ajudam a mostrar separacao de responsabilidades.
- A consistencia entre criacao do pedido e notificacao sera eventual.
- A publicacao do evento apos salvar no banco pode falhar; futuramente considerar Outbox Pattern.
- Consumidores podem receber eventos duplicados; futuramente considerar idempotencia explicita.
- Evolucao do evento precisa ser cuidadosa para nao quebrar consumidores.

## Estrutura Planejada

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

## Diretriz de Desenvolvimento

Desenvolver incrementalmente. Antes de adicionar uma nova tecnologia, biblioteca ou padrao, avaliar se ela ajuda a demonstrar conhecimento real sem inflar o projeto.

Prioridade:

1. Clareza arquitetural.
2. Codigo simples e testavel.
3. Contratos bem definidos.
4. Execucao local reproduzivel.
5. Boas praticas proporcionais ao tamanho do projeto.
