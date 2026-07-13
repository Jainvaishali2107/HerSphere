/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import 'dotenv/config';
import express from 'express';
import path from 'path';
import { connectToMongoDB, dbAdapter } from './db/mongodb.js';
import { GoogleGenAI } from '@google/genai';

// Setup Express
const app = express();
const PORT = process.env.NODE_ENV === 'production' ? (process.env.PORT || 3000) : 5000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Helper to parse authorization or custom cookie-token
async function getAuthenticatedUser(req) {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  let userId = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    userId = authHeader.substring(7);
  } else {
    // Check cookies
    const cookieHeader = req.headers.cookie || '';
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => {
        const parts = c.split('=');
        return [parts[0], parts[1]];
      })
    );
    userId = cookies['hersphere_session'] || '';
  }

  if (!userId) return null;
  return await dbAdapter.findUserById(userId);
}

// Authentication Middleware
const requireAuth = async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized. Please login first.' });
      return;
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

// Admin Auth Middleware
const requireAdmin = async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden. Admin access required.' });
      return;
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

// ==================== REST API ENDPOINTS ====================

// --- Auth Endpoints ---

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required.' });
      return;
    }

    const existing = await dbAdapter.findUserByEmail(email);
    if (existing) {
      res.status(400).json({ error: 'A user with this email already exists.' });
      return;
    }

    const userId = 'usr-' + Math.random().toString(36).substring(2, 11);
    const newUser = {
      id: userId,
      email,
      name,
      role: email.toLowerCase().includes('admin') ? 'admin' : 'user',
      streak: 1,
      medicalHistory: {
        pcos: false,
        pcod: false,
        conditions: [],
        medications: []
      },
      cycleInfo: {
        averageCycleLength: 28,
        averagePeriodLength: 5,
        lastPeriodDate: new Date().toISOString().split('T')[0]
      },
      privacySettings: {
        anonymousMode: false,
        shareDataForResearch: false,
        hideProfileFromPublic: false
      },
      achievements: [
        {
          id: 'ach-1',
          title: 'New Beginnings',
          description: 'Create your account and start your HerSphere wellness journey.',
          unlockedAt: new Date().toISOString(),
          icon: '🌸'
        }
      ]
    };

    await dbAdapter.saveUser(newUser, password);
    res.setHeader('Set-Cookie', `hersphere_session=${userId}; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000`);
    res.json({ success: true, user: newUser, token: userId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = await dbAdapter.findUserByEmail(email);
    if (!user) {
      res.status(400).json({ error: 'Invalid email or password.' });
      return;
    }

    const savedPassword = await dbAdapter.getPassword(user.id);
    if (savedPassword !== password) {
      res.status(400).json({ error: 'Invalid email or password.' });
      return;
    }

    // Success
    res.setHeader('Set-Cookie', `hersphere_session=${user.id}; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000`);
    res.json({ success: true, user, token: user.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Request OTP code
app.post('/api/auth/otp-request', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email is required.' });
      return;
    }
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // e.g. 583921
    await dbAdapter.setOTP(email, otpCode);
    console.log(`[OTP Verification] Code for ${email} is: ${otpCode}`);

    res.json({ 
      success: true, 
      message: 'Verification OTP code sent to your email! (For testing, enter code 123456 or look at the server logs)',
      devCode: otpCode 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify OTP login
app.post('/api/auth/otp-verify', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      res.status(400).json({ error: 'Email and verification code are required.' });
      return;
    }

    const storedCode = await dbAdapter.getOTP(email);
    const isValid = code === storedCode || code === '123456'; // Allow 123456 as standard dev master key

    if (!isValid) {
      res.status(400).json({ error: 'Invalid verification OTP code. Please try again.' });
      return;
    }

    await dbAdapter.deleteOTP(email);
    
    // Find or create user
    let user = await dbAdapter.findUserByEmail(email);
    if (!user) {
      const userId = 'usr-' + Math.random().toString(36).substring(2, 11);
      user = {
        id: userId,
        email,
        name: email.split('@')[0],
        role: email.toLowerCase().includes('admin') ? 'admin' : 'user',
        streak: 1,
        medicalHistory: { pcos: false, pcod: false, conditions: [], medications: [] },
        cycleInfo: {
          averageCycleLength: 28,
          averagePeriodLength: 5,
          lastPeriodDate: new Date().toISOString().split('T')[0]
        },
        privacySettings: { anonymousMode: false, shareDataForResearch: false, hideProfileFromPublic: false },
        achievements: [{
          id: 'ach-1',
          title: 'New Beginnings',
          description: 'Create your account and start your HerSphere wellness journey.',
          unlockedAt: new Date().toISOString(),
          icon: '🌸'
        }]
      };
      await dbAdapter.saveUser(user, 'otp_signed_user');
    }

    res.setHeader('Set-Cookie', `hersphere_session=${user.id}; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000`);
    res.json({ success: true, user, token: user.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.setHeader('Set-Cookie', 'hersphere_session=; Path=/; HttpOnly; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  res.json({ success: true });
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/profile', async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- User Profile Endpoints ---

app.post('/api/profile/update', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const { name, age, height, weight, bloodGroup, emergencyContactName, emergencyContactPhone, medicalHistory, cycleInfo, privacySettings } = req.body;

    if (name) user.name = name;
    if (age !== undefined) user.age = Number(age);
    if (height !== undefined) user.height = Number(height);
    if (weight !== undefined) user.weight = Number(weight);
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
    if (emergencyContactName !== undefined) user.emergencyContactName = emergencyContactName;
    if (emergencyContactPhone !== undefined) user.emergencyContactPhone = emergencyContactPhone;
    
    if (medicalHistory) {
      user.medicalHistory = {
        pcos: !!medicalHistory.pcos,
        pcod: !!medicalHistory.pcod,
        conditions: Array.isArray(medicalHistory.conditions) ? medicalHistory.conditions : [],
        medications: Array.isArray(medicalHistory.medications) ? medicalHistory.medications : []
      };
    }

    if (cycleInfo) {
      user.cycleInfo = {
        averageCycleLength: Number(cycleInfo.averageCycleLength) || 28,
        averagePeriodLength: Number(cycleInfo.averagePeriodLength) || 5,
        lastPeriodDate: cycleInfo.lastPeriodDate || user.cycleInfo.lastPeriodDate
      };
    }

    if (privacySettings) {
      user.privacySettings = {
        anonymousMode: !!privacySettings.anonymousMode,
        shareDataForResearch: !!privacySettings.shareDataForResearch,
        hideProfileFromPublic: !!privacySettings.hideProfileFromPublic
      };
    }

    // Check achievements - Unlock profile master if completed profile
    const completedProfile = user.age && user.height && user.weight && user.bloodGroup;
    const hasAch = user.achievements?.some(a => a.id === 'ach-profile');
    if (completedProfile && !hasAch) {
      if (!user.achievements) user.achievements = [];
      user.achievements.push({
        id: 'ach-profile',
        title: 'Mind & Body Harmony',
        description: 'Fill in your vital parameters to fully customize HerSphere.',
        unlockedAt: new Date().toISOString(),
        icon: '🌿'
      });
    }

    await dbAdapter.saveUser(user);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/profile/delete', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    await dbAdapter.deleteUser(user.id);
    res.setHeader('Set-Cookie', 'hersphere_session=; Path=/; HttpOnly; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    res.json({ success: true, message: 'Account deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Period Tracker Endpoints ---

app.get('/api/cycle/logs', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const logs = await dbAdapter.getPeriodLogs(user.id);
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cycle/logs', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const { date, flow, pain, symptoms, mood, notes } = req.body;

    if (!date) {
      res.status(400).json({ error: 'Date is required.' });
      return;
    }

    const existingLogs = await dbAdapter.getPeriodLogs(user.id);
    const matched = existingLogs.find(l => l.date === date);

    const logId = matched ? matched.id : 'log-' + Math.random().toString(36).substring(2, 11);
    const newLog = {
      id: logId,
      userId: user.id,
      date,
      flow: flow || 'none',
      pain: pain || 'none',
      symptoms: Array.isArray(symptoms) ? symptoms : [],
      mood: mood || 'calm',
      notes: notes || ''
    };

    await dbAdapter.savePeriodLog(newLog);

    // If heavy flow/severe pain logged, adjust streak or award log badge
    const logsCount = existingLogs.length + (matched ? 0 : 1);
    const hasAch = user.achievements?.some(a => a.id === 'ach-cycle-log');
    if (logsCount >= 3 && !hasAch) {
      if (!user.achievements) user.achievements = [];
      user.achievements.push({
        id: 'ach-cycle-log',
        title: 'Self-Aware Queen',
        description: 'Log your symptoms and cycles for 3 consecutive entries.',
        unlockedAt: new Date().toISOString(),
        icon: '🔮'
      });
      await dbAdapter.saveUser(user);
    }

    res.json({ success: true, log: newLog });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cycle/logs/:id', requireAuth, async (req, res) => {
  try {
    const logId = req.params.id;
    await dbAdapter.deletePeriodLog(logId);
    res.json({ success: true, message: 'Log deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Hygiene Hub & Articles ---

app.get('/api/articles', async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
    const search = req.query.search;
    const category = req.query.category;

    const articles = await dbAdapter.getArticles(search, category);

    // Inject a 'bookmarked' boolean for the requesting user
    const result = articles.map(art => ({
      ...art,
      bookmarked: user ? art.bookmarks?.includes(user.id) : false
    }));

    res.json({ articles: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/articles/bookmark', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const { articleId } = req.body;

    if (!articleId) {
      res.status(400).json({ error: 'Article ID is required.' });
      return;
    }

    const articles = await dbAdapter.getArticles();
    const article = articles.find(a => a.id === articleId);

    if (!article) {
      res.status(404).json({ error: 'Article not found.' });
      return;
    }

    if (!article.bookmarks) article.bookmarks = [];
    const idx = article.bookmarks.indexOf(user.id);
    if (idx !== -1) {
      article.bookmarks.splice(idx, 1); // remove bookmark
    } else {
      article.bookmarks.push(user.id); // add bookmark
    }

    await dbAdapter.saveArticle(article);

    // Check achievement
    const bookmarkedCount = articles.filter(a => a.bookmarks?.includes(user.id)).length;
    const hasAch = user.achievements?.some(a => a.id === 'ach-scholar');
    if (bookmarkedCount >= 2 && !hasAch) {
      if (!user.achievements) user.achievements = [];
      user.achievements.push({
        id: 'ach-scholar',
        title: 'Empowered Scholar',
        description: 'Bookmark educational wellness resources in the Menstrual Hygiene Hub.',
        unlockedAt: new Date().toISOString(),
        icon: '📚'
      });
      await dbAdapter.saveUser(user);
    }

    res.json({ success: true, bookmarked: idx === -1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Consultations Endpoints ---

app.get('/api/consultations', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const consultations = await dbAdapter.getConsultations(user.id);
    res.json({ consultations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/consultations', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const { doctorName, specialty, date, time, notes } = req.body;

    if (!doctorName || !specialty || !date || !time) {
      res.status(400).json({ error: 'Doctor name, specialty, date and time slot are required.' });
      return;
    }

    const newConsultation = {
      id: 'con-' + Math.random().toString(36).substring(2, 11),
      userId: user.id,
      doctorName,
      specialty,
      date,
      time,
      status: 'upcoming',
      notes
    };

    await dbAdapter.saveConsultation(newConsultation);

    // Check achievements
    const hasAch = user.achievements?.some(a => a.id === 'ach-consult');
    if (!hasAch) {
      if (!user.achievements) user.achievements = [];
      user.achievements.push({
        id: 'ach-consult',
        title: 'Wellbeing Actionist',
        description: 'Take the first step toward clinical wellness by booking a professional consultation.',
        unlockedAt: new Date().toISOString(),
        icon: '🩺'
      });
      await dbAdapter.saveUser(user);
    }

    res.json({ success: true, consultation: newConsultation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/consultations/:id/cancel', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const consultations = await dbAdapter.getConsultations(user.id);
    const found = consultations.find(c => c.id === req.params.id);

    if (!found) {
      res.status(404).json({ error: 'Consultation not found.' });
      return;
    }

    found.status = 'cancelled';
    await dbAdapter.saveConsultation(found);
    res.json({ success: true, consultation: found });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/consultations/:id/reschedule', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const { date, time } = req.body;

    if (!date || !time) {
      res.status(400).json({ error: 'New Date and Time are required for rescheduling.' });
      return;
    }

    const consultations = await dbAdapter.getConsultations(user.id);
    const found = consultations.find(c => c.id === req.params.id);

    if (!found) {
      res.status(404).json({ error: 'Consultation not found.' });
      return;
    }

    found.date = date;
    found.time = time;
    found.status = 'upcoming';
    await dbAdapter.saveConsultation(found);

    res.json({ success: true, consultation: found });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Daily Wellness & Habits Endpoints ---

app.get('/api/wellness/tracker', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const date = req.query.date || new Date().toISOString().split('T')[0];

    let tracker = await dbAdapter.getWellnessTracker(user.id, date);
    if (!tracker) {
      // Return empty default state, but do not save it yet unless logged
      tracker = {
        id: 'wt-' + Math.random().toString(36).substring(2, 11),
        userId: user.id,
        date,
        waterIntake: 0,
        sleepHours: 0,
        mood: 'calm',
        exerciseMinutes: 0,
        meditationMinutes: 0,
        journalEntry: '',
        affirmation: 'I trust my body, I listen to its wisdom, and I nourish its strength.',
        completedChallenge: false
      };
    }
    res.json({ tracker });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/wellness/tracker', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const { date, waterIntake, sleepHours, mood, exerciseMinutes, meditationMinutes, journalEntry, completedChallenge } = req.body;

    const targetDate = date || new Date().toISOString().split('T')[0];
    let tracker = await dbAdapter.getWellnessTracker(user.id, targetDate);

    if (!tracker) {
      tracker = {
        id: 'wt-' + Math.random().toString(36).substring(2, 11),
        userId: user.id,
        date: targetDate,
        waterIntake: 0,
        sleepHours: 0,
        mood: 'calm',
        exerciseMinutes: 0,
        meditationMinutes: 0,
        journalEntry: '',
        affirmation: 'I trust my body, I listen to its wisdom, and I nourish its strength.',
        completedChallenge: false
      };
    }

    if (waterIntake !== undefined) tracker.waterIntake = Number(waterIntake);
    if (sleepHours !== undefined) tracker.sleepHours = Number(sleepHours);
    if (mood !== undefined) tracker.mood = mood;
    if (exerciseMinutes !== undefined) tracker.exerciseMinutes = Number(exerciseMinutes);
    if (meditationMinutes !== undefined) tracker.meditationMinutes = Number(meditationMinutes);
    if (journalEntry !== undefined) tracker.journalEntry = journalEntry;
    if (completedChallenge !== undefined) tracker.completedChallenge = !!completedChallenge;

    await dbAdapter.saveWellnessTracker(tracker);

    // Check achievements - Unlock hydration badge if water intake >= 2000 ml
    if (tracker.waterIntake >= 2000) {
      const hasHydrate = user.achievements?.some(a => a.id === 'ach-hydrate');
      if (!hasHydrate) {
        if (!user.achievements) user.achievements = [];
        user.achievements.push({
          id: 'ach-hydrate',
          title: 'Hydration Queen',
          description: 'Reach a daily water consumption milestone of over 2000ml.',
          unlockedAt: new Date().toISOString(),
          icon: '💧'
        });
        user.streak = (user.streak || 1) + 1;
        await dbAdapter.saveUser(user);
      }
    }

    // Check meditation badge
    if (tracker.meditationMinutes >= 10) {
      const hasMed = user.achievements?.some(a => a.id === 'ach-zen');
      if (!hasMed) {
        if (!user.achievements) user.achievements = [];
        user.achievements.push({
          id: 'ach-zen',
          title: 'Zen Goddess',
          description: 'Complete 10 minutes of serene daily mindful meditation.',
          unlockedAt: new Date().toISOString(),
          icon: '🧘‍♀️'
        });
        await dbAdapter.saveUser(user);
      }
    }

    res.json({ success: true, tracker });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Community discuss board ---

app.get('/api/community/posts', async (req, res) => {
  try {
    const posts = await dbAdapter.getCommunityPosts();
    // Return descending by creation date
    const sorted = [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ posts: sorted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/community/posts', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const { title, content, category, isAnonymous } = req.body;

    if (!title || !content || !category) {
      res.status(400).json({ error: 'Title, content and category are required.' });
      return;
    }

    const isAnon = !!isAnonymous;
    const newPost = {
      id: 'post-' + Math.random().toString(36).substring(2, 11),
      title,
      content,
      category,
      isAnonymous: isAnon,
      authorName: isAnon ? 'Anonymous Butterfly' : user.name,
      authorAvatar: isAnon ? '🦋' : '🌸',
      likes: 0,
      likedBy: [],
      comments: [],
      reports: 0,
      reportedBy: [],
      createdAt: new Date().toISOString()
    };

    await dbAdapter.saveCommunityPost(newPost);

    // Check achievements
    const hasAch = user.achievements?.some(a => a.id === 'ach-community');
    if (!hasAch) {
      if (!user.achievements) user.achievements = [];
      user.achievements.push({
        id: 'ach-community',
        title: 'Sisterhood Spark',
        description: 'Publish your first supportive story on the anonymous community board.',
        unlockedAt: new Date().toISOString(),
        icon: '✨'
      });
      await dbAdapter.saveUser(user);
    }

    res.json({ success: true, post: newPost });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/community/posts/:id/like', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const posts = await dbAdapter.getCommunityPosts();
    const post = posts.find(p => p.id === req.params.id);

    if (!post) {
      res.status(404).json({ error: 'Post not found.' });
      return;
    }

    if (!post.likedBy) post.likedBy = [];
    const idx = post.likedBy.indexOf(user.id);
    if (idx !== -1) {
      post.likedBy.splice(idx, 1);
      post.likes = Math.max(0, (post.likes || 0) - 1);
    } else {
      post.likedBy.push(user.id);
      post.likes = (post.likes || 0) + 1;
    }

    await dbAdapter.saveCommunityPost(post);
    res.json({ success: true, likes: post.likes, liked: idx === -1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/community/posts/:id/comment', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const { content } = req.body;

    if (!content) {
      res.status(400).json({ error: 'Comment text content is required.' });
      return;
    }

    const posts = await dbAdapter.getCommunityPosts();
    const post = posts.find(p => p.id === req.params.id);

    if (!post) {
      res.status(404).json({ error: 'Post not found.' });
      return;
    }

    const isAnon = user.privacySettings?.anonymousMode;
    const newComment = {
      id: 'c-' + Math.random().toString(36).substring(2, 11),
      authorName: isAnon ? 'Anonymous Butterfly' : user.name,
      authorAvatar: isAnon ? '🦋' : '🌸',
      content,
      date: new Date().toISOString()
    };

    if (!post.comments) post.comments = [];
    post.comments.push(newComment);
    await dbAdapter.saveCommunityPost(post);

    res.json({ success: true, comment: newComment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/community/posts/:id/report', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const posts = await dbAdapter.getCommunityPosts();
    const post = posts.find(p => p.id === req.params.id);

    if (!post) {
      res.status(404).json({ error: 'Post not found.' });
      return;
    }

    if (!post.reportedBy) post.reportedBy = [];
    if (post.reportedBy.includes(user.id)) {
      res.json({ success: true, message: 'You have already reported this post.' });
      return;
    }

    post.reports = (post.reports || 0) + 1;
    post.reportedBy.push(user.id);
    await dbAdapter.saveCommunityPost(post);

    res.json({ success: true, reports: post.reports });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Emergency / SOS Endpoints ---

app.post('/api/emergency/sos', requireAuth, (req, res) => {
  const user = req.user;
  const { location } = req.body;

  console.log(`[SOS TRIGGERED] User ${user.name} (${user.id}) clicked SOS button!`);
  if (location) {
    console.log(`[SOS LOCATION] Latitude: ${location.latitude}, Longitude: ${location.longitude}`);
  }

  // Find emergency contacts
  const emergencyContact = {
    name: user.emergencyContactName || 'Default Emergency Contact',
    phone: user.emergencyContactPhone || '102 / 1091 (Women\'s Helpline)'
  };

  res.json({
    success: true,
    message: 'SOS Alert triggered! An SMS text with your real-time coordinates has been simulated to your trusted emergency contact.',
    alertRecipient: emergencyContact,
    helplines: [
      { name: 'Women Helpline', number: '1091' },
      { name: 'National Emergency', number: '112' },
      { name: 'Ambulance', number: '102' },
      { name: 'Police', number: '100' }
    ],
    nearbyHospitals: [
      { name: 'City Women and Child Specialty Clinic', distance: '1.2 km', address: '42 Lotus Lane, Suite B' },
      { name: 'Saint Mary General Hospital & Emergency Care', distance: '2.5 km', address: '108 Healthcare Blvd' },
      { name: 'Rose Wellness Pediatric & Obstetric Hospital', distance: '3.8 km', address: '12 Blossom Ave' }
    ]
  });
});

// --- Admin Panel Endpoints ---

app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  try {
    const users = await dbAdapter.getUsers();
    const consultations = await dbAdapter.getAllConsultations();
    const posts = await dbAdapter.getCommunityPosts();

    const reportedPosts = posts.filter(p => p.reports > 0);
    const activeConsultations = consultations.filter(c => c.status === 'upcoming');

    res.json({
      totalUsers: users.length,
      totalConsultations: consultations.length,
      activeConsultationsCount: activeConsultations.length,
      reportedPostsCount: reportedPosts.length,
      reportedPosts: reportedPosts.map(p => ({
        id: p.id,
        title: p.title,
        content: p.content,
        authorName: p.authorName,
        reports: p.reports,
        category: p.category
      })),
      userList: users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        streak: u.streak,
        pcos: u.medicalHistory?.pcos,
        pcod: u.medicalHistory?.pcod
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/posts/:id', requireAdmin, async (req, res) => {
  try {
    const postId = req.params.id;
    await dbAdapter.deleteCommunityPost(postId);
    res.json({ success: true, message: 'Post successfully moderated and removed.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Server-Side Gemini Chatbot Endpoint ---

app.post('/api/chat', requireAuth, async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    res.status(400).json({ error: 'Message content is required.' });
    return;
  }

  // Retrieve Gemini Key. If not set, use a fallback mock responder to avoid hard crashing.
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    // Elegant offline mock fallback for a rich experience even without API key set
    setTimeout(() => {
      let reply = "Hello! I'm HerSphere's wellness guide. I'm currently running in local demonstration mode. To unlock my fully-functional Gemini brain, please add your actual `GEMINI_API_KEY` in the **Settings > Secrets** panel.\n\nHowever, here is a helpful answer: Keep a clean diary of your symptoms, hydrate often (over 2L), and aim for 8 hours of restful sleep.";
      if (message.toLowerCase().includes('pcos') || message.toLowerCase().includes('pcod')) {
        reply = "About PCOS/PCOD: Polycystic Ovary Syndrome is a highly common endocrine condition related to androgen hormone elevation. It is highly treatable through insulin sensitizing dietary protocols, low-stress cardio, muscle strength building, and sleep regulation. Feel free to explore our **Menstrual Hygiene Hub** tab to read doctors-approved guides on PCOS.";
      } else if (message.toLowerCase().includes('cramp') || message.toLowerCase().includes('pain')) {
        reply = "For menstrual cramps (dysmenorrhea): Uterine muscular contractions are triggered by lipids called prostaglandins. You can manage mild-to-moderate cramps using localized heat therapy (heating pads), gentle stretching (such as Yoga's Child's Pose), and warm herbal teas like ginger or chamomile.";
      } else if (message.toLowerCase().includes('ovulation') || message.toLowerCase().includes('fertile')) {
        reply = "Ovulation occurs roughly 14 days before your next cycle starts. In a typical 28-day cycle, the fertility window spans from Day 10 to Day 16, peaking on Day 14. Tracking cervical mucus consistency (resembling raw egg whites) and basal body temperature are excellent secondary metrics to pin down your ovulation day.";
      }
      reply += "\n\n---\n*This AI provides educational guidance only and is not a substitute for professional medical advice.*";
      res.json({ reply });
    }, 1000);
    return;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    // Build chat structure or system instructions
    const systemPrompt = `You are HerSphere's elite, compassionate, and doctor-approved AI wellness guide.
Your primary objective is to provide educational guidance regarding:
- Menstrual health and cycle regulation
- Menstrual products (cups, pads, tampons) and hygiene practices
- PCOS/PCOD management, symptoms, nutrition and exercise protocols
- Women's general physical health, hormones, fertility, and pregnancy questions
- Mental well-being, PMS, anxiety support, and mindfulness

IMPORTANT RULES:
1. NEVER provide specific prescriptions or formal diagnoses.
2. If the user asks about dangerous, toxic, or unrelated general non-health topics (e.g. computer coding, repair, general history), politely state that you can only answer women's health and wellness-related questions.
3. ALWAYS display this exact disclaimer at the very end of your response:
   "This AI provides educational guidance only and is not a substitute for professional medical advice."
4. Be incredibly supportive, warm, gender-sensitive, empathetic, and positive in tone, mimicking an encouraging sister/doctor. Use bullet points and clean Markdown formatting for readability.`;

    const chatHistoryParts = Array.isArray(history) ? history.map((h) => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }]
    })) : [];

    // Include system instruction in the request config
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        ...chatHistoryParts,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: systemPrompt
      }
    });

    let botReply = response.text || '';
    
    // Safety check for disclaimer
    const disclaimer = "This AI provides educational guidance only and is not a substitute for professional medical advice.";
    if (!botReply.includes(disclaimer)) {
      botReply += `\n\n---\n*${disclaimer}*`;
    }

    res.json({ reply: botReply });

  } catch (err) {
    console.error('Gemini API Error:', err);
    res.status(500).json({ error: 'Failed to retrieve AI wellness response. Please try again.', details: err.message });
  }
});


// ==================== FRONTEND INGRESS ROUTING ====================

async function startServer() {
  // Try to connect to MongoDB
  const isConnected = await connectToMongoDB();
  if (isConnected) {
    console.log('[Database] MongoDB mode is fully active!');
  } else {
    console.log('[Database] MongoDB mode is inactive or MONGODB_URI not set.');
  }

  if (process.env.NODE_ENV === 'production') {
    // Production serving static files
    const distPath = path.join(process.cwd(), '../frontend/dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    console.log('[Development Mode] Server running in pure API proxy mode on port 5000.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HerSphere MERN full-stack server successfully running on port ${PORT}`);
  });
}

startServer();
