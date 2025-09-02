import express from 'express';
import cors from 'cors';
import axios from 'axios';

import dotenv from 'dotenv';
dotenv.config({path: './.env'});
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const OLLAMA_URL = process.env.OLLAMA_API;
console.log(OLLAMA_URL);

const MODEL = process.env.MODEL;

app.post('/api/chat', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || prompt.trim() === '') {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  try {
    const response = await axios.post(OLLAMA_URL, {
      model: MODEL,
      prompt: prompt,
      stream: false,
    });

    // Check if response structure is correct
    if (!response.data || !response.data.response) {
      console.error('Unexpected response from Ollama:', response.data);
      return res.status(500).json({ error: 'Invalid response from Ollama API.' });
    }

    res.json({ response: response.data.response });
  } catch (error) {
    // Log detailed error info for debugging
    if (error.response) {
      // The request was made and server responded with status code out of 2xx
      console.error('Ollama API error:', error.response.status, error.response.data);
    } else if (error.request) {
      // The request was made but no response received
      console.error('No response received from Ollama API:', error.request);
    } else {
      // Something else caused an error
      console.error('Error setting up Ollama API request:', error.message);
    }
    res.status(500).json({ error: 'Failed to get response from Ollama.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});