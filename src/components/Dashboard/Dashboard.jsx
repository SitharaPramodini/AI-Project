import React, { useState } from 'react';
import ReportUpload from '../ReportUpload/ReportUpload';
import MarkingScheme from '../MarkingScheme/MarkingScheme';
import GradingResult from '../GradingResult/GradingResult';
import { analyzeReport } from '../../services/aiService';

const Dashboard = () => {
  const [markingScheme, setMarkingScheme] = useState([
    { description: 'Introduction', points: 10 },
    { description: 'Methodology', points: 20 },
    { description: 'Results', points: 30 },
    { description: 'Conclusion', points: 20 },
    { description: 'References', points: 20 },
  ]);
  
  const [gradingResult, setGradingResult] = useState(null);
  const [error, setError] = useState(null);

  const handleReportSubmit = async (text, setProgress) => {
    try {
      setError(null);
      const result = await analyzeReport(text, markingScheme, setProgress);
      setGradingResult(result);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="dashboard">
      <h1>Assignment Grading System</h1>
      {error && <div className="error-message">{error}</div>}
      <div className="dashboard-grid">
        <MarkingScheme 
          scheme={markingScheme} 
          onSchemeChange={(index, field, value) => {
            const newScheme = [...markingScheme];
            newScheme[index][field] = value;
            setMarkingScheme(newScheme);
          }}
        />
        <ReportUpload onSubmit={handleReportSubmit} />
        {gradingResult && <GradingResult result={gradingResult} />}
      </div>
    </div>
  );
};

export default Dashboard; 