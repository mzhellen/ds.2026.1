"use client";

import { useState, useEffect } from "react";
import { perguntarParaIA } from "../actions";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

// Importando os componentes modulares
import Sidebar from "../../components/Sidebar";
import MobileNav from "../../components/MobileNav";
import Header from "../../components/Header";
import AIChat from "../../components/AIChat";
import HistoryList from "../../components/HistoryList";


interface HistoricoItem {
  id: string;
  pergunta: string;
  resposta: string;
  created_at: string;
}

export default function PaginaPrincipal() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [respostaAtual, setRespostaAtual] = useState("");
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [carregandoIA, setCarregandoIA] = useState(false);

  useEffect(() => {
    async function inicializar() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
        } else {
          setUsuario(user);
          carregarHistorico(user.id);
          setLoading(false);
        }
      } catch (err) {
        console.error("Erro na inicialização:", err);
        setLoading(false);
      }
    }
    inicializar();
  }, [router]);

  async function carregarHistorico(userId: string) {
    const { data, error } = await supabase
      .from("historico")
      .select("*")
      .eq("usuario_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) setHistorico(data);
  }

  async function enviarPergunta() {
    if (!input || !usuario) return;

    setCarregandoIA(true);
    try {
      const textoIA = await perguntarParaIA(input);
      setRespostaAtual(textoIA);

      const { error } = await supabase.from("historico").insert([
        { pergunta: input, resposta: textoIA, usuario_id: usuario.id },
      ]);

      if (error) throw error;

      setInput("");
      carregarHistorico(usuario.id);
    } catch (err) {
      console.error("Erro:", err);
      alert("Erro ao processar sua solicitação.");
    } finally {
      setCarregandoIA(false);
    }
  }

  async function deslogar() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Erro ao sair: " + error.message);
    } else {
      router.push("/login");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-gray-950 text-white font-sans">
            
            {/* Layout Externo: Barra Lateral */}
            <Sidebar/>
      
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
      
      {/* Layout Externo: Barra Lateral */}
      <Sidebar />

      {/* Conteúdo Principal Central */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <div className="container py-6 md:py-10 max-w-4xl mx-auto px-6 space-y-8">
          

          <AIChat 
            input={input} 
            setInput={setInput} 
            enviarPergunta={enviarPergunta} 
            carregandoIA={carregandoIA} 
            respostaAtual={respostaAtual} 
          />

          <hr className="border-gray-800" />

          <HistoryList historico={historico} />

        </div>
      </main>

      {/* Layout Externo: Navegação Mobile */}
      <MobileNav />

    </div>
  );
}