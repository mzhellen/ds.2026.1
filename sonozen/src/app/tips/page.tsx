// src/app/dicas/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";
import MobileNav from "../../components/MobileNav";

// 1. Tipamos o formato de dados que esperamos receber do banco
interface Dica {
  id: number;
  categoria: string;
  titulo: string;
  descricao: string;
  icone_nome: string;
}

// 2. Um "Dicionário" de ícones. Comparamos o texto do banco para renderizar o SVG certo.
const renderizarIcone = (nome: string) => {
  const propsBase = {
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (nome) {
    case "moon":
      return <svg {...propsBase} className="w-5 h-5 text-blue-400"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>;
    case "coffee":
      return <svg {...propsBase} className="w-5 h-5 text-orange-400"><path d="M10 2v2"></path><path d="M14 2v2"></path><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"></path><path d="M6 2v2"></path></svg>;
    case "thermometer":
      return <svg {...propsBase} className="w-5 h-5 text-teal-400"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"></path></svg>;
    case "brain":
      return <svg {...propsBase} className="w-5 h-5 text-pink-400"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"></path><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"></path><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"></path><path d="M3.477 10.896a4 4 0 0 1 .585-.396"></path><path d="M19.938 10.5a4 4 0 0 1 .585.396"></path><path d="M6 18a4 4 0 0 1-1.967-.516"></path><path d="M19.967 17.484A4 4 0 0 1 18 18"></path></svg>;
    case "routine":
      return <svg {...propsBase} className="w-5 h-5 text-purple-400"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path><circle cx="12" cy="12" r="3"></circle></svg>;
    case "wind":
      return <svg {...propsBase} className="w-5 h-5 text-green-400"><path d="M12.8 19.6A2 2 0 1 0 14 16H2"></path><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"></path><path d="M9.8 4.4A2 2 0 1 1 11 8H2"></path></svg>;
    default:
      // Um ícone padrão caso a string do banco não bata com nenhuma acima (uma estrelinha)
      return <svg {...propsBase} className="w-5 h-5 text-yellow-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
  }
};

export default function DicasPage() {
  const [dicas, setDicas] = useState<Dica[]>([]);
  const [loading, setLoading] = useState(true);
  const [dicaAberta, setDicaAberta] = useState<number | null>(null);

  // 3. Buscar os dados quando a tela carregar
  useEffect(() => {
    async function buscarDicas() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return; // Se não tiver logado, sai

        // PASSO 1: Verifica se o usuário tem dicas personalizadas
        const { data: dicasPersonalizadas, error: erroUsuario } = await supabase
          .from("usuario_dicas")
          .select(`
            dica_id,
            dicas (id, categoria, titulo, descricao, icone_nome)
          `)
          .eq("usuario_id", user.id);

        if (erroUsuario) {
          console.error("Erro ao buscar vínculo do usuário:", erroUsuario.message);
          return;
        }

        // PASSO 2: A Decisão
        if (dicasPersonalizadas && dicasPersonalizadas.length > 0) {
          // OPÇÃO A: O usuário TEM dicas personalizadas.
          // O Supabase retorna os dados meio aninhados quando fazemos 'join', então mapeamos para ficar limpo:
          const formatado = dicasPersonalizadas.map((vinculo: any) => vinculo.dicas);
          setDicas(formatado);
          
        } else {
          // OPÇÃO B: O usuário NÃO TEM dicas (Ainda não gerou a rotina).
          // Então, buscamos as dicas que são marcadas como genéricas!
          const { data: dicasGenericas, error: erroDicas } = await supabase
            .from("dicas")
            .select("*")
            .eq("is_generica", true) // <-- O FILTRO MÁGICO AQUI
            .order("id", { ascending: true });

          if (erroDicas) {
            console.error("Erro ao buscar dicas genéricas:", erroDicas.message);
            return;
          }

          if (dicasGenericas) {
            setDicas(dicasGenericas);
          }
        }

      } catch (err) {
        console.error("Falha inesperada:", err);
      } finally {
        setLoading(false);
      }
    }

    buscarDicas();
  }, []);

  const toggleDica = (id: number) => {
    setDicaAberta(dicaAberta === id ? null : id);
  };

   if (loading) {
    return (

      <div className="min-h-screen flex flex-col md:flex-row bg-gray-950 text-white font-sans">
      
      {/* Layout Externo: Barra Lateral */}
      <Sidebar />

      {/* Conteúdo Principal Central */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <div className="container py-6 md:py-10 max-w-4xl mx-auto px-6 space-y-8">
          <hr className="border-gray-800" />
            <div className="min-h-screen bg-gray-950 flex items-center justify-center text-blue-500 font-bold text-xl">
            Carregando Sonozen...
            </div>
        </div>
      </main>

      {/* Layout Externo: Navegação Mobile */}
      <MobileNav />

    </div>

      
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-950 text-white font-sans">
      <Sidebar />

      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <div className="container py-6 md:py-10 max-w-3xl mx-auto px-6 space-y-8">
          
          <div>
            <h2 className="text-3xl font-bold mb-2 text-white">Central de Dicas</h2>
            <p className="text-gray-400 text-sm">Aprenda práticas que ajudam o cérebro a relaxar</p>
          </div>

          {/* Controle de Estado Visual (Loading / Vazio / Lista) */}
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20 text-blue-500 animate-pulse">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2"><path d="M12 3v3"></path><path d="M18.36 5.64 16.24 7.76"></path><path d="M21 12h-3"></path><path d="M18.36 18.36 16.24 16.24"></path><path d="M12 21v-3"></path><path d="M5.64 18.36 7.76 16.24"></path><path d="M3 12h3"></path><path d="M5.64 5.64 7.76 7.76"></path></svg>
               <p>Buscando dicas atualizadas...</p>
            </div>
          ) : dicas.length === 0 ? (
            <div className="p-8 text-center bg-gray-900 border border-gray-800 rounded-xl text-gray-500">
               <p>Nenhuma dica encontrada no banco de dados.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dicas.map((dica) => {
                const isOpen = dicaAberta === dica.id;

                return (
                  <div key={dica.id} className="rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors overflow-hidden">
                    <button 
                      onClick={() => toggleDica(dica.id)}
                      className="w-full text-left p-5 flex items-center justify-between focus:outline-none focus:bg-gray-800/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0 shadow-inner">
                          {/* Chamamos a função para desenhar o ícone */}
                          {renderizarIcone(dica.icone_nome)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] uppercase tracking-wider text-blue-500 font-semibold">
                            {dica.categoria}
                          </span>
                          <h4 className="font-semibold text-base text-gray-200 mt-1">
                            {dica.titulo}
                          </h4>
                        </div>
                      </div>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                        className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isOpen ? "rotate-180 text-blue-400" : "rotate-0"}`}
                      >
                        <path d="m6 9 6 6 6-6"></path>
                      </svg>
                    </button>
                    <div className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-48 opacity-100 pb-5" : "max-h-0 opacity-0"}`}>
                      <p className="text-gray-400 text-sm pl-20 pr-6 leading-relaxed">
                        {dica.descricao}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </main>
      <MobileNav />
    </div>
  );
}