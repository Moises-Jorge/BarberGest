# Sistema de Gestão de Barbearia

## Objectivo

Desenvolver um sistema para gerir uma barbearia com foco no cliente, barbeiro, servicos e pagamentos, substituindo o controle manual da ordem de chegada dos clientes nao supervisionada.

## Utilizadores do Sistema
- Administrador
- Barbeiro
- Cliente

## Problemas Identificados
- Controle manual da ordem de chegada dos clientes
- Ausencia de agenda de trabalho do barbeiro
- Filas grandes e muito tempo de espera
- Servicos e precos descritos em papel
- Controle manual de pagamentos

## Requisitos Funcionais
- RF01 - Gerir Barbeiro (CRUD)
- RF02 - Gerir Cliente (CRUD)
- RF03 - Gerir Servico (CRUD)
- RF04 - Agendar Servicos
- RF05 - Consultar Agenda
- RF06 - Cancelar Agendamento
- RF07 - Registrar Pagamentos
- RF08 - Emitir Relatorio (diario, semanal, mensal e Anual)

## Requisitos Não Funcionais
- RNF01 - O sistema deve possuir autenticação (segurança: Auntenticidade).
- RNF02 - Apenas utilizadores autorizados poderão aceder determinadas funcionalidades do sistema (segurança: Confidencialidade).
- RNF03 - O sistema deve funcionar na web e em dispositivos móveis (Responsividade).
- RNF04 - O tempo de resposta deve ser inferior a 2 segundos (Desempenho).
- RNF05 - O sistema deve gerar logs estruturados para cada ação realizada no sistema (segurança: Irretratabilidade)

## Regras de Negócio
- RN01 - Cada utilizador do sistema deve possuir apenas uma conta.
- RN02 - Barbeiros só podem ser cadastrados e exluidos pelo administrador.
- RN03 - Barbeiros podem ver e editar os seus perfis.
- RN04 - Servicos só podem ser cadastrados, alterados e excluidos pelo administrador.
- RN05 - Clientes e barbeiros podem visualizar os servicos.
- RN06 - O Cliente deve se cadastrar e gerir os seus dados sozinho.
- RN07 - O cliente deve conseguir agendar servicos escolhendo o barbeiro, a data e a hora.
- RN08 - O Barbeiro deve conseguir consultar a sua agenda e alterar o status (pendente -> em execucao -> concluido)
- RN09 - Apos 15 min, se o status de um agendamento nao mudar, devera ser cancelado automaticamente liberando aquele horario
- RN10 - O sistema nao pode permitir que dois clientes agendem com o mesmo barbeiro ao mesmo tempo (deve lidar com concorrencia)
- RN11 - A aplicacao movel eh destinada aos clientes e barbeiros.
- RN12 - A aplicacao web eh destinada ao administrador (onde ele podera realizar as suas actividades, ver dashboard de tudo, ver e emitir relatorios)
