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

Cada contrato de Exchange é um reflexo direto de seu token ERC-20 associado. Suas principais funcionalidades podem tem como componentes:

***Liquidity Pool (LP):*** 

O contrato da Exchange mantém reservas de ETH e seu respectivo token ERC-20. Os provedores de liquidez (usuários) podem contribuir para essas reservas depositando um valor equivalente de ETH e do token ERC-20 associado. Em troca, eles recebem "tokens LP" cunhados, também conhecidos como tokens ERC-20 que rastreiam sua contribuição relativa para o pool de liquidez. 
O pool de liquidez atua como o formador de mercado entre o par ETH-ERC20 subjacente e uma pequena taxa (0,30%) é retirada de cada negociação e adicionada de volta às reservas do pool de liquidez quando uma negociação ocorre. Isso atua como um incentivo para os provedores de liquidez, pois eles podem ganhar taxas quando as negociações ocorrem e sacar os ganhos quando queimam seus tokens LP.

***Automated Market Maker (AMM):*** 

O contrato de câmbio serve como facilitador de transações entre o par ETH e ERC-20, em qualquer direção. Ele permite que os usuários troquem tokens alterando as reservas de liquidez do par, impactando assim o preço do token a cada transação. Quanto maior a transação em relação ao tamanho total das reservas, mais significativo será o deslizamento de preço.
Utilizam algoritmos e pools de liquidez para determinar preços de negociação, não precisar de um livro de ordens tradicional. 
Em vez disso, eles contam com contratos inteligentes para calcular automaticamente os preços de negociação com base em um algoritmo predeterminado e na proporção de tokens em um pool de liquidez. 
AMMs não exigem que compradores e vendedores sejam correspondidos diretamente; isso os torna mais eficientes do que as trocas tradicionais de livros de ordens.

### Eventos e Transparência :

Eventos como ***LiquidityAdded*** , ***LiquidityRemoved*** , ***TokenPurchased*** , e ***TokenSold*** garantem transparência, permitindo que a comunidade da Derivex DAO acompanhe todas as operações de negociação.

## Análise preliminar do Contrato :

### 1. Construtor e Variáveis ​​Imutáveis:

***constructor(address _tokenAddress):***
Inicializa o contrato com o endereço do token DVX e configura DVX . 

***factoryAddress*** 
É o endereço do contrato de Fábrica.

***tokenAddress:*** 
Este é o endereço do token que será trocado na exchange. Ele é imutável, garantindo que a exchange só suporte um token específico.

***factoryAddress:*** 
É o endereço do contrato de fábrica que cria essa troca, garantindo rastreamento da origem.

***ERC20("DVX", DVX):*** 

Uma exchange cria tokens de liquidez, que são distribuídos a quem adiciona liquidez. Esses tokens representam a participação do usuário no pool.


### 2. Funções de Preço (Cálculos de Trocas) :


***Automated Market Maker (AMM):*** 
O contrato de câmbio serve como facilitador de transações entre o par ETH e ERC-20, em qualquer direção. Ele permite que os usuários troquem tokens alterando as reservas de liquidez do par, impactando assim o preço do token a cada transação. Quanto maior a transação em relação ao tamanho total das reservas, mais significativo será o deslizamento de preço. O Uniswap usa uma fórmula de criação de mercado de "produto constante", que define a taxa de câmbio com base no tamanho da negociação e nas reservas atuais de ETH e ERC-20.


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

