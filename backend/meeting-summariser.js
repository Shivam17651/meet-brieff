const natural = require('natural');
const fs = require('fs');

// Configuration
const MIN_SENTENCE_LENGTH = 10;
const SUMMARY_PERCENT = 0.3; // Percentage of original content to include in summary

/**
 * Meeting Transcript Summarizer
 * This script takes a meeting transcript text file and generates a comprehensive summary
 */

// Load and process the transcript
function summarizeMeeting(filePath) {
  try {
    // Read the transcript file
    const transcript = fs.readFileSync(filePath, 'utf8');
    
    // Basic preprocessing
    const cleanedTranscript = transcript
      .replace(/\r\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Split into sentences
    const tokenizer = new natural.SentenceTokenizer();
    let sentences = tokenizer.tokenize(cleanedTranscript);
    
    // Filter out very short sentences which are likely not meaningful
    sentences = sentences.filter(sentence => sentence.split(' ').length >= MIN_SENTENCE_LENGTH);
    
    // Extract keywords using TF-IDF
    const TfIdf = natural.TfIdf;
    const tfidf = new TfIdf();
    
    // Add each sentence as a document for TF-IDF analysis
    sentences.forEach(sentence => {
      tfidf.addDocument(sentence);
    });
    
    // Score sentences based on keyword importance
    const sentenceScores = sentences.map((sentence, index) => {
      let score = 0;
      const words = sentence.split(' ');
      
      words.forEach(word => {
        // Get TF-IDF score for this word in this sentence
        const measurement = tfidf.tfidf(word, index);
        score += measurement;
      });
      
      // Normalize by sentence length to avoid bias toward longer sentences
      return {
        text: sentence,
        score: score / words.length,
        position: index
      };
    });
    
    // Sort sentences by score
    const rankedSentences = [...sentenceScores].sort((a, b) => b.score - a.score);
    
    // Select top sentences for summary (based on SUMMARY_PERCENT)
    const numSentencesToInclude = Math.ceil(sentences.length * SUMMARY_PERCENT);
    const topSentences = rankedSentences.slice(0, numSentencesToInclude);
    
    // Sort sentences by original position to maintain context flow
    topSentences.sort((a, b) => a.position - b.position);
    
    // Generate the summary
    const summary = topSentences.map(item => item.text).join(' ');
    
    // Extract key topics
    const keyTopics = extractKeyTopics(transcript);
    
    // Format the final summary
    const finalSummary = formatSummary(summary, keyTopics);
    
    return finalSummary;
    
  } catch (error) {
    console.error('Error summarizing meeting:', error);
    return null;
  }
}

// Extract key topics from the transcript
function extractKeyTopics(text) {
  const TfIdf = natural.TfIdf;
  const tfidf = new TfIdf();
  
  // Add the whole transcript as a document
  tfidf.addDocument(text);
  
  // Get the top terms
  const topTerms = [];
  tfidf.listTerms(0).slice(0, 10).forEach(item => {
    topTerms.push(item.term);
  });
  
  return topTerms;
}

// Format the summary with sections
function formatSummary(summaryText, keyTopics) {
  const summary = {
    summary: summaryText,
    keyTopics: keyTopics,
    timestamp: new Date().toISOString(),
    wordCount: summaryText.split(' ').length
  };
  
  return summary;
}

// Command line interface
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('Usage: node meeting-summarizer.js <path-to-transcript>');
    console.log('Example: node meeting-summarizer.js ./transcripts/meeting.txt');
    return;
  }
  
  const transcriptPath = args[0];
  const summary = summarizeMeeting(transcriptPath);
  
  if (summary) {
    console.log('\n=== MEETING SUMMARY ===\n');
    console.log(summary.summary);
    console.log('\n=== KEY TOPICS ===\n');
    console.log(summary.keyTopics.join(', '));
    console.log('\nWord count:', summary.wordCount);
    console.log('Generated on:', new Date(summary.timestamp).toLocaleString());
    
    // Optionally save to file
    const outputPath = transcriptPath.replace('.txt', '-summary.json');
    fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2));
    console.log(`\nSummary saved to ${outputPath}`);
  }
}

// Run the script
main();