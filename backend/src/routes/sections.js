import express from 'express';
import { db } from '../config/firebase.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all sections for a project
router.get('/project/:projectId', verifyToken, async (req, res) => {
  try {
    const snapshot = await db.collection('sections')
      .where('projectId', '==', req.params.projectId)
      .get();
    
    const sections = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort in memory instead of in query
    sections.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    res.json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

// Create section
router.post('/', verifyToken, async (req, res) => {
  try {
    const { projectId, name, order } = req.body;
    
    const sectionData = {
      projectId,
      name,
      order: order || 0
    };
    
    const docRef = await db.collection('sections').add(sectionData);
    
    res.status(201).json({ id: docRef.id, ...sectionData });
  } catch (error) {
    console.error('Error creating section:', error);
    res.status(500).json({ error: 'Failed to create section' });
  }
});

// Update section
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { name, order } = req.body;
    const sectionRef = db.collection('sections').doc(req.params.id);
    const doc = await sectionRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Section not found' });
    }
    
    const updateData = { name, order };
    await sectionRef.update(updateData);
    
    res.json({ id: req.params.id, ...doc.data(), ...updateData });
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ error: 'Failed to update section' });
  }
});

// Delete section
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const sectionRef = db.collection('sections').doc(req.params.id);
    const doc = await sectionRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Section not found' });
    }
    
    // Delete all tasks in this section
    const tasksSnapshot = await db.collection('tasks')
      .where('sectionId', '==', req.params.id)
      .get();
    
    const batch = db.batch();
    tasksSnapshot.docs.forEach(taskDoc => {
      batch.delete(taskDoc.ref);
    });
    
    batch.delete(sectionRef);
    await batch.commit();
    
    res.json({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({ error: 'Failed to delete section' });
  }
});

export default router;
