// features/step_definitions/login.steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'assert';
import { CustomWorld } from './setup.js'; // Importe a tipagem (o Node precisa do .js aqui na importação TS)

Given('que eu estou na página de login', async function (this: CustomWorld) {
  // ATENÇÃO: Use this.page! (A exclamação diz ao TS que a página existe)
  await this.page!.goto('http://localhost:3000/login');
});

Given('que eu estou logado com o usuário {string} e a senha {string}', async function (this: CustomWorld, email, senha) {
  await this.page!.goto('http://localhost:3000/login');
  
  await this.page!.locator('input[type="email"]').fill(email);
  await this.page!.locator('input[type="password"]').fill(senha);
  
  await this.page!.getByRole('button', { name: 'Acessar Conta' }).click();
  
  await this.page!.waitForURL('**/home', { timeout: 10000 });
});

When('eu preencho o e-mail com {string} e a senha com {string}', async function (this: CustomWorld, email, senha) {
  await this.page!.locator('input[type="email"]').fill(email);
  await this.page!.locator('input[type="password"]').fill(senha);
});

When(/^(?:eu )?clico no botão "([^"]*)"$/, async function (this: CustomWorld, textoBotao) {
  await this.page!.getByRole('button', { name: textoBotao }).click();
});

When('eu acesso a pagina de {string}', async function (this: CustomWorld, pagina) {
  await this.page!.goto(`http://localhost:3000/${pagina}`);
});

Then('eu devo ser redirecionado para a página home', async function (this: CustomWorld) {
  await this.page!.waitForURL('http://localhost:3000/home');
  assert.strictEqual(this.page!.url(), 'http://localhost:3000/home');
});

Then('eu devo ver uma mensagem de erro', async function (this: CustomWorld) {
  for (let i = 0; i < 10; i++) {
    if (this.mensagemAlerta) break;
    await this.page!.waitForTimeout(500);
  }

  assert(
    this.mensagemAlerta.includes("Erro"),
    `Esperava um erro, mas recebeu: ${this.mensagemAlerta}`
  );
});

Then('eu devo ser redirecionado para a página de login', async function (this: CustomWorld) {
  await this.page!.waitForURL('http://localhost:3000/login');
  assert.strictEqual(this.page!.url(), 'http://localhost:3000/login');
});