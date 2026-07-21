"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/store/app-store";

export default function TutorialPage() {
  const lang = useAppStore((s) => s.settings.language);

  const isDe = lang === "de";
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {isDe ? "Was ist Pomodoro?" : "What is Pomodoro?"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-[var(--color-muted)]">
          <p className="text-[var(--color-foreground)]">
            {isDe
              ? "Die Pomodoro-Technik ist eine einfache Methode, konzentriert zu arbeiten: Du arbeitest in kurzen Fokus-Blöcken und machst dazwischen geplante Pausen."
              : "The Pomodoro Technique is a simple way to focus: you work in short focus blocks and take planned breaks in between."}
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              {isDe
                ? "25 Minuten Fokus"
                : "25 minutes of focus"}
            </li>
            <li>
              {isDe
                ? "5 Minuten kurze Pause"
                : "5 minutes short break"}
            </li>
            <li>
              {isDe
                ? "Nach 4 Fokus-Sessions: eine längere Pause (z.B. 15 Minuten)"
                : "After 4 focus sessions: a longer break (e.g. 15 minutes)"}
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{isDe ? "Warum funktioniert das?" : "Why does it work?"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-[var(--color-muted)]">
          <p>
            {isDe
              ? "Pomodoro kombiniert drei Dinge, die in der Lern- und Aufmerksamkeitsforschung gut belegt sind:"
              : "Pomodoro combines three mechanisms that are well supported by research on attention and learning:"}
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <span className="font-medium text-[var(--color-foreground)]">
                {isDe ? "Begrenzte Aufmerksamkeit" : "Limited attention"}
              </span>
              {isDe
                ? ": Kurze Zeitfenster reduzieren mentale Ermüdung und machen den Einstieg leichter."
                : ": Short time windows reduce fatigue and make starting easier."}
            </li>
            <li>
              <span className="font-medium text-[var(--color-foreground)]">
                {isDe ? "Pausen als Reset" : "Breaks as a reset"}
              </span>
              {isDe
                ? ": Kurze Pausen helfen, die Leistung über längere Zeit stabil zu halten."
                : ": Short breaks help keep performance stable over longer periods."}
            </li>
            <li>
              <span className="font-medium text-[var(--color-foreground)]">
                {isDe ? "Planbare Belohnung" : "Predictable reward"}
              </span>
              {isDe
                ? ": Du weißt, dass eine Pause kommt. Das senkt Widerstand und erhöht Durchhaltevermögen."
                : ": Knowing a break is coming lowers resistance and improves persistence."}
            </li>
          </ul>
          <p>
            {isDe
              ? "Wichtig: Die Zeiten sind nicht magisch. Stell sie so ein, dass du im Flow bleibst — ohne dich zu überfordern."
              : "Important: the exact times aren’t magic. Adjust them so you stay in flow without burning out."}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{isDe ? "So nutzt du Pomo" : "How to use Pomo"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-[var(--color-muted)]">
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              {isDe
                ? "Lege eine Aufgabe für heute an (optional, aber hilfreich)."
                : "Add a task for today (optional, but helpful)."}
            </li>
            <li>
              {isDe
                ? "Starte den Fokus-Timer und arbeite nur an dieser einen Sache."
                : "Start the focus timer and work on just that one thing."}
            </li>
            <li>
              {isDe
                ? "Wenn der Fokus endet: Pause machen — wirklich weg vom Bildschirm, wenn möglich."
                : "When focus ends: take the break — ideally away from the screen."}
            </li>
            <li>
              {isDe
                ? "Nach mehreren Sessions kommt die lange Pause. Nutze sie, um richtig zu regenerieren."
                : "After several sessions you’ll hit the long break. Use it to truly recover."}
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

