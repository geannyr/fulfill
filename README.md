# Fulfill

Fulfill é uma plataforma de gerenciamento de pedidos com arquitetura orientada a eventos. O projeto é desenvolvido de forma incremental para demonstrar conhecimento prático em Java 17+, Spring Boot, APIs REST, JPA/Hibernate, PostgreSQL, Apache Kafka, Docker, microsserviços, testes automatizados, React, TypeScript e boas práticas de desenvolvimento.

A etapa atual contém `order-service`, `notification-service`, PostgreSQL, Kafka e um frontend web em React integrado à API real de pedidos. Toda a aplicação pode ser executada via Docker Compose a partir da raiz do projeto.

## Visão Geral

- `frontend`: interface web para listar, criar e visualizar pedidos.
- `order-service`: cria e consulta pedidos, persiste os dados em PostgreSQL e publica eventos de pedidos no Kafka.
- `notification-service`: consome eventos de pedidos de forma assíncrona e simula o envio de notificações por log.

Futuramente, o projeto poderá receber um `inventory-service`, mas ele está fora do escopo atual.

## Arquitetura Atual

```text
Browser / React
       |
       | HTTP GET/POST /api/orders
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
       | log estruturado
       v
Notificação simulada
```

O `order-service` não chama diretamente o `notification-service`. A comunicação entre serviços acontece por evento Kafka, mantendo o fluxo assíncrono e desacoplado.

## Responsabilidades

### frontend

- Exibir a lista de pedidos.
- Criar pedidos usando a API REST do `order-service`.
- Mostrar detalhes do pedido selecionado.
- Apresentar uma visualização simples do fluxo arquitetural.
- Não acessar Kafka ou `notification-service` diretamente.

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
- Simular envio de notificação por log.
- Manter sua própria responsabilidade, sem consultar diretamente o banco do `order-service`.

## Fluxo de Criação de Pedido

1. A pessoa cria um pedido pelo frontend.
2. O frontend envia `POST /api/orders` para o `order-service`.
3. O `order-service` valida os dados recebidos.
4. O `order-service` cria o pedido com status inicial `CREATED`.
5. O pedido é salvo no PostgreSQL.
6. O `order-service` publica um `OrderCreatedEvent` no tópico Kafka `order-created`.
7. O `notification-service` consome o evento de forma assíncrona.
8. O `notification-service` registra em log a notificação simulada.
9. O frontend atualiza a lista de pedidos após a criação.

## Contratos Principais

### Criar pedido

```http
POST /api/orders
Content-Type: application/json
```

```json
{
  "customerName": "Ana Souza",
  "customerEmail": "ana@example.com",
  "totalAmount": 99.80
}
```

### Resposta de pedido

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

### Consultas

- `GET /api/orders`
- `GET /api/orders/{id}`

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

Tópico Kafka:

- Nome: `order-created`
- Chave da mensagem: `orderId`
- Valor da mensagem: JSON do `OrderCreatedEvent`
- Consumer group: `notification-service`

## Estrutura do Monorepo

```text
fulfill/
  README.md
  CONTEXTO.md
  docker-compose.yml
  frontend/
    package.json
    src/
      components/
      pages/
      services/
      types/
  order-service/
    pom.xml
    src/
  notification-service/
    pom.xml
    src/
```

## Docker Compose

Componentes disponíveis:

- PostgreSQL para persistência do `order-service`.
- Apache Kafka para mensageria entre os serviços.
- Kafka em modo KRaft para simplificar o ambiente local.
- `order-service` executado em container Java.
- `notification-service` executado em container Java.
- `frontend` servido por Nginx.

O frontend usa o Nginx como reverse proxy para encaminhar chamadas `/api` para `order-service:8080` dentro da rede Docker. Assim, o navegador acessa apenas `http://localhost:5173` e não precisa resolver nomes internos da rede Docker.

## Executando com Docker

Subir toda a aplicação:

```bash
docker compose up --build
```

Em modo detached:

```bash
docker compose up --build -d
```

Acessar o frontend:

```text
http://localhost:5173
```

Portas expostas:

- `5173`: frontend Nginx.
- `8080`: API do `order-service`.
- `5432`: PostgreSQL.
- `9092`: Kafka para clientes executados no host.

Derrubar os containers:

```bash
docker compose down
```

Derrubar os containers e remover volumes:

```bash
docker compose down -v
```

## Executando em Desenvolvimento Local

Também é possível manter o fluxo local anterior.

Subir apenas PostgreSQL e Kafka:

```bash
docker compose up -d postgres kafka
```

Executar o `order-service` localmente:

```bash
cd order-service
mvn spring-boot:run
```

Executar o `notification-service` localmente em outro terminal:

```bash
cd notification-service
mvn spring-boot:run
```

Executar o frontend localmente em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

O frontend local fica disponível em:

```text
http://localhost:5173
```

Por padrão, o frontend usa `/api`. No Docker, o Nginx encaminha essa rota para o `order-service`. No desenvolvimento local, o Vite faz proxy para `http://localhost:8080`.

Se quiser usar uma URL absoluta da API, crie um arquivo `.env` local a partir de `.env.example` e ajuste:

```bash
VITE_API_URL=http://localhost:8080
```

No Windows PowerShell, caso o script `npm` esteja bloqueado por política de execução, use `npm.cmd`.

## Testes e Build

Backend:

```bash
cd order-service
mvn test

cd ../notification-service
mvn test
```

Frontend:

```bash
cd frontend
npm test
npm run build
```

## Validação do Fluxo Completo

1. Suba PostgreSQL e Kafka com `docker compose up -d postgres kafka`.
2. Inicie o `order-service`.
3. Inicie o `notification-service`.
4. Inicie o frontend.
5. Crie um pedido pela interface web.
6. Confirme que o pedido aparece na lista.
7. Confirme no log do `notification-service` a mensagem `Simulated notification processed`.

Também é possível verificar mensagens no Kafka:

```bash
docker exec -it fulfill-kafka /opt/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9093 --topic order-created --from-beginning --max-messages 1
```

## Configuração de CORS

O `order-service` permite chamadas do frontend local por meio da propriedade:

```text
FULFILL_CORS_ALLOWED_ORIGIN=http://localhost:5173
```

O padrão é `http://localhost:5173`, evitando liberar CORS globalmente para qualquer origem.

## Decisões Arquiteturais

- Monorepo: simplifica o desenvolvimento local e a apresentação do projeto.
- Microsserviços pequenos: cada serviço tem uma responsabilidade clara.
- Comunicação assíncrona via Kafka: reduz acoplamento entre pedido e notificação.
- REST para entrada externa: facilita testes manuais, documentação e consumo pelo frontend.
- PostgreSQL no `order-service`: banco relacional adequado para pedidos e consistência transacional.
- Tópico `order-created`: nome simples e direto para esta etapa inicial do projeto.
- Serialização JSON no Kafka: facilita inspeção local e integração futura com outros serviços.
- Consumer group `notification-service`: identifica claramente o consumidor responsável por notificações.
- Contrato de evento duplicado por serviço: evita acoplamento direto entre os microsserviços.
- Frontend com React, TypeScript e Vite: entrega uma interface profissional com baixa complexidade.
- CORS configurável por origem: permite desenvolvimento local sem abrir a API para qualquer domínio.
- Dockerfiles multi-stage: as imagens finais não dependem de Maven ou Node instalados na máquina host.
- Nginx no frontend: serve os arquivos estáticos de produção e atua como reverse proxy para `/api`.
- Kafka com listeners separados: `localhost:9092` para o host e `kafka:9093` para containers.

## Trade-offs e Pontos de Atenção

- Consistência eventual: a notificação pode acontecer alguns instantes depois da criação do pedido.
- Falha entre salvar pedido e publicar evento: em uma versão inicial pode ser aceito, mas futuramente vale estudar Outbox Pattern.
- Duplicidade de eventos: consumidores Kafka devem ser pensados para processamento idempotente.
- Evolução de contratos: mudanças no evento precisam preservar consumidores existentes.
- Complexidade operacional: Kafka adiciona valor arquitetural, mas também exige configuração e observabilidade.
- Frontend sem autenticação: adequado para portfólio nesta etapa, mas insuficiente para produção.

## Próximos Passos

1. Expandir o modelo de pedido com itens.
2. Persistir histórico de notificações, se fizer sentido para demonstração.
3. Evoluir resiliência da publicação de eventos, possivelmente com Outbox Pattern.
4. Adicionar retry/dead-letter topic quando houver necessidade real.
5. Adicionar `inventory-service` em uma etapa futura.
