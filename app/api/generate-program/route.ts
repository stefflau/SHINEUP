export const dynamic = "force-dynamic";

// ... reste du code
import { NextRequest, NextResponse } from "next/server";
import { generateCoachProgram } from "../../lib/coachEngine";
import { createClient } from "@supabase/supabase-js";



export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
    const { formData, userId, email } = await req.json();

    if (!formData || !userId) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    const program = await generateCoachProgram(formData);

    await supabaseAdmin.from("coaching_plan").upsert([{
      user_id: userId,
      email,
      user_name: formData.name,
      age: formData.age,
      goal: formData.goal,
      program_json: program,
      calories: program.nutrition.daily_calories,
      protein: program.nutrition.protein_g,
      carbs: program.nutrition.carbs_g,
      fats: program.nutrition.fats_g,
      generated_at: new Date().toISOString(),
      status: "active",
    }]);

    return NextResponse.json({ success: true, program });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    console.error("generate-program error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}