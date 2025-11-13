import express from 'express';
import { db } from '../config/firebase.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all projects for user
router.get('/', verifyToken, async (req, res) => {
  try {
    const snapshot = await db.collection('projects')
      .where('userId', '==', req.user.uid)
      .get();
    
    const projects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort in memory instead of in query
    projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get single project
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const doc = await db.collection('projects').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const project = { id: doc.id, ...doc.data() };
    
    if (project.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create project
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const projectData = {
      name,
      description: description || '',
      userId: req.user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await db.collection('projects').add(projectData);
    
    res.status(201).json({ id: docRef.id, ...projectData });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const projectRef = db.collection('projects').doc(req.params.id);
    const doc = await projectRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (doc.data().userId !== req.user.uid) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const updateData = {
      name,
      description: description || '',
      updatedAt: new Date().toISOString()
    };
    
    await projectRef.update(updateData);
    
    res.json({ id: req.params.id, ...doc.data(), ...updateData });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const projectRef = db.collection('projects').doc(req.params.id);
    const doc = await projectRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (doc.data().userId !== req.user.uid) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Delete all sections and tasks
    const sectionsSnapshot = await db.collection('sections')
      .where('projectId', '==', req.params.id)
      .get();
    
    const batch = db.batch();
    
    for (const sectionDoc of sectionsSnapshot.docs) {
      const tasksSnapshot = await db.collection('tasks')
        .where('sectionId', '==', sectionDoc.id)
        .get();
      
      tasksSnapshot.docs.forEach(taskDoc => {
        batch.delete(taskDoc.ref);
      });
      
      batch.delete(sectionDoc.ref);
    }
    
    batch.delete(projectRef);
    await batch.commit();
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
