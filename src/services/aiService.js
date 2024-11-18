import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const analyzeReport = async (reportText, markingSchemeText, onProgress) => {
  try {
    console.log('Starting analysis...');
    onProgress(30);

    // Validate inputs
    if (!reportText || !markingSchemeText) {
      throw new Error('Missing report or marking scheme text');
    }

    console.log('Sending request to OpenAI...');
    onProgress(50);

    const prompt = `
Analyze this student report according to the marking scheme provided.
Your response must be in valid JSON format with the following structure:
{
  "criteria": [
    {
      "description": "criterion description",
      "points": 10,
      "awarded": 8,
      "justification": "explanation of score",
      "suggestions": ["suggestion 1", "suggestion 2"]
    }
  ],
  "totalScore": 80,
  "feedback": "overall feedback"
}

Marking Scheme:
${markingSchemeText}

Student Report:
${reportText}
`;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert academic assessor. Analyze reports and provide structured feedback in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    console.log('Received response from OpenAI');
    onProgress(75);

    const responseText = completion.choices[0].message.content;
    console.log('Raw response:', responseText);

    // Parse JSON response
    let analysisResult;
    try {
      analysisResult = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.log('Failed to parse response:', responseText);
      throw new Error('Invalid response format from analysis service');
    }

    onProgress(90);

    // Validate the response structure
    if (!analysisResult.criteria || !analysisResult.totalScore || !analysisResult.feedback) {
      throw new Error('Incomplete analysis result structure');
    }

    // Add additional metrics
    const result = {
      ...analysisResult,
      wordCount: reportText.split(/\s+/).length,
      characterCount: reportText.replace(/\s/g, '').length,
      timestamp: new Date().toISOString()
    };

    console.log('Analysis complete:', result);
    onProgress(100);

    return result;

  } catch (error) {
    console.error('Analysis error:', error);
    if (error.response) {
      console.error('OpenAI API error:', error.response.data);
    }
    throw new Error(`Analysis failed: ${error.message}`);
  }
};
