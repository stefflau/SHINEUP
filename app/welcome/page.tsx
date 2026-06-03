"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Welcome() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.href = "/login";
        return;
      }

      setLoading(false);
    };

    checkUser();
  }, []);

  if (loading) return null;

  return (
  <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
    <div className="max-w-md w-full bg-zinc-900 p-8 rounded-2xl text-center">

      <h1 className="text-3xl font-bold text-yellow-400">
        Bienvenue sur SHINEUP ✨
      </h1>

      <p className="text-zinc-400 mt-4">
        Ton email a bien été confirmé.
        Tu peux maintenant accéder à ton coaching personnalisé.
      </p>

      <a href="/login">
        <button className="mt-6 w-full bg-yellow-400 text-black py-3 rounded-xl font-bold">
          Se connecter
        </button>
      </a>

    </div>
  </main>
);
}