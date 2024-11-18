import React, { useState } from 'react';
import { Box, Button, CircularProgress, Alert, Typography, Stepper, Step, StepLabel } from '@mui/material';
import mammoth from 'mammoth';
import { getDocument } from 'pdfjs-dist/webpack';
import { analyzeReport } from '../../services/aiService';

// Set worker source path
const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.mjs');
const pdfjsLib = { getDocument };

const ReportUpload = ({ onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [markingScheme, setMarkingScheme] = useState(null);
  const [studentReport, setStudentReport] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [analysisResults, setAnalysisResults] = useState(null);

  const parseDocxFile = async (file) => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target.result;
          const result = await mammoth.extractRawText({ arrayBuffer });
          resolve(result.value.trim());
        } catch (err) {
          reject(new Error('Error parsing DOCX file'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const parsePdfFile = async (file) => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target.result;
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          const pdf = await loadingTask.promise;
          let fullText = '';
          
          // Extract text from each page
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
          }
          
          resolve(fullText.trim());
        } catch (err) {
          console.error('PDF parsing error:', err);
          reject(new Error('Error parsing PDF file'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const parseFile = async (file) => {
    try {
      if (file.name.endsWith('.docx')) {
        return await parseDocxFile(file);
      } else if (file.name.endsWith('.pdf')) {
        return await parsePdfFile(file);
      }
      throw new Error('Unsupported file format');
    } catch (error) {
      console.error('Error parsing file:', error);
      throw new Error('Unable to parse document. Please ensure it is a valid file.');
    }
  };

  const handleFileChange = async (event, fileType) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.docx') && !file.name.endsWith('.pdf')) {
      setError('Please upload a .docx or .pdf file');
      return;
    }

    if (file.name.endsWith('.pdf')) {
      console.warn('PDF files may have reduced formatting accuracy');
    }

    setLoading(true);
    setError(null);

    try {
      const content = await parseFile(file);
      if (fileType === 'markingScheme') {
        setMarkingScheme({ name: file.name, content });
        setActiveStep(1);
      } else {
        setStudentReport({ name: file.name, content });
        setActiveStep(2);
      }
    } catch (err) {
      setError(err.message);
      console.error('File processing error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!markingScheme || !studentReport) {
      setError('Please upload both files first');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      console.log('Starting analysis with:', {
        markingSchemeLength: markingScheme.content.length,
        reportLength: studentReport.content.length
      });

      const result = await analyzeReport(
        studentReport.content,
        markingScheme.content,
        (progress) => {
          setProgress(progress);
          console.log('Analysis progress:', progress);
        }
      );

      console.log('Analysis result:', result);
      setAnalysisResults(result);
      setActiveStep(2);
      
      if (onSubmit) {
        await onSubmit(result);
      }
    } catch (err) {
      console.error('Analysis error in component:', err);
      setError(err.message || 'Failed to analyze report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 4, maxWidth: 800, mx: 'auto' }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {['Upload Marking Scheme', 'Upload Student Report', 'Analysis'].map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Upload Files
        </Typography>

        {/* Marking Scheme Upload */}
        <Box sx={{ mb: 3 }}>
          <input
            type="file"
            accept=".docx,.pdf"
            onChange={(e) => handleFileChange(e, 'markingScheme')}
            style={{ display: 'none' }}
            id="marking-scheme-upload"
          />
          <label htmlFor="marking-scheme-upload">
            <Button
              variant="contained"
              component="span"
              disabled={loading}
              sx={{ mr: 2 }}
            >
              {markingScheme ? 'Change Marking Scheme' : 'Upload Marking Scheme'}
            </Button>
          </label>
          {markingScheme && (
            <Typography variant="body2" color="text.secondary">
              Uploaded: {markingScheme.name}
            </Typography>
          )}
        </Box>

        {/* Student Report Upload */}
        <Box sx={{ mb: 3 }}>
          <input
            type="file"
            accept=".docx,.pdf"
            onChange={(e) => handleFileChange(e, 'studentReport')}
            style={{ display: 'none' }}
            id="student-report-upload"
          />
          <label htmlFor="student-report-upload">
            <Button
              variant="contained"
              component="span"
              disabled={loading}
              sx={{ mr: 2 }}
            >
              {studentReport ? 'Change Student Report' : 'Upload Student Report'}
            </Button>
          </label>
          {studentReport && (
            <Typography variant="body2" color="text.secondary">
              Uploaded: {studentReport.name}
            </Typography>
          )}
        </Box>

        {/* Add Analyze Button */}
        {markingScheme && studentReport && !analysisResults && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleAnalyze}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Analyze Report'}
          </Button>
        )}

        {/* Analysis Results Display */}
        {analysisResults && (
          <Box sx={{ mt: 4, p: 3, border: '1px solid #ccc', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Analysis Results
            </Typography>
            
            {/* Overall Score */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" color="primary">
                Overall Score: {analysisResults.totalScore || 0}%
              </Typography>
            </Box>

            {/* Detailed Criteria Results */}
            {analysisResults.criteria?.map((criterion, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {criterion.description}
                </Typography>
                <Typography>
                  Score: {criterion.awarded} / {criterion.points} points
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Justification: {criterion.justification}
                </Typography>
                {criterion.suggestions?.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Suggestions for improvement:
                    </Typography>
                    <ul style={{ margin: '4px 0' }}>
                      {criterion.suggestions.map((suggestion, idx) => (
                        <li key={idx}>
                          <Typography variant="body2" color="text.secondary">
                            {suggestion}
                          </Typography>
                        </li>
                      ))}
                    </ul>
                  </Box>
                )}
              </Box>
            ))}

            {/* General Feedback */}
            {analysisResults.feedback && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  General Feedback
                </Typography>
                <Typography variant="body1">
                  {analysisResults.feedback}
                </Typography>
              </Box>
            )}

            {/* Reset Button */}
            <Button
              variant="outlined"
              onClick={() => {
                setAnalysisResults(null);
                setMarkingScheme(null);
                setStudentReport(null);
                setActiveStep(0);
              }}
              sx={{ mt: 3 }}
            >
              Start New Analysis
            </Button>
          </Box>
        )}

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {/* Loading Progress */}
        {loading && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {progress === 0 ? 'Processing files...' : 
               progress === 50 ? 'Analyzing content...' : 
               'Completing analysis...'}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ReportUpload; 