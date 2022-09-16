const buildEnv = () => {
    cy.server()

    cy.route({
        method: 'POST',
        url: '/signin',
        response: {
            id: 1000,
            nome: 'Usuario falso',
            token: 'Uma string muito grande que nao deveria ser aceito mas na verdade, vai'
        }
    }).as('signin')

    cy.route({
        method: 'GET',
        url: '/saldo',
        response: [{
            conta_id: 999,
            conta: 'Carteira',
            saldo: '100.00'
        },
        {
            conta_id: 9909,
            conta: 'Banco',
            saldo: '100000000000.00'
        },
        ]
    }).as('saldo')

    cy.route({
        method: 'GET',
        url: '/contas',
        response: [
            { id: 1, nome: 'Carteira', visivel: true, usuario_id: 1 },
            { id: 2, nome: 'Banco', visivel: true, usuario_id: 1 }
        ]
    }).as('contas')

    cy.route({
        method: 'GET',
        url: '/extrato/**',
        response: [
            { "conta":"Conta para movimentacoes", "id":1288501, "descricao":"Movimentacao para exclusao", "envolvido":"AAA", "observacao":null, "tipo":"DESP", "data_transacao":"2022-09-15T03:00:00.000Z", "data_pagamento":"2022-09-15T03:00:00.000Z", "valor":"-1500.00", "status":true, "conta_id":1380490, "usuario_id":32735, "transferencia_id":null, "parcelamento_id":null },
            { "conta":"Conta com movimentacao", "id":1288502, "descricao":"Movimentacao de conta", "envolvido":"BBB", "observacao":null, "tipo":"DESP", "data_transacao":"2022-09-15T03:00:00.000Z", "data_pagamento":"2022-09-15T03:00:00.000Z", "valor":"-1500.00", "status":true, "conta_id":1380491, "usuario_id":32735, "transferencia_id":null, "parcelamento_id":null },
            { "conta":"Conta para saldo", "id":1288503, "descricao":"Movimentacao 1, calculo saldo", "envolvido":"CCC", "observacao":null, "tipo":"REC", "data_transacao":"2022-09-15T03:00:00.000Z", "data_pagamento":"2022-09-15T03:00:00.000Z", "valor":"3500.00", "status":false, "conta_id":1380492, "usuario_id":32735, "transferencia_id":null, "parcelamento_id":null },
            { "conta":"Conta para saldo", "id":1288504, "descricao":"Movimentacao 2, calculo saldo", "envolvido":"DDD", "observacao":null, "tipo":"DESP", "data_transacao":"2022-09-15T03:00:00.000Z", "data_pagamento":"2022-09-15T03:00:00.000Z", "valor":"-1000.00", "status":true, "conta_id":1380492, "usuario_id":32735, "transferencia_id":null, "parcelamento_id":null },
            { "conta":"Conta para saldo", "id":1288505, "descricao":"Movimentacao 3, calculo saldo", "envolvido":"EEE", "observacao":null, "tipo":"REC", "data_transacao":"2022-09-15T03:00:00.000Z", "data_pagamento":"2022-09-15T03:00:00.000Z", "valor":"1534.00", "status":true, "conta_id":1380492, "usuario_id":32735, "transferencia_id":null, "parcelamento_id":null },
            { "conta":"Conta para extrato", "id":1288506, "descricao":"Movimentacao para extrato", "envolvido":"FFF", "observacao":null, "tipo":"DESP", "data_transacao":"2022-09-15T03:00:00.000Z", "data_pagamento":"2022-09-15T03:00:00.000Z", "valor":"-220.00", "status":true, "conta_id":1380493, "usuario_id":32735, "transferencia_id":null, "parcelamento_id":null },
            { "conta":"Conta para extrato", "id":1288533, "descricao":"Desc", "envolvido":"FFF", "observacao":null, "tipo":"DESP", "data_transacao":"2022-09-15T03:00:00.000Z", "data_pagamento":"2022-09-15T03:00:00.000Z", "valor":"123.00", "status":true, "conta_id":1380493, "usuario_id":32735, "transferencia_id":null, "parcelamento_id":null }  
        ]
    })
}

export default buildEnv