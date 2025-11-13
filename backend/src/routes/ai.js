import express from 'express';
import { db } from '../config/firebase.js';
import { openai } from '../config/openai.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Generate AI summary for a project
router.post('/summary', verifyToken, async (req, res) => {
  try {
    const { projectId } = req.body;
    
    console.log('AI Summary requested for project:', projectId);
    
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }
    
    // Verify project ownership
    const projectDoc = await db.collection('projects').doc(projectId).get();
    if (!projectDoc.exists) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (projectDoc.data().userId !== req.user.uid) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Get all sections for the project
    const sectionsSnapshot = await db.collection('sections')
      .where('projectId', '==', projectId)
      .get();
    
    const sectionIds = sectionsSnapshot.docs.map(doc => doc.id);
    console.log('Found sections:', sectionIds.length);
    
    // Get all tasks
    const tasks = [];
    for (const sectionId of sectionIds) {
      const tasksSnapshot = await db.collection('tasks')
        .where('sectionId', '==', sectionId)
        .get();
      
      tasksSnapshot.docs.forEach(doc => {
        tasks.push(doc.data());
      });
    }
    
    console.log('Found tasks:', tasks.length);
    
    if (tasks.length === 0) {
      return res.json({ summary: 'No tasks found in this project yet. Add some tasks to generate an AI summary!' });
    }
    
    // Prepare task summary for AI
    const taskSummary = tasks.map(task => 
      `- ${task.title} (Status: ${task.status}, Priority: ${task.priority})`
    ).join('\n');
    
    console.log('Calling OpenAI API...');
    
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your-openai-api-key-here') {
      console.error('OpenAI API key not configured');
      return res.status(500).json({ 
        error: 'OpenAI API key not configured. Please add your API key to the .env file.' 
      });
    }
    
    let summary;
    
    // Try OpenAI API, fallback to mock if it fails
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a project management assistant. Generate a concise 2-3 sentence summary of the project based on its tasks.'
          },
          {
            role: 'user',
            content: `Project: ${projectDoc.data().name}\n\nTasks:\n${taskSummary}\n\nGenerate a brief project summary.`
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      });
      
      summary = completion.choices[0].message.content.trim();
      console.log('AI Summary generated successfully');
    } catch (openaiError) {
      console.log('OpenAI API failed, using mock summary:', openaiError.message);
      
      // Generate mock summary based on task statistics
      const statusCounts = {
        'To Do': tasks.filter(t => t.status === 'To Do').length,
        'In Progress': tasks.filter(t => t.status === 'In Progress').length,
        'Done': tasks.filter(t => t.status === 'Done').length
      };
      
      const priorityCounts = {
        'High': tasks.filter(t => t.priority === 'High').length,
        'Medium': tasks.filter(t => t.priority === 'Medium').length,
        'Low': tasks.filter(t => t.priority === 'Low').length
      };
      
      const totalTasks = tasks.length;
      const completionRate = Math.round((statusCounts['Done'] / totalTasks) * 100);
      
      summary = `The ${projectDoc.data().name} project has ${totalTasks} task${totalTasks > 1 ? 's' : ''} ` +
                `with ${completionRate}% completion rate. ` +
                `Currently ${statusCounts['In Progress']} task${statusCounts['In Progress'] !== 1 ? 's are' : ' is'} in progress, ` +
                `${statusCounts['To Do']} pending, and ${statusCounts['Done']} completed. ` +
                `Priority breakdown: ${priorityCounts['High']} high, ${priorityCounts['Medium']} medium, ${priorityCounts['Low']} low priority tasks.`;
      
      console.log('Mock summary generated successfully');
    }
    
    res.json({ summary });
  } catch (error) {
    console.error('Error generating AI summary:', error.message);
    console.error('Full error:', error);
    
    // More specific error messages
    if (error.code === 'insufficient_quota') {
      return res.status(500).json({ 
        error: 'OpenAI API quota exceeded. Please check your OpenAI account billing.' 
      });
    }
    
    if (error.code === 'invalid_api_key') {
      return res.status(500).json({ 
        error: 'Invalid OpenAI API key. Please check your .env file.' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to generate summary: ' + (error.message || 'Unknown error')
    });
  }
});

// AI-powered effort estimation
router.post('/estimate-effort', verifyToken, async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Task title is required' });
    }
    
    console.log('Estimating effort for task:', title);
    
    const taskText = `${title} ${description || ''}`.toLowerCase();
    
    // Rule-based estimation with keyword detection
    const complexityKeywords = {
      high: ['complex', 'integrate', 'architecture', 'refactor', 'migrate', 'system', 'infrastructure', 'database', 'security', 'optimization', 'performance'],
      medium: ['implement', 'develop', 'create', 'build', 'design', 'update', 'modify', 'enhance', 'improve', 'api', 'feature'],
      low: ['fix', 'bug', 'typo', 'update text', 'change color', 'small', 'minor', 'quick', 'simple', 'documentation', 'comment']
    };
    
    let effort = 'Medium'; // Default
    let confidence = 0;
    
    // Check for high complexity keywords
    for (const keyword of complexityKeywords.high) {
      if (taskText.includes(keyword)) {
        effort = 'High';
        confidence += 0.3;
      }
    }
    
    // Check for low complexity keywords
    if (effort === 'Medium') {
      for (const keyword of complexityKeywords.low) {
        if (taskText.includes(keyword)) {
          effort = 'Low';
          confidence += 0.3;
        }
      }
    }
    
    // Check for medium complexity keywords
    if (effort === 'Medium') {
      for (const keyword of complexityKeywords.medium) {
        if (taskText.includes(keyword)) {
          confidence += 0.2;
        }
      }
    }
    
    // Adjust based on description length
    const wordCount = taskText.split(' ').length;
    if (wordCount > 50) {
      if (effort === 'Low') effort = 'Medium';
      else if (effort === 'Medium') effort = 'High';
      confidence += 0.1;
    }
    
    confidence = Math.min(confidence, 1.0);
    
    console.log(`Estimated effort: ${effort} (confidence: ${confidence})`);
    
    res.json({ 
      effort,
      confidence: Math.round(confidence * 100),
      reasoning: `Based on task complexity and keywords detected`
    });
  } catch (error) {
    console.error('Error estimating effort:', error);
    res.status(500).json({ error: 'Failed to estimate effort' });
  }
});

// AI-powered priority prediction
router.post('/predict-priority', verifyToken, async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Task title is required' });
    }
    
    console.log('Predicting priority for task:', title);
    
    const taskText = `${title} ${description || ''}`.toLowerCase();
    
    // Keyword-based priority detection
    const priorityKeywords = {
      high: ['urgent', 'critical', 'asap', 'immediately', 'emergency', 'blocker', 'security', 'bug', 'crash', 'broken', 'production', 'hotfix', 'important'],
      medium: ['should', 'need', 'required', 'feature', 'enhancement', 'improve', 'update', 'modify'],
      low: ['nice to have', 'optional', 'future', 'consider', 'maybe', 'eventually', 'documentation', 'cleanup', 'refactor']
    };
    
    let priority = 'Medium'; // Default
    let confidence = 0;
    let reasons = [];
    
    // Check for high priority keywords
    for (const keyword of priorityKeywords.high) {
      if (taskText.includes(keyword)) {
        priority = 'High';
        confidence += 0.4;
        reasons.push(`Contains urgent keyword: "${keyword}"`);
        break;
      }
    }
    
    // Check for low priority keywords
    if (priority === 'Medium') {
      for (const keyword of priorityKeywords.low) {
        if (taskText.includes(keyword)) {
          priority = 'Low';
          confidence += 0.3;
          reasons.push(`Contains low-priority keyword: "${keyword}"`);
          break;
        }
      }
    }
    
    // Check for medium priority keywords
    if (priority === 'Medium') {
      for (const keyword of priorityKeywords.medium) {
        if (taskText.includes(keyword)) {
          confidence += 0.2;
          reasons.push(`Contains standard keyword: "${keyword}"`);
          break;
        }
      }
    }
    
    // Adjust based on due date
    if (dueDate) {
      const daysUntilDue = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDue <= 2) {
        if (priority === 'Low') priority = 'Medium';
        else if (priority === 'Medium') priority = 'High';
        confidence += 0.3;
        reasons.push(`Due in ${daysUntilDue} days`);
      } else if (daysUntilDue <= 7) {
        if (priority === 'Low') priority = 'Medium';
        confidence += 0.2;
        reasons.push(`Due in ${daysUntilDue} days`);
      }
    }
    
    confidence = Math.min(confidence, 1.0);
    
    console.log(`Predicted priority: ${priority} (confidence: ${confidence})`);
    
    res.json({ 
      priority,
      confidence: Math.round(confidence * 100),
      reasoning: reasons.length > 0 ? reasons.join('; ') : 'Based on task analysis'
    });
  } catch (error) {
    console.error('Error predicting priority:', error);
    res.status(500).json({ error: 'Failed to predict priority' });
  }
});

// Get AI suggestions for a task (combined)
router.post('/suggest', verifyToken, async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Task title is required' });
    }
    
    console.log('Getting AI suggestions for task:', title);
    
    const taskText = `${title} ${description || ''}`.toLowerCase();
    
    // === EFFORT ESTIMATION ===
    const complexityKeywords = {
      high: ['complex', 'integrate', 'architecture', 'refactor', 'migrate', 'system', 'infrastructure', 'database', 'security', 'optimization', 'performance'],
      medium: ['implement', 'develop', 'create', 'build', 'design', 'update', 'modify', 'enhance', 'improve', 'api', 'feature'],
      low: ['fix', 'bug', 'typo', 'update text', 'change color', 'small', 'minor', 'quick', 'simple', 'documentation', 'comment']
    };
    
    let effort = 'Medium';
    let effortConfidence = 0;
    
    for (const keyword of complexityKeywords.high) {
      if (taskText.includes(keyword)) {
        effort = 'High';
        effortConfidence += 0.3;
      }
    }
    
    if (effort === 'Medium') {
      for (const keyword of complexityKeywords.low) {
        if (taskText.includes(keyword)) {
          effort = 'Low';
          effortConfidence += 0.3;
        }
      }
    }
    
    if (effort === 'Medium') {
      for (const keyword of complexityKeywords.medium) {
        if (taskText.includes(keyword)) {
          effortConfidence += 0.2;
        }
      }
    }
    
    const wordCount = taskText.split(' ').length;
    if (wordCount > 50) {
      if (effort === 'Low') effort = 'Medium';
      else if (effort === 'Medium') effort = 'High';
      effortConfidence += 0.1;
    }
    
    effortConfidence = Math.min(effortConfidence, 1.0);
    
    // === PRIORITY PREDICTION ===
    const priorityKeywords = {
      high: ['urgent', 'critical', 'asap', 'immediately', 'emergency', 'blocker', 'security', 'bug', 'crash', 'broken', 'production', 'hotfix', 'important'],
      medium: ['should', 'need', 'required', 'feature', 'enhancement', 'improve', 'update', 'modify'],
      low: ['nice to have', 'optional', 'future', 'consider', 'maybe', 'eventually', 'documentation', 'cleanup', 'refactor']
    };
    
    let priority = 'Medium';
    let priorityConfidence = 0;
    let reasons = [];
    
    for (const keyword of priorityKeywords.high) {
      if (taskText.includes(keyword)) {
        priority = 'High';
        priorityConfidence += 0.4;
        reasons.push(`Contains urgent keyword: "${keyword}"`);
        break;
      }
    }
    
    if (priority === 'Medium') {
      for (const keyword of priorityKeywords.low) {
        if (taskText.includes(keyword)) {
          priority = 'Low';
          priorityConfidence += 0.3;
          reasons.push(`Contains low-priority keyword: "${keyword}"`);
          break;
        }
      }
    }
    
    if (priority === 'Medium') {
      for (const keyword of priorityKeywords.medium) {
        if (taskText.includes(keyword)) {
          priorityConfidence += 0.2;
          reasons.push(`Contains standard keyword: "${keyword}"`);
          break;
        }
      }
    }
    
    if (dueDate) {
      const daysUntilDue = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDue <= 2) {
        if (priority === 'Low') priority = 'Medium';
        else if (priority === 'Medium') priority = 'High';
        priorityConfidence += 0.3;
        reasons.push(`Due in ${daysUntilDue} days`);
      } else if (daysUntilDue <= 7) {
        if (priority === 'Low') priority = 'Medium';
        priorityConfidence += 0.2;
        reasons.push(`Due in ${daysUntilDue} days`);
      }
    }
    
    priorityConfidence = Math.min(priorityConfidence, 1.0);
    
    console.log(`AI Suggestions - Effort: ${effort}, Priority: ${priority}`);
    
    res.json({
      effort,
      priority,
      effortConfidence: Math.round(effortConfidence * 100),
      priorityConfidence: Math.round(priorityConfidence * 100),
      effortReasoning: `Based on task complexity and keywords detected`,
      priorityReasoning: reasons.length > 0 ? reasons.join('; ') : 'Based on task analysis'
    });
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    
    // Fallback to simple suggestions
    res.json({
      effort: 'Medium',
      priority: 'Medium',
      effortConfidence: 50,
      priorityConfidence: 50,
      effortReasoning: 'Default suggestion',
      priorityReasoning: 'Default suggestion'
    });
  }
});

export default router;
