import express from 'express';
import { db } from '../config/firebase.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all tasks for a section
router.get('/section/:sectionId', verifyToken, async (req, res) => {
  try {
    const snapshot = await db.collection('tasks')
      .where('sectionId', '==', req.params.sectionId)
      .get();
    
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort in memory instead of in query
    tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get all tasks for a project
router.get('/project/:projectId', verifyToken, async (req, res) => {
  try {
    const sectionsSnapshot = await db.collection('sections')
      .where('projectId', '==', req.params.projectId)
      .get();
    
    const sectionIds = sectionsSnapshot.docs.map(doc => doc.id);
    
    if (sectionIds.length === 0) {
      return res.json([]);
    }
    
    const tasks = [];
    for (const sectionId of sectionIds) {
      const tasksSnapshot = await db.collection('tasks')
        .where('sectionId', '==', sectionId)
        .get();
      
      tasksSnapshot.docs.forEach(doc => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
    }
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Create task
router.post('/', verifyToken, async (req, res) => {
  try {
    const { sectionId, title, description, status, priority, assignee, dueDate, effort } = req.body;
    
    const taskData = {
      sectionId,
      title,
      description: description || '',
      status: status || 'To Do',
      priority: priority || 'Medium',
      assignee: assignee || '',
      dueDate: dueDate || null,
      effort: effort || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await db.collection('tasks').add(taskData);
    
    res.status(201).json({ id: docRef.id, ...taskData });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { title, description, status, priority, assignee, dueDate, effort } = req.body;
    const taskRef = db.collection('tasks').doc(req.params.id);
    const doc = await taskRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const updateData = {
      title,
      description: description || '',
      status,
      priority,
      assignee: assignee || '',
      dueDate: dueDate || null,
      effort: effort || '',
      updatedAt: new Date().toISOString()
    };
    
    await taskRef.update(updateData);
    
    res.json({ id: req.params.id, ...doc.data(), ...updateData });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const taskRef = db.collection('tasks').doc(req.params.id);
    const doc = await taskRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    await taskRef.delete();
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
