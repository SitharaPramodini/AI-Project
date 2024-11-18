import mammoth from 'mammoth';

export const parseDocxFile = async (file) => {
  try {
    // Handle binary format
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target.result;
          const result = await mammoth.extractRawText({ arrayBuffer });
          resolve(result.value.trim()); // Remove extra whitespace
        } catch (err) {
          reject(new Error('Error parsing document content'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };

      reader.readAsArrayBuffer(file);
    });
  } catch (error) {
    console.error('Error parsing DOCX file:', error);
    throw new Error('Unable to parse document. Please ensure it is a valid .docx file.');
  }
};
