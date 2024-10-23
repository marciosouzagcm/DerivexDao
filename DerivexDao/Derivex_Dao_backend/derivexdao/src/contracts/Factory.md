# Objetivo Geral :

O contrato Factory que mencionaste para a Derivex DAO , permite a criação de exchanges descentralizadas que lidem com tokens de governança ou tokens relacionados com derivativos .

## Descrição das Funções e Mapeamentos :

***Função createNewExchange:***

- Esta função é usada para criar uma nova exchange associada a um token de derivativo ou um token de governança (por exemplo, o DVX ).
- Ela verifica se já existe uma exchange para o token e, se não houver, cria uma nova.
- Depois, mapeia o token para a exchange e a exchange de volta para o token .

***Mapeamentos:***

- tokenToExchange: Mapeia o endereço do token para o endereço da exchange associada.
- exchangeToToken: Mapeia o endereço da exchange para o token correspondente.
- idToToken: Opcionalmente, você pode associar um ID único a um token, útil se quiser identificar tokens de forma numérica.

***Funções de Consulta:***

- getExchange: Retorna o endereço da exchange associada a um token específico.
- getToken: Retorna o token associado a uma exchange específica.
- getTokenWithId: Permite consultar o token associado a um ID numérico.

***Evento ExchangeCreated:***

Sempre que uma nova exchange é criada, o evento ExchangeCreatedé emitido, registrando o endereço do token e o da exchange na blockchain. 
Isso permite monitorar e auditar todas as exchanges criadas.
