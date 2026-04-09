#uc04_dicas_personalizadas
# features/tips.feature
# language: pt

Funcionalidade: Dicas Personalizadas
  Como um usuário que deseja melhorar seu sono
  Quero gerar uma rotina personalizada
  Para seguir hábitos adequados antes de dormir

Cenário: Interagir com dicas genéricas (Acordeão)
    Dado que eu estou logado com o usuário "amanda@gmail.com" e a senha "amanda123"
    Quando eu acesso a pagina de "tips"
    Então eu devo ver a lista de dicas carregada
    Quando eu clico na dica "Reduza a luz azul à noite"
    Então eu devo ver a descrição da dica sobre luz azul
    #E a descrição deve sumir se eu clicar novamente