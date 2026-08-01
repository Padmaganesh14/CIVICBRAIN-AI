// Mathematical Budget Allocation Engine Formula
// Priority Score = 0.35 * Volume + 0.30 * Severity + 0.20 * Population Impact + 0.10 * Historical Trend + 0.05 * Repair Cost

export function calculateDepartmentScore(dept) {
  const { volume, severityScore, populationImpact, historicalTrend, repairCostFactor } = dept;
  
  const score = (0.35 * volume) + 
                (0.30 * severityScore) + 
                (0.20 * populationImpact) + 
                (0.10 * historicalTrend) + 
                (0.05 * repairCostFactor);
  return score;
}

export function calculateBudgetAllocations(departments, totalBudgetLakhs = 200) {
  const scoredDepts = departments.map(d => {
    const score = calculateDepartmentScore(d);
    return { ...d, score };
  });

  const totalScore = scoredDepts.reduce((sum, d) => sum + d.score, 0);

  return scoredDepts.map(d => {
    const rawAllocation = (d.score / (totalScore || 1)) * totalBudgetLakhs;
    const allocatedBudgetLakhs = Math.round(rawAllocation * 10) / 10;
    
    // Impact calculation
    const currentLakhs = d.currentBudgetLakhs || Math.round(allocatedBudgetLakhs * 0.7);
    const diffLakhs = Math.round((allocatedBudgetLakhs - currentLakhs) * 10) / 10;
    const expectedComplaintReduction = Math.min(45, Math.round((allocatedBudgetLakhs / (currentLakhs || 1)) * 22));
    const expectedResolutionSpeedup = Math.min(35, Math.round(expectedComplaintReduction * 0.7));

    return {
      ...d,
      score: Math.round(d.score * 10) / 10,
      allocatedBudgetLakhs,
      currentBudgetLakhs: currentLakhs,
      diffLakhs,
      expectedComplaintReduction,
      expectedResolutionSpeedup
    };
  });
}
