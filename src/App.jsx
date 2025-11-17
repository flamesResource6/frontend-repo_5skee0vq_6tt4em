import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "";

function Predictor() {
  const [home, setHome] = useState("");
  const [away, setAway] = useState("");
  const [neutral, setNeutral] = useState(false);
  const [result, setResult] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchMatches = async () => {
    try {
      const res = await fetch(`${API_BASE}/matches?limit=10`);
      const data = await res.json();
      setMatches(data);
    } catch (e) {}
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const predict = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ home_team: home, away_team: away, neutral }),
      });
      if (!res.ok) throw new Error("Prediction failed");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const submitResult = async (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
      home_team: form.home_team.value,
      away_team: form.away_team.value,
      home_goals: Number(form.home_goals.value),
      away_goals: Number(form.away_goals.value),
      competition: form.competition.value || undefined,
    };
    try {
      const res = await fetch(`${API_BASE}/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        form.reset();
        fetchMatches();
      }
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10">
      <div className="max-w-5xl mx-auto px-4 space-y-10">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Football Match Predictor</h1>
          <p className="text-slate-400">Elo-based probabilities with draw calibration</p>
        </header>

        <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Get Prediction</h2>
          <form onSubmit={predict} className="grid sm:grid-cols-2 gap-3 items-end">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Home team</label>
              <input value={home} onChange={(e) => setHome(e.target.value)} className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 focus:outline-none" placeholder="e.g., Real Madrid" required />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Away team</label>
              <input value={away} onChange={(e) => setAway(e.target.value)} className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 focus:outline-none" placeholder="e.g., Barcelona" required />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={neutral} onChange={(e) => setNeutral(e.target.checked)} />
              Neutral venue
            </label>
            <button disabled={loading} className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50">
              {loading ? "Predicting..." : "Predict"}
            </button>
          </form>

          {error && <p className="text-red-400 mt-3">{error}</p>}

          {result && (
            <div className="mt-6 grid sm:grid-cols-3 gap-4">
              <div className="bg-slate-800/50 rounded p-4">
                <div className="text-slate-400 text-sm">Probabilities</div>
                <div className="text-2xl font-semibold">{(result.probabilities.home * 100).toFixed(1)}% Home</div>
                <div className="text-xl">{(result.probabilities.draw * 100).toFixed(1)}% Draw</div>
                <div className="text-xl">{(result.probabilities.away * 100).toFixed(1)}% Away</div>
              </div>
              <div className="bg-slate-800/50 rounded p-4">
                <div className="text-slate-400 text-sm">Fair Odds</div>
                <div className="text-2xl font-semibold">{result.fair_odds.home} Home</div>
                <div className="text-xl">{result.fair_odds.draw} Draw</div>
                <div className="text-xl">{result.fair_odds.away} Away</div>
              </div>
              <div className="bg-slate-800/50 rounded p-4">
                <div className="text-slate-400 text-sm">Ratings</div>
                <div>Home: {result.ratings.home}</div>
                <div>Away: {result.ratings.away}</div>
                <div>Home Advantage: +{result.ratings.home_advantage}</div>
              </div>
            </div>
          )}
        </section>

        <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Add Result (updates ratings)</h2>
          <form onSubmit={submitResult} className="grid sm:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Home team</label>
              <input name="home_team" className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700" required />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Away team</label>
              <input name="away_team" className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Home goals</label>
                <input name="home_goals" type="number" min="0" className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700" required />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Away goals</label>
                <input name="away_goals" type="number" min="0" className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700" required />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-slate-400 mb-1">Competition (optional)</label>
              <input name="competition" className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700" />
            </div>
            <button className="px-4 py-2 rounded bg-sky-600 hover:bg-sky-500">Save Result</button>
          </form>
        </section>

        <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Matches</h2>
          <div className="space-y-2">
            {matches.map((m) => (
              <div key={m._id} className="flex items-center justify-between bg-slate-800/40 rounded p-3">
                <div className="font-medium">{m.home_team} {m.home_goals} - {m.away_goals} {m.away_team}</div>
                <div className="text-sm text-slate-400">{m.competition || ""} {m.date ? " • " + new Date(m.date).toLocaleDateString() : ""}</div>
              </div>
            ))}
            {matches.length === 0 && <div className="text-slate-400">No matches yet. Add one above to kickstart ratings.</div>}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function App() {
  return <Predictor />;
}
