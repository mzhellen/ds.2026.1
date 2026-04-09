// features/step_definitions/tips.steps.ts
import { When, Then } from '@cucumber/cucumber';
import assert from 'assert';
import { CustomWorld } from './setup.js'; // Note o .js

// Note que aqui NÃO precisamos do Given de login de novo, pois já está no login.steps.ts

When('eu acesso a pagina de dicas', async function (this: CustomWorld) {
  await this.page!.getByRole('link', { name: 'Dicas' }).click();
  await this.page!.waitForURL('/dicas');
});

When('eu clico na dica {string}', async function (this: CustomWorld, tituloDica) {
  await this.page!.getByRole('button', { name: tituloDica }).click();
});

Then('eu devo ver a lista de dicas carregada', async function (this: CustomWorld) {
  await this.page!.getByRole('heading', { name: 'Central de Dicas' }).waitFor({ state: 'visible' });

  const carregando = this.page!.locator('text="Buscando dicas atualizadas..."');
  await carregando.waitFor({ state: 'hidden' });
});

Then('eu devo ver a descrição da dica sobre luz azul', async function (this: CustomWorld) {
  const descricao = this.page!.locator('text=Telas de celulares e computadores emitem luz azul');

  await descricao.waitFor({ state: 'visible', timeout: 10000 });
});