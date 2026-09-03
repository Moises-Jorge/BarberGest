<div align="center">

# Documento de Arquitetura de Software (DAS)
## Sistema de Gestão de Barbearia


</div>


* **Autor**: Moises Jorge (Team Lider da MucuaC)
* **Arquitetura**:  Monólito Modular
* **Data**:  Setembro, 2026
* **Linguagem**: JavaScript/TypeScript
* **Framework**:  Node.js
* **Versão**:  1.0.0


## 1. Visão Geral da Arquitetura

O sistema será desenvolvido adotando o padrão **Monólito Modular** em Node.js. O objetivo é garantir **alta coesão** e **baixo acoplamento**, permitindo que a aplicação rode como um único processo de deploy, mas com separação clara de domínios em módulos independentes.

 **Regra crítica de comunicação**

A comunicação entre módulos ocorre **exclusivamente** por:
- Interfaces de serviço exportadas (**Services**), ou
- **Eventos Internos**

🚫 **Acesso direto de um módulo aos modelos ou banco de dados de outro módulo é estritamente PROIBIDO.**

---

## 2. Divisão e Limites dos Módulos

| Módulo | Responsabilidade de Negócio | Dependências Permitidas |
|---|---|---|
| **`barbeiros`** | Gestão de perfis de barbeiros, especialidades e agenda de funcionamento. | Nenhuma *(Módulo Base)* |
| **`servicos`** | Catálogo de serviços oferecidos (Corte, Barba), preços e duração em minutos. | Nenhuma *(Módulo Base)* |
| **`clientes`** | Gestão de perfis de clientes e histórico de visitas. | Nenhuma *(Módulo Base)* |
| **`agendamentos`** | Criação, validação de conflito de horários e cancelamento de agendamentos. | `barbeiros`, `servicos`, `clientes` |
| **`pagamento`** | Gestão de caixa e registro de pagamentos. | `agendamentos` *(via Eventos)* |

`barbeiros`, `servicos` e `clientes` são **módulos base** — não dependem de nenhum outro módulo do sistema.

---

## 3. Padronização de Estrutura Interna dos Módulos

Todos os desenvolvedores do time devem seguir **rigorosamente** a estrutura de diretórios abaixo para cada módulo dentro de `src/modules/`:

```text
src/
├── modules/
│   ├── barbeiros/
│   │   ├── barbeiro.controller.js   # Trata HTTP (req, res), valida schema e chama o Service
│   │   ├── barbeiro.service.js      # Regras de Negócio e Contrato PÚBLICO do módulo
│   │   ├── barbeiro.repository.js   # Consultas diretas ao Banco de Dados / ORM (PRIVADO)
│   │   ├── barbeiro.model.js        # Definição das tabelas/schemas (PRIVADO)
│   │   └── barbeiro.routes.js       # Definição dos endpoints Express do módulo
│   │
│   └── servicos/
│   │   ├── servico.controller.js
│   │   ├── servico.service.js   # Interface PUBLICA desse modulo
│   │   ├── servico.repository.js
│   │   ├── servico.model.js        # Definição das tabelas/schemas (PRIVADO)
│   │   └── servico.routes.js
│   │
│   └── clientes/
│   │    ├── cliente.controller.js
│   │    ├── cliente.service.js   # Interface PUBLICA desse modulo
│   │    ├── cliente.repository.js
│   │    ├── cliente.model.js        # Definição das tabelas/schemas (PRIVADO)
│   │    └── cliente.routes.js
│   │
│   └── agendamentos/
│   │   ├── agendamento.controller.js
│   │   ├── agendamento.service.js   # Interface PUBLICA desse modulo
│   │   ├── agendamento.repository.js
│   │   ├── agendamento.model.js        # Definição das tabelas/schemas (PRIVADO)
│   │   └── agendamento.routes.js
│   │
│   └── pagamentos/
│       ├── pagamento.controller.js
│       ├── pagamento.service.js   # Interface PUBLICA desse modulo
│       ├── pagamento.repository.js
│       ├── pagamento.model.js        # Definição das tabelas/schemas (PRIVADO)
│       └── pagamento.routes.js
│
└── shared/                          # Código global reutilizável (DB, Middlewares, EventBus)
    ├── database/
    └── events/eventEmitter.js
```

### Regras de Ouro para o Time de Desenvolvimento

1. **Controllers Magras** — Controllers não contêm regras de negócio. Apenas extraem parâmetros HTTP e devolvem respostas JSON.
2. **Encapsulamento de Repositórios** — Arquivos `.repository.js` **nunca** são importados fora do seu módulo de origem.
3. **Comunicação Via Service** — Para consultar se um barbeiro está disponível, o módulo de `agendamentos` deve importar **apenas** o `barbeiro.service.js`.


## 4. Contratos e Padrões de Comunicação

### 4.1 Chamada Direta de Serviço (Síncrona)

Usada para validações imediatas necessárias para concluir uma operação.

**`src/modules/barbeiros/barbeiro.service.js`** *(Interface Pública)*

```javascript
class BarbeiroService {
  async validarDisponibilidadeBarbeiro(barbeiroId, dataHora) {
    const barbeiro = await barbeiroRepository.findById(barbeiroId);
    if (!barbeiro || !barbeiro.ativo) throw new Error('Barbeiro indisponível.');

    const estaNoHorario = await barbeiroRepository.checarHorarioExpediente(barbeiroId, dataHora);
    if (!estaNoHorario) throw new Error('Horário fora do expediente do barbeiro.');

    return true;
  }
}

module.exports = new BarbeiroService();
```

**`src/modules/agendamentos/agendamento.service.js`** *(Consumidor)*

```javascript
const barbeiroService = require('../barbeiros/barbeiro.service');

class AgendamentoService {
  async criarAgendamento({ clienteId, barbeiroId, servicoId, dataHora }) {
    // Validação cruzada usando o contrato do módulo de barbeiros
    await barbeiroService.validarDisponibilidadeBarbeiro(barbeiroId, dataHora);

    // Validação interna de conflitos no módulo de agendamentos
    const conflito = await agendamentoRepository.buscarPorHorario(barbeiroId, dataHora);
    if (conflito) throw new Error('Horário já ocupado.');

    const agendamento = await agendamentoRepository.salvar({ clienteId, barbeiroId, servicoId, dataHora });
    return agendamento;
  }
}
```

**Ponto-chave:** o módulo `agendamentos` nunca acessa `barbeiroRepository` diretamente — toda a validação cruzada passa pelo **contrato público** (`barbeiro.service.js`).

---

## 5. Especificação de Endpoints REST (API)

| Método | Rota | Descrição / Payload | Resposta Esperada |
|---|---|---|---|
| `POST` | `/api/agendamentos` | Cria um novo agendamento.<br>`{ clienteId, barbeiroId, servicoId, dataHora }` | `201 Created`<br>`{ id, status }` |
| `GET` | `/api/agendamentos/livres` | Busca horários disponíveis.<br>Query: `?barbeiroId=1&data=2026-10-15` | `200 OK`<br>`[ "09:00", "10:00" ]` |
| `PATCH` | `/api/agendamentos/:id/cancelar` | Cancela um agendamento.<br>`{ motivo: "Imprevisto" }` | `200 OK` |

---

## 6. Roadmap de Implementação para o Time

| Sprint | Entregáveis Técnicos | Módulos Envolvidos |
|---|---|---|
| **Sprint 1** | Setup do projeto Node.js, conexão DB e CRUDs base. | `barbeiros`, `servicos` e `clientes` |
| **Sprint 2** | Regras de conflito de horário e criação do fluxo de agendamento. | `agendamentos`, `barbeiros` |
| **Sprint 3** | Autenticação JWT, perfil do cliente e histórico de visitas. | `clientes`, `auth` |
| **Sprint 4** | Gestao de pagamentos e fechamento de conta. | `pagamento` |

---

<div align="center">

*Documento de Arquitetura de Software • Monólito Modular Node.js*
**Versão 1.0.0** — Setembro, 2026

</div>
