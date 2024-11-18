import React from 'react';

const GradingResult = ({ result }) => {
  const { criteria, totalScore, missingElements, feedback } = result;
  const maxScore = criteria.reduce((sum, criterion) => sum + criterion.points, 0);
  const percentage = ((totalScore / maxScore) * 100).toFixed(1);

  return (
    <div className="grading-result">
      <h2>Grading Result</h2>
      
      <div className="score-summary">
        <h3>Total Score: {totalScore}/{maxScore} ({percentage}%)</h3>
      </div>

      <div className="criteria-scores">
        <h3>Criteria Breakdown:</h3>
        <table>
          <thead>
            <tr>
              <th>Criterion</th>
              <th>Score</th>
              <th>Max Points</th>
              <th>Feedback</th>
            </tr>
          </thead>
          <tbody>
            {criteria.map((criterion, index) => (
              <tr key={index}>
                <td>{criterion.description}</td>
                <td>{criterion.achieved}</td>
                <td>{criterion.points}</td>
                <td>{criterion.feedback}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="missing-elements">
        <h3>Missing Elements:</h3>
        <ul>
          {missingElements.map((element, index) => (
            <li key={index}>{element}</li>
          ))}
        </ul>
      </div>

      <div className="overall-feedback">
        <h3>Overall Feedback:</h3>
        <p>{feedback}</p>
      </div>
    </div>
  );
};

export default GradingResult;
