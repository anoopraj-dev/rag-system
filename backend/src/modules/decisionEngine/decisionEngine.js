function computeFinalScore(item, queryVector, query) {
  const relevance = item.score || 0;

  const text = item.chunk.toLowerCase();
  const q = query.toLowerCase();

  const keywordOverlap = q
    .split(" ")
    .filter(word => text.includes(word)).length / (q.split(" ").length || 1);

  const titleBoost = item.metadata?.title &&
    q.includes(item.metadata.title.toLowerCase()) ? 0.2 : 0;

  const coverage = keywordOverlap + titleBoost;

  return (relevance * 0.6) + (coverage * 0.3);
}

function decisionEngine(query, results) {
  if (!results || results.length === 0) {
    return {
      type: "no_result",
      answer: "No relevant information found.",
      results: []
    };
  }

  const scored = results.map(r => ({
    ...r,
    finalScore: computeFinalScore(r, null, query)
  }));

  scored.sort((a, b) => b.finalScore - a.finalScore);

  const best = scored[0];
  const support = scored.slice(1, 4);

  const confidence =
    scored.length > 1
      ? best.finalScore - scored[1].finalScore
      : 1;

  return {
    type:
      confidence > 0.2
        ? "high_confidence"
        : "low_confidence",

    answer: best.chunk,

    supportingPoints: support.map(s => s.chunk),

    confidence,

    results: scored.map(r => ({
      id: r.id,
      chunk: r.chunk,
      score: r.finalScore,
      metadata: r.metadata
    }))
  };
}

export default decisionEngine;
