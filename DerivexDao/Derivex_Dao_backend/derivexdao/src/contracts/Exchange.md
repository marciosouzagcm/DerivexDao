# Contrato Exchange.sol:

O contrato Exchange que apresentamos será o coração do seu Derivex DAO no que diz respeito à facilitação de swaps (troca de tokens) e à gestão de reservas de liquidez . 
Este contrato é semelhante ao que exchanges descentralizadas como Uniswap utilizam para administrar pools de liquidez e trocas de tokens . 
A arquitetura do contrato parece bem estruturada para lidar com essas funcionalidades essenciais.
A utilização de tokens de liquidez ( DVX ) também incentiva a comunidade a fornecer liquidez, beneficiando-se das taxas de transação.

## Função do Contrato Exchange :

### Facilitação de Swaps (Troca de Tokens) :

A função ***swapEthForTokens*** permite que os usuários troquem ETH por tokens (derivativos ou de governança). 
Isso é crucial para o objetivo da Derivex DAO de criar um mercado automatizado para tokens de derivativos.

### Gestão de Liquidez :

O contrato permite que os usuários adicionem liquidez ao pool (ETH e tokens), recebendo em troca tokens de liquidez (DVX tokens) , que representam a participação na pool.
Ao remover liquidez, o usuário pode recuperar sua participação proporcional em ETH e tokens.

### Eventos e Transparência :

Eventos como ***LiquidityAdded*** , ***LiquidityRemoved*** , ***TokenPurchased*** , e ***TokenSold*** garantem transparência, permitindo que a comunidade da Derivex DAO acompanhe todas as operações de negociação

## Análise preliminar do Contrato :

### 1. Construtor e Variáveis ​​Imutáveis:

***constructor(address _tokenAddress):***
Inicializa o contrato com o endereço do token DVX e configura DVX . OfactoryAddress é o endereço do contrato de Fábrica.

***tokenAddress:*** Este é o endereço do token que será trocado na exchange. Ele é imutável, garantindo que a exchange só suporte um token específico.
***factoryAddress:*** É o endereço do contrato de fábrica que cria essa troca, garantindo rastreamento da origem.
***ERC20("DVX", DVX):*** Uma exchange cria tokens de liquidez como "UNI-V1" , que são distribuídos a quem adiciona liquidez. Esses tokens representam a participação do usuário no pool.

### 2. Funções de Preço (Cálculos de Trocas) :

As funções de preço são essenciais para calcular quanto ETH ou tokens um usuário deve receber ao fazer swaps.

Estas funções calculam quanto ETH ou tokens um usuário deve receber ao trocar, com base nas reservas da pool e utilizando uma fórmula de curva constante ( x * y = k), semelhante ao modelo de Automated Market Maker (AMM) do Uniswap .

***getAmount*** implementa uma taxa de 0,3% (997/1000), que é comum em pools de liquidez para provedores de crédito.


### 3. Adicionar e remover líquidez :

***Adicionar Liquidez:***

- Adicionar Liquidez : Esta função permite que os usuários adicionem ETH e tokens ao pool em troca de tokens de liquidez.
- Primeira adição : Se não houver liquidez na pool, é calculado o valor total depositado e são emitidos tokens de liquidez fornecidos.
- Adição subsequente : Se já houver liquidez, é calculado o valor adicional a ser emitido com base na proporção da pool.

***Removedor Liquidez:***

Esta função permite que os usuários retirem ETH e tokens da pool em proporção ao montante dos tokens de crédito que possuem. 
Os tokens de liquidez são queimados para calcular e devolver os ativos à carteira do usuário.

### 4. Funções de Swap (Troca de Tokens) :

***swapEthForTokens :*** Troca de ETH por tokens no pool. O usuário envia ETH, recebe tokens, e o evento TokenPurchased é emitido.
***tokenForEthSwap :*** Troca de tokens por ETH. O usuário envia tokens, recebe ETH, e o evento TokenSold é emitido.

### 5. Proteções contra Ataques de Reentrância :

O uso de ***ReentrancyGuard*** garantia de proteção contra ataques de reentrância, onde um atacante pode tentar abusar da lógica de swap ou monetária para esgotar fundos da pool.

