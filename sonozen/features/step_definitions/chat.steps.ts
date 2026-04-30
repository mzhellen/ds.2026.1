// features/step_definitions/chat.steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'assert';
import { CustomWorld } from './setup.js';

// Usamos o placeholder exato que colocamos no componente AIChat.tsx
const CHAT_PLACEHOLDER = "Ex: Como o magnésio ajuda a dormir?";

When('eu garanto que o campo de chat está vazio', async function (this: CustomWorld) {
  const input = this.page!.getByPlaceholder(CHAT_PLACEHOLDER);
  await input.fill('');
});

Then('o botão "Enviar" do chat deve estar desabilitado', async function (this: CustomWorld) {
  const botao = this.page!.getByRole('button', { name: 'Enviar' });
  const isDisabled = await botao.isDisabled();
  
  assert.strictEqual(
    isDisabled, 
    true, 
    'O botão Enviar deveria estar desabilitado (cinza) quando não há texto.'
  );
});

When('eu preencho o campo de chat com {string}', async function (this: CustomWorld, texto: string) {
  const input = this.page!.getByPlaceholder(CHAT_PLACEHOLDER);
  await input.fill(texto);
});

Then('o botão "Enviar" do chat deve estar habilitado', async function (this: CustomWorld) {
  const botao = this.page!.getByRole('button', { name: 'Enviar' });
  const isDisabled = await botao.isDisabled();
  
  assert.strictEqual(
    isDisabled, 
    false, 
    'O botão Enviar deveria estar habilitado (azul) após o usuário digitar algo.'
  );
});

When('eu pressiono a tecla {string} no campo de chat', async function (this: CustomWorld, tecla: string) {
  const input = this.page!.getByPlaceholder(CHAT_PLACEHOLDER);
  await input.press(tecla);
});

Given('eu intercepto a rede para simular a demora da Inteligência Artificial', async function (this: CustomWorld) {
  // O Playwright permite "sequestrar" a requisição POST que iria para a sua Server Action
  // Nós seguramos ela por 2 segundos e depois abortamos para não gastar sua API!
  await this.page!.route('**/*', async (route, request) => {
    if (request.method() === 'POST') {
      // Simula a IA "pensando" por 2 segundos
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Aborta a requisição para não gastar cota do Gemini na vida real
      await route.abort('aborted'); 
    } else {
      await route.continue();
    }
  });
});

Then('o botão do chat deve mudar para o estado {string}', async function (this: CustomWorld, estado: string) {
  // Procura pelo botão que contém o texto "Pensando..."
  const botaoPensando = this.page!.getByRole('button', { name: estado });
  
  await botaoPensando.waitFor({ state: 'visible' });
  const isVisible = await botaoPensando.isVisible();
  
  assert.strictEqual(
    isVisible, 
    true, 
    `A interface deveria mostrar o spinner e o texto '${estado}'`
  );
});

Then('o campo de chat deve ficar desabilitado', async function (this: CustomWorld) {
  const input = this.page!.getByPlaceholder(CHAT_PLACEHOLDER);
  const isDisabled = await input.isDisabled();
  
  assert.strictEqual(
    isDisabled, 
    true, 
    'O input deveria bloquear a digitação enquanto a IA está respondendo para evitar bugs.'
  );
});