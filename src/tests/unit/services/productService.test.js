const { expect } = require('chai');
const { describe } = require('mocha');
const sinon = require('sinon');
const Product = require('../../../database/models/Product');
const productService = require('../../../services/productService');
const { newProductMock, newProductPayload, allProductsMock, searchedProductMock, updatedProductMock } = require('../../mocks/Product');
const { updateSalePayload } = require('../../mocks/Sale');

describe('Testa a service productService', () => {
  describe('quando é criado um novo produto', () => {
    describe('e o corpo da requisição é válido', () => {
      before(() => {
        sinon.stub(Product, 'createProduct').resolves(newProductMock)
      });

      after(() => {
        sinon.restore();
      });
      
      it('é retornado um objeto', async () => {
        const sut = await productService.createProduct(newProductPayload)

        expect(sut).to.be.an('object')
      });

      it('o objeto retornado possui as mesmas chaves da requisição, além de uma chave "id"',
      async () => {
        const sut = await productService.createProduct(newProductPayload)

        expect(sut).to.have.all.keys('id', 'name', 'quantity')
      });
    });
    
    describe('e o corpo da requisição é inválido', () => {
      before(() => {
        sinon.stub(Product, 'createProduct').resolves(newProductMock)
      });

      after(() => {
        sinon.restore();
      });
      
      it('é disparado um erro de validação Joi', async () => {
        try {
          await productService.createProduct({})
        } catch (err) {
          
          expect(err.isJoi).to.be.true
        }
      });
    })
  });

  describe('quando são buscados todos os produtos com sucesso', () => {
    describe('e existem cadastros no banco de dados', () => {
      before(() => {
        sinon.stub(Product, 'getProducts').resolves(allProductsMock)
      });
  
      after(() => {
        sinon.restore();
      });

      it('é retornado um array de objetos', async () => {
        const sut = await productService.getProducts()

        expect(sut).to.be.an('array')
        expect(sut[0]).to.be.an('object')
      });
  
      it('os objetos contém as chaves: "id", "name" e "quantity"', async () => {
        const sut = await productService.getProducts()

        expect(sut[0]).to.have.all.keys('id', 'name', 'quantity')
      });
    });

    describe('e não existem cadastros no banco de dados', () => {
      before(() => {
        sinon.stub(Product, 'getProducts').resolves([])
      });
  
      after(() => {
        sinon.restore();
      });

      it('é retornado um array vazio', async () => {
        const sut = await productService.getProducts()

        expect(sut).to.be.an('array')
        expect(sut).to.be.empty
      });
    });
  });

  describe('quando é buscado um produto em específico', () => {
    describe('e o produto está cadastrado no banco de dados', async () => {
      before(() => {
        sinon.stub(Product, 'getProductById').resolves([searchedProductMock])
      })
  
      after(() => {
        sinon.restore()
      })

      it('é retornado o produto pesquisado', async () => {
        const sut = await productService.getProductById(1)

        expect(sut).to.be.deep.equal(searchedProductMock)
      });

      it('o produto possui as chaves "id", "name" e "quantity"', async () => {
        const sut = await productService.getProductById(1)

        expect(sut).to.have.all.keys('id', 'name', 'quantity')
      });
    });

    describe('mas o produto não está cadastrado no banco de dados', async () => {
      before(() => {
        sinon.stub(Product, 'getProductById').resolves([[]])
      })
  
      after(() => {
        sinon.restore()
      })
      
      it('é disparado um erro catalogado ProductNotFound', async () => {
        try {
          await productService.getProductById(1)
        } catch(err) {

          expect(err.isCataloged).to.be.true;
          expect(err.type).to.be.equal('ProductNotFound');
        }
      });
    });
  });

  describe('quando é atualizado um produto em específico', () => {
    describe('e o produto está cadastrado no banco de dados', () => {
      before(() => {
        sinon.stub(Product, 'editProduct').resolves({ affectedRows: 1 });
      });

      after(() => {
        sinon.restore();
      });
      
      it('é retornado o objeto atualizado', async () => {
        const sut = await productService.editProduct(1, {
          name: 'Machado de Thor',
          quantity: 15
        })

        expect(sut).to.be.an('object')
        expect(sut).to.be.deep.equal(updatedProductMock)
      });
    });

    describe(`e o produto está cadastrado no banco de dados, mas o corpo
    da requisição é invalido`, async () => {
      before(() => {
        sinon.stub(Product, 'editProduct').resolves({ affectedRows: 0 });
      });

      after(() => {
        sinon.restore();
      });

      it('é disparado um erro de validação Joi', async () => {
        try {
          await productService.editProduct(1, {})
        } catch (err) {
          
          expect(err.isJoi).to.be.true
        }
      });
    })

    describe('e o produto não está cadastrado no banco de dados', () => {
      before(() => {
        sinon.stub(Product, 'editProduct').resolves({ affectedRows: 0 });
      });

      after(() => {
        sinon.restore();
      });
      
      it('é disparado um erro catalogado do tipo ProductNotFound', async () => {
        try {
          await productService.editProduct(1, {
            name: 'Machado de Thor',
            quantity: 15
          })
        } catch(err) {

          expect(err.isCataloged).to.be.true;
          expect(err.type).to.be.equal('ProductNotFound');
        }
      });
    });
  });

  describe('quando um produto em específico é deletado', () => {
    describe('e o produto está cadastrado no banco de dados', () => {
      before(() => {
        sinon.stub(Product, 'deleteProduct').resolves({ affectedRows: 1 });
      });

      after(() => {
        sinon.restore();
      });
      
      it('é retornado true', async () => {
        const sut = await productService.deleteProduct(1)

        expect(sut).to.be.true
      });
    });

    describe('e o produto não está cadastrado no banco de dados', () => {
      before(() => {
        sinon.stub(Product, 'deleteProduct').resolves({ affectedRows: 0 });
      });

      after(() => {
        sinon.restore();
      });
      
      it('é disparado um erro catalogado do tipo ProductNotFound', async () => {
        try {
          await productService.deleteProduct(1)
        } catch(err) {

          expect(err.isCataloged).to.be.true;
          expect(err.type).to.be.equal('ProductNotFound');
        }
      });
    });
  });

  describe('quando é verificada a quantidade de um produto', () => {
    describe('e o produto está cadastrado assim como a quantidade de vendas não excede o estoque', () => {
      before(() => {
        sinon.stub(Product, 'getProductById').resolves([{ ...searchedProductMock, quantity: 20 }])
        sinon.stub(Product, 'editProduct').resolves([{ affectedRows: 1 }, undefined]);
      });
      
      after(() => {
        sinon.restore();
      });

      it('é retornado true', async () => {
        const sut = await productService.verifyProductQuantity(updateSalePayload[0]);
  
        expect(sut).to.be.true;
      });
    });

    describe('e a quantidade de produtos vendidos, excede o estoque', () => {
      before(() => {
        sinon.stub(Product, 'getProductById').resolves([{ ...searchedProductMock, quantity: 0 }])
      });
      
      after(() => {
        sinon.restore();
      });
      
      it('é disparado um erro catalogado do tipo InvalidQuantity', async () => {        
        try {
          await productService.verifyProductQuantity(updateSalePayload[0]);
        } catch (err) {

          expect(err.isCataloged).to.be.true;
          expect(err.type).to.be.equal('InvalidQuantity');
        }
      });
    });
  });
});