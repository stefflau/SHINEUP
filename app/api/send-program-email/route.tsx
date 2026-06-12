
import { NextRequest, NextResponse } from "next/server";
import { Resend } from 'resend';

const resend = new Resend('re_LoQmxGYg_4BdekKiiYxqz1AjPjMW3ekVb');

export async function POST(req: NextRequest) {
  try {
    const { to, subject, html } = await req.json();

    const { error } = await resend.emails.send({
      from: "SHINEUP Coach <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}