/// <reference types="cypress" />

import loc from '../../support/locators'
import '../../support/commandsContas'
import buildEnv from '../../support/buildEnv'

describe('Should test at a functional level', () => {
    after(() => {
        cy.clearLocalStorage()
    })

    beforeEach(() => {
        buildEnv()
        cy.login('roncarcla18@gmail.com', '31') 
        cy.get(loc.MENU.HOME).click()
    })

    it('Should test the responsiveness', () => {
        cy.get('[data-test=menu-home]').should('exist')
            .and('be.visible')
        cy.viewport(500, 700)  
        cy.get('[data-test=menu-home]').should('exist')
            .and('be.not.visible') 
        cy.viewport('iphone-5')  
        cy.get('[data-test=menu-home]').should('exist')
            .and('be.not.visible')  
        cy.viewport('ipad-2')  
        cy.get('[data-test=menu-home]').should('exist')
            .and('be.visible')             
    })

    it('Should create an account', () => {
        cy.route({
            method: 'POST',
            url: '/contas',
            response: {
                id: 3,
                nome: 'Conta de teste',
                visivel: true,
                usuario_id: 1
            }
        }).as('saveConta')

        cy.acessarMenuConta() 
        
        cy.route({
            method: 'GET',
            url: '/contas',
            response: [
                {
                    id: 1,
                    nome: 'Carteira',
                    visivel: true,
                    usuario_id: 1
                },
                {
                    id: 2,
                    nome: 'Banco',
                    visivel: true,
                    usuario_id: 1
                },
                {
                    id: 3,
                    nome: 'Conta de teste',
                    visivel: true,
                    usuario_id: 1
                }
            ]
        }).as('contasSave') 

        cy.inserirConta('Conta nova')
        cy.get(loc.MESSAGE).should('contain', 'Conta inserida com sucesso')       
    })

    it('Should update an account', () => {
        cy.route({
            method: 'PUT',
            url: '/contas/**',
            response: {
                          id: 1,
                          nome: 'Conta alterada',
                          visivel: true,
                           usuario_id: 1
                       }
        })

        cy.acessarMenuConta() 
        cy.xpath(loc.CONTAS.FN_XP_BTN_ALTERAR('Carteira')).click()
        cy.get(loc.CONTAS.NOME)
            .clear()
            .type('Conta teste')
        cy.get(loc.CONTAS.BTN_SALVAR).click()
        cy.get(loc.MESSAGE).should('contain', 'sucesso')

    })

    it('Should not create an account with same name', () => { 
        cy.route({
            method: 'POST',
            url: '/contas',
            response: {
                error: 'J?? existe uma conta com esse nome!'
                },
                status: 400
        }).as('saveContaMesmoNome')

        cy.acessarMenuConta() 
        cy.inserirConta('Conta mesmo nome')   
        cy.get(loc.MESSAGE).should('contain', 'code 400')
    })

    it('Should create a transaction', () => {
        cy.route({
            method: 'POST',
            url: '/transacoes',
            response: {
                id: 31433,
                descricao: '',
                envolvido: '',
                observacao: null,
                tipo: 'REC',
                data_transacao: '15/09/2022',
                data_pagamento: '15/09/2022'
            }
        })

        cy.route({
            method: 'GET',
            url: '/extrato/**',
            response: 'fixture:movimentacaoSalva'          
            })

        cy.get(loc.MENU.MOVIMENTACAO).click()
        cy.get(loc.MOVIMENTACAO.DESCRICAO).type('Desc')
        cy.get(loc.MOVIMENTACAO.VALOR).type('123', {force: true})
        cy.get(loc.MOVIMENTACAO.INTERESSADO).type('inter')
        cy.get(loc.MOVIMENTACAO.CONTA).select('Banco')
        cy.get(loc.MOVIMENTACAO.STATUS).click()
        cy.get(loc.MOVIMENTACAO.BTN_SALVAR).click()
        cy.get(loc.MESSAGE).should('contain', 'sucesso')
        cy.get(loc.EXTRATO.LINHAS).should('have.length', 7)
        cy.xpath(loc.EXTRATO.FN_XP_BUSCA_ELEMENTO('Desc', '123')).should('exist')
    })

    it('Should get balance', () => {
        cy.route({
            method: 'GET',
            url: '/transacoes/**',
            response: 'fixture:movimentacaoSalva' 
        })

        cy.route({
            method: 'PUT',
            url: '/transacoes/**',
            response: 'fixture:movimentacaoSalva'
        })

        cy.get(loc.MENU.HOME).click()
        cy.xpath(loc.SALDO.FN_XP_SALDO_CONTA('Carteira')).should('contain', '100,00')
        cy.get(loc.MENU.EXTRATO).click()
        cy.xpath(loc.EXTRATO.FN_XP_ALTERAR_ELEMENTO('Movimentacao 1, calculo saldo')).click({force: true})
        cy.get(loc.MOVIMENTACAO.DESCRICAO).should('have.value', '')
        cy.get(loc.MOVIMENTACAO.STATUS).click()
        cy.get(loc.MOVIMENTACAO.BTN_SALVAR).click()
        cy.get(loc.MESSAGE).should('contain', 'falso')

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
        }).as('saldoFinal')

        cy.get(loc.MENU.HOME).click()
        cy.xpath(loc.SALDO.FN_XP_SALDO_CONTA('Carteira')).should('contain', '100,00')

    })

    it('Should remova a trasaction', () => {
        cy.route({
            method: 'DELETE',
            url: '/transacoes/**',
            response: {},
            status: 204
        }).as('del')

        cy.get(loc.MENU.EXTRATO).click()
        cy.xpath(loc.EXTRATO.FN_XP_REMOVER_ELEMENTO('Movimentacao 1, calculo saldo')).click()
        cy.get(loc.MESSAGE).should('contain', 'sucesso')
    })

    it('Should validate data send to create an account', () => {
        const reqStub = cy.stub()
        cy.route({
            method: 'POST',
            url: '/contas',
            response: { id: 3, nome: 'Conta de teste', visivel: true, usuario_id: 1 },
            /*onRequest: req => {
                console.log(req)
                expect(req.request.body.nome).to.be.empty
                expect(req.request.headers).to.have.property('Authorization')
            }*/
            onRequest: reqStub
        }).as('saveConta')
        cy.acessarMenuConta() 
        
        cy.route({
            method: 'GET',
            url: '/contas',
            response: [
                { id: 1, nome: 'Carteira', visivel: true, usuario_id: 1 },
                { id: 2, nome: 'Banco', visivel: true, usuario_id: 1 },
                { id: 3, nome: 'Conta de teste', visivel: true, usuario_id: 1 }
            ]
        }).as('contasSave') 
        cy.inserirConta('{CONTROL}')
        //cy.wait('@saveConta').its('request.body.nome').should('not.be.empty')
        cy.wait('@saveConta').then(() => {
            console.log(reqStub.args[0][0])
            expect(reqStub.args[0][0].request.body.nome).to.be.empty
            expect(reqStub.args[0][0].request.headers).to.have.property('Authorization')
        })
        cy.get(loc.MESSAGE).should('contain', 'Conta inserida com sucesso')       
    })

    it('Should test colors', () => {
        cy.route({
            method: 'GET',
            url: '/extrato/**',
            response: [
                { "conta":"Conta para movimentacoes", "id":1288501, "descricao":"Receita paga", "envolvido":"AAA", "observacao":null, "tipo":"REC", "data_transacao":"2022-09-15T03:00:00.000Z", "data_pagamento":"2022-09-15T03:00:00.000Z", "valor":"-1500.00", "status":true, "conta_id":1380490, "usuario_id":32735, "transferencia_id":null, "parcelamento_id":null },
                { "conta":"Conta com movimentacao", "id":1288502, "descricao":"Receita pendente", "envolvido":"BBB", "observacao":null, "tipo":"REC", "data_transacao":"2022-09-15T03:00:00.000Z", "data_pagamento":"2022-09-15T03:00:00.000Z", "valor":"-1500.00", "status":false, "conta_id":1380491, "usuario_id":32735, "transferencia_id":null, "parcelamento_id":null },
                { "conta":"Conta para saldo", "id":1288503, "descricao":"Despesa paga", "envolvido":"CCC", "observacao":null, "tipo":"DESP", "data_transacao":"2022-09-15T03:00:00.000Z", "data_pagamento":"2022-09-15T03:00:00.000Z", "valor":"3500.00", "status":true, "conta_id":1380492, "usuario_id":32735, "transferencia_id":null, "parcelamento_id":null },
                { "conta":"Conta para saldo", "id":1288504, "descricao":"Despesa pendente", "envolvido":"DDD", "observacao":null, "tipo":"DESP", "data_transacao":"2022-09-15T03:00:00.000Z", "data_pagamento":"2022-09-15T03:00:00.000Z", "valor":"-1000.00", "status":false, "conta_id":1380492, "usuario_id":32735, "transferencia_id":null, "parcelamento_id":null }
            ]
        })

        cy.get(loc.MENU.EXTRATO).click()
        cy.xpath(loc.EXTRATO.FN_XP_LINHA('Receita paga')).should('have.class', 'receitaPaga')
        cy.xpath(loc.EXTRATO.FN_XP_LINHA('Receita pendente')).should('have.class', 'receitaPendente')
        cy.xpath(loc.EXTRATO.FN_XP_LINHA('Despesa paga')).should('have.class', 'despesaPaga')
        cy.xpath(loc.EXTRATO.FN_XP_LINHA('Despesa pendente')).should('have.class', 'despesaPendente')
    })

    
    
    
    
    
    
    
    
    
    
    
    
    

})    