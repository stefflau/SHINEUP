"use client";

import { useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function AuthCallback() {
  useEffect(() => {
    const handleAuth = async () => {
      const { error } = await supabase.auth.getSession();

      if (error) {
        window.location.href = "/login";
        return;
      }

      // utilisateur confirmé → redirect clean
      window.location.href = "/welcome";
    };

    handleAuth();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-yellow-400 text-2xl font-bold">
          Vérification en cours...
        </h1>
        <p className="text-zinc-400 mt-2">
          On valide ton email 🔐
        </p>
      </div>
    </main>
  );
}