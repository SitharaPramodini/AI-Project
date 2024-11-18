import React from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import ReportUpload from './components/ReportUpload/ReportUpload';

const theme = createTheme();

function App() {
  const handleAnalysisComplete = (result) => {
    console.log('Analysis complete:', result);
    // Handle the analysis results here
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <ReportUpload onSubmit={handleAnalysisComplete} />
      </Container>
    </ThemeProvider>
  );
}

export default App;
