import { useState } from "react";
import { Utensils } from "../icons.jsx";
import { C, LAKE, SANS, STONE } from "../theme.js";
import { apiFetch, appHeaders } from "../lib/storage.js";
import { macroCals } from "../lib/macros.js";

export function MacroChefModal({ remaining, onResult, onClose }) {
  const [mode, setMode] = useState("home"); // home | kitchen | restaurant
  const [input, setInput] = useState("");
  const [restaurant, setRestaurant] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState(null);
  const [parsedMeal, setParsedMeal] = useState(null); // { name, p, c, f, cal } extracted from Chef's answer for real logging

  async function askChef() {
    if (!input.trim()) return;
    setLoading(true); setError(""); setResponse(null); setParsedMeal(null);
    try {
      const macroTarget = `${Math.round(remaining.calories)} kcal, ${Math.round(remaining.protein)}g protein, ${Math.round(remaining.carbs)}g carbs, ${Math.round(remaining.fat)}g fat`;
      const prompt = mode === "kitchen"
        ? `I need to hit these remaining macros today: ${macroTarget}. I have these ingredients available: ${input}. Suggest a meal or meals I can make that gets me as close as possible to those targets. Be practical and specific with quantities.`
        : `I'm at ${restaurant || "a restaurant"} and need to hit these remaining macros today: ${macroTarget}. ${input ? `Menu context or preferences: ${input}.` : ""} Suggest specific menu items or ordering strategies to hit my targets as closely as possible.`;

      const res = await apiFetch("/api/claude", {
        method: "POST",
        headers: appHeaders(),
        body: JSON.stringify({
          model: "claude-sonnet-4-5", max_tokens: 1200,
          system: `You are a nutrition-focused personal chef. Give practical, specific meal suggestions that hit macro targets.

Respond in TWO parts:
1. A readable recommendation: the meal/order, ingredients with quantities, and brief prep tips. Format clearly.
2. At the very end of your response, on its own line, a single JSON object with your FINAL settled-on meal's totals — the exact numbers a person would log after making/ordering exactly what you recommended (if you suggested a range or an "extra step to get closer", pick the version you actually recommend as the answer). Format exactly like this, no markdown fence around it:
{"name": "short meal name", "p": grams protein, "c": grams carbs, "f": grams fat, "cal": total calories}`,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const fullText = data.content?.find(b => b.type === "text")?.text || "";

      // Pull the trailing JSON block out for structured logging; keep the rest as the readable response
      const jsonMatch = fullText.match(/\{[^{}]*"name"[^{}]*\}/);
      if (jsonMatch) {
        try {
          const meal = JSON.parse(jsonMatch[0]);
          setParsedMeal({
            name: meal.name || "Chef meal",
            p: parseFloat(meal.p) || 0,
            c: parseFloat(meal.c) || 0,
            f: parseFloat(meal.f) || 0,
            cal: parseFloat(meal.cal) || macroCals(meal.p, meal.c, meal.f),
          });
        } catch { /* fall through — parsedMeal stays null, button falls back to manual logging */ }
        setResponse(fullText.slice(0, jsonMatch.index).trim());
      } else {
        setResponse(fullText);
      }
    } catch (e) {
      setError(e.message || "Could not get suggestions. Try again.");
    }
    setLoading(false);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "flex-end", zIndex: 100 }} onClick={onClose}>
      <div style={{ background: C.sheet, width: "100%", borderRadius: "24px 24px 0 0", padding: "24px 18px 44px", borderBottom: "none", boxSizing: "border-box", maxHeight: "85vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: C.line, margin: "0 auto 20px" }} />
        <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 4, fontFamily: SANS, display: "flex", alignItems: "center", gap: 8 }}>
          <Utensils size={18} color={LAKE.forest} strokeWidth={2} /> Macro Chef
        </div>
        <div style={{ fontSize: 12, color: C.textDim, fontFamily: SANS, marginBottom: 16 }}>
          Remaining today: {Math.round(remaining.protein)}p · {Math.round(remaining.carbs)}c · {Math.round(remaining.fat)}f · {Math.round(remaining.calories)} kcal
        </div>

        {mode === "home" && (
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setMode("kitchen")} style={{ flex: 1, padding: "20px 12px", borderRadius: 14, background: C.surface2, color: C.text, cursor: "pointer", fontFamily: SANS, textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>In My Kitchen</div>
              <div style={{ fontSize: 12, color: C.textDim }}>Tell it what you have</div>
            </button>
            <button onClick={() => setMode("restaurant")} style={{ flex: 1, padding: "20px 12px", borderRadius: 14, background: C.surface2, color: C.text, cursor: "pointer", fontFamily: SANS, textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Eating Out</div>
              <div style={{ fontSize: 12, color: C.textDim }}>Get ordering advice</div>
            </button>
          </div>
        )}

        {mode !== "home" && !response && (
          <>
            {mode === "restaurant" && (
              <input value={restaurant} onChange={e => setRestaurant(e.target.value)} placeholder="Restaurant name (optional)"
                style={{ width: "100%", background: C.surface2, borderRadius: 10, padding: "11px 14px", fontSize: 16, color: C.text, outline: "none", fontFamily: SANS, boxSizing: "border-box", marginBottom: 10 }} />
            )}
            <textarea value={input} onChange={e => setInput(e.target.value)} rows={3}
              placeholder={mode === "kitchen" ? "e.g. chicken breast, rice, eggs, spinach, olive oil" : "e.g. menu has salads, bowls, grilled proteins"}
              style={{ width: "100%", background: C.surface2, borderRadius: 10, padding: "11px 14px", fontSize: 16, color: C.text, outline: "none", resize: "none", fontFamily: SANS, boxSizing: "border-box", marginBottom: 10 }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setMode("home")} style={{ padding: "12px 16px", borderRadius: 10, background: "transparent", color: C.textMid, fontSize: 12, cursor: "pointer", fontFamily: SANS }}>Back</button>
              <button onClick={askChef} disabled={loading || !input.trim()}
                style={{ flex: 1, padding: "12px", borderRadius: 10, background: loading ? C.surface2 : STONE.primary, border: "none", color: loading ? C.textDim : C.ink, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
                {loading ? "Thinking…" : "Ask Chef"}
              </button>
            </div>
            {error && <div style={{ marginTop: 10, fontSize: 12, color: C.red, fontFamily: SANS }}>{error}</div>}
          </>
        )}

        {response && (
          <>
            <div style={{ padding: "14px", borderRadius: 12, background: C.surface2, fontSize: 15, color: C.text, fontFamily: SANS, lineHeight: 1.6, whiteSpace: "pre-wrap", marginBottom: 12 }}>
              {response}
            </div>
            {parsedMeal && (
              <div style={{ padding: "12px 14px", borderRadius: 12, background: LAKE.sky + "14", fontSize: 12, color: LAKE.sky, fontFamily: SANS, marginBottom: 12 }}>
                Will log: <strong>{parsedMeal.name}</strong> — {parsedMeal.cal} kcal · {parsedMeal.p}p / {parsedMeal.c}c / {parsedMeal.f}f
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setResponse(null); setParsedMeal(null); setInput(""); }} style={{ flex: 1, padding: "12px", borderRadius: 10, background: "transparent", color: C.textMid, fontSize: 12, cursor: "pointer", fontFamily: SANS }}>Ask Again</button>
              <button onClick={() => onResult(parsedMeal
                ? { name: parsedMeal.name, p: parsedMeal.p, c: parsedMeal.c, f: parsedMeal.f, cal: parsedMeal.cal }
                : { name: mode === "restaurant" ? (restaurant || "Restaurant meal") : "Kitchen meal", p: 0, c: 0, f: 0, cal: 0, note: "Logged from Macro Chef — edit macros manually" })}
                style={{ flex: 1, padding: "12px", borderRadius: 10, background: STONE.primary, border: "none", color: C.ink, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
                {parsedMeal ? "Log This Meal" : "Log Placeholder"}
              </button>
            </div>
            <div style={{ fontSize: 12, color: C.textDim, fontFamily: SANS, marginTop: 8, textAlign: "center" }}>
              {parsedMeal
                ? "Macros are Chef's estimate for what it recommended — double-check against what you actually make/order."
                : "Chef gives suggestions, not exact macros — log the real meal manually once you know what you ate."}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
