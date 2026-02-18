/**
 * Content Generator Provider
 * 
 * Architecture for generating flashcards, summaries, and questions from text.
 * Includes a mock/heuristic provider that works without LLM.
 * Can be extended to use OpenAI or other LLMs via environment configuration.
 */

import { GeneratedFlashcard, GeneratedQuestion, GeneratedSummary, ContentGenerationResult } from '@/integrations/supabase/types';

// Provider interface
export interface ContentGeneratorProvider {
  generateContent(text: string, subject?: string): Promise<ContentGenerationResult>;
  generateSummary(text: string): Promise<GeneratedSummary>;
  generateFlashcards(text: string, count?: number): Promise<GeneratedFlashcard[]>;
  generateQuestions(text: string, count?: number): Promise<GeneratedQuestion[]>;
}

// Mock/Heuristic Provider - works without LLM
class MockContentGenerator implements ContentGeneratorProvider {
  
  async generateContent(text: string, subject?: string): Promise<ContentGenerationResult> {
    const [summary, flashcards, questions] = await Promise.all([
      this.generateSummary(text),
      this.generateFlashcards(text, 5),
      this.generateQuestions(text, 3)
    ]);
    
    return { summary, flashcards, questions };
  }

  async generateSummary(text: string): Promise<GeneratedSummary> {
    // Extract key sentences and create structured summary
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 4);
    
    // Find most common words (simple frequency analysis)
    const wordFreq = new Map<string, number>();
    words.forEach(w => {
      const stopWords = ['sobre', 'porque', 'pode', 'ser', 'está', 'essa', 'essas', 'esses', 'nesses', 'nestes'];
      if (!stopWords.includes(w)) {
        wordFreq.set(w, (wordFreq.get(w) || 0) + 1);
      }
    });
    
    const keyTerms = Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);

    // Extract topics (simplified - look for capitalized terms)
    const topicMatches = text.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];
    const topics = [...new Set(topicMatches)].slice(0, 8);

    // Build summary content
    const mainPoints = sentences.slice(0, 5).map(s => s.trim()).filter(Boolean);
    
    return {
      title: topics[0] || 'Resumo Gerado',
      content: mainPoints.join('.\n\n'),
      topics,
      keyTerms
    };
  }

  async generateFlashcards(text: string, count: number = 5): Promise<GeneratedFlashcard[]> {
    const flashcards: GeneratedFlashcard[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 30);
    
    // Patterns for generating flashcards
    const patterns = [
      // Definition pattern: "X is Y" -> "What is X?" / "X is Y"
      { regex: /(\w+(?:\s+\w+)?)\s+(?:é|é\s+o|é\s+a|significa|representa|refere-se\s+a)\s+([^.]+)/gi,
        generate: (match: RegExpMatchArray) => ({
          front: `O que é ${match[1]}?`,
          back: match[2].trim()
        })
      },
      // Cause-effect: "causes/leads to/results in" -> "What causes X?" / "X causes Y"
      { regex: /(\w+)\s+(causa|provoca|resulta|leva\s+a|ocasiona)\s+([^.]+)/gi,
        generate: (match: RegExpMatchArray) => ({
          front: `O que ${match[1]} causa?`,
          back: `${match[1]} ${match[2]} ${match[3].trim()}`
        })
      },
      // Symptom pattern
      { regex: /(\w+(?:\s+\w+)?)\s+(caracteriza-se|apresenta|possui|tem)\s+([^.]+)/gi,
        generate: (match: RegExpMatchArray) => ({
          front: `Quais são as características de ${match[1]}?`,
          back: match[3].trim()
        })
      }
    ];

    // Try to match patterns
      patterns.forEach(pattern => {
        const matches = [...text.matchAll(pattern.regex)];
        matches.forEach(match => {
          if (flashcards.length < count) {
            try {
              const card = pattern.generate(match);
              if (card.front && card.back && card.front.length > 5 && card.back.length > 5) {
                flashcards.push(card);
              }
            } catch {
              // Skip invalid matches
            }
          }
        });
      });

    // If not enough, create simple fill-in-the-blank cards
    if (flashcards.length < count) {
      sentences.forEach(sentence => {
        if (flashcards.length >= count) return;
        
        const words = sentence.trim().split(/\s+/);
        if (words.length < 5) return;
        
        // Find a significant word to blank out
        const blankIndex = Math.floor(words.length / 2);
        const blankWord = words[blankIndex];
        
        if (blankWord && blankWord.length > 4) {
          const blankedSentence = words.map((w, i) => 
            i === blankIndex ? '______' : w
          ).join(' ');
          
          flashcards.push({
            front: `Complete: ${blankedSentence}`,
            back: blankWord
          });
        }
      });
    }

    return flashcards.slice(0, count);
  }

  async generateQuestions(text: string, count: number = 3): Promise<GeneratedQuestion[]> {
    const questions: GeneratedQuestion[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 30);

    // Generate multiple choice questions from sentences
    sentences.forEach((sentence, index) => {
      if (questions.length >= count) return;
      
      const words = sentence.trim().split(/\s+/);
      if (words.length < 5) return;
      
      // Find key terms for distractors
      const otherSentences = sentences.filter((_, i) => i !== index);
      const distractorWords = otherSentences
        .flatMap(s => s.split(/\s+/))
        .filter(w => w.length > 4)
        .slice(0, 20);
      
      // Create a question from the sentence
      // Simplify: ask about the main subject
      const match = sentence.match(/^(\w+(?:\s+\w+)?)\s+(.*)/);
      if (match && distractorWords.length >= 3) {
        const topic = match[1];
        const rest = match[2];
        
        // Get unique distractors
        const uniqueDistractors = [...new Set(distractorWords)].slice(0, 3);
        
        // Shuffle and create options
        const correctIndex = Math.floor(Math.random() * 4);
        const options = uniqueDistractors.map((d, i) => {
          if (i === correctIndex) return rest.substring(0, 80).trim();
          return `...${d}...`;
        });
        
        if (options[correctIndex]) {
          questions.push({
            question: `Sobre ${topic}, qual afirmação está correta?`,
            options: options as string[],
            correctAnswer: correctIndex,
            explanation: `A resposta correta é: ${rest.substring(0, 100).trim()}`
          });
        }
      }
    });

    return questions.slice(0, count);
  }
}

// OpenAI Provider (placeholder for future implementation)
class OpenAIContentGenerator implements ContentGeneratorProvider {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async generateContent(text: string, subject?: string): Promise<ContentGenerationResult> {
    // TODO: Implement OpenAI integration
    // For now, fallback to mock
    const mock = new MockContentGenerator();
    return mock.generateContent(text, subject);
  }
  
  async generateSummary(text: string): Promise<GeneratedSummary> {
    const mock = new MockContentGenerator();
    return mock.generateSummary(text);
  }
  
  async generateFlashcards(text: string, count?: number): Promise<GeneratedFlashcard[]> {
    const mock = new MockContentGenerator();
    return mock.generateFlashcards(text, count);
  }
  
  async generateQuestions(text: string, count?: number): Promise<GeneratedQuestion[]> {
    const mock = new MockContentGenerator();
    return mock.generateQuestions(text, count);
  }
}

// Factory function to get the appropriate provider
export function getContentGenerator(): ContentGeneratorProvider {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (apiKey) {
    return new OpenAIContentGenerator(apiKey);
  }
  
  // Default to mock provider
  return new MockContentGenerator();
}

// XP Configuration
export const XP_CONFIG = {
  flashcard_review: 5,
  question_correct: 10,
  question_incorrect: 2,
  session_complete: 25,
  daily_goal: 50,
  content_generated: 15,
  onboarding_complete: 100
} as const;

// Time estimates (in minutes)
export const TIME_ESTIMATES = {
  flashcard_review: 1, // per card
  question: 2, // per question
  session: 15, // standard session
  quick_session: 5,
  content_generation: 10
} as const;
