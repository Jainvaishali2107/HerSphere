/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mongoose from 'mongoose';

const { Schema } = mongoose;

// ==================== MONGOOSE SCHEMAS & MODELS ====================

// --- User Schema ---
const UserSchema = new Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  age: { type: Number },
  height: { type: Number },
  weight: { type: Number },
  bloodGroup: { type: String },
  emergencyContactName: { type: String },
  emergencyContactPhone: { type: String },
  streak: { type: Number, default: 1 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  medicalHistory: {
    pcos: { type: Boolean, default: false },
    pcod: { type: Boolean, default: false },
    conditions: [{ type: String }],
    medications: [{ type: String }]
  },
  cycleInfo: {
    averageCycleLength: { type: Number, default: 28 },
    averagePeriodLength: { type: Number, default: 5 },
    lastPeriodDate: { type: String }
  },
  privacySettings: {
    anonymousMode: { type: Boolean, default: false },
    shareDataForResearch: { type: Boolean, default: false },
    hideProfileFromPublic: { type: Boolean, default: false }
  },
  achievements: [{
    id: { type: String },
    title: { type: String },
    description: { type: String },
    unlockedAt: { type: String },
    icon: { type: String }
  }]
}, { timestamps: true });

// --- Period Log Schema ---
const PeriodLogSchema = new Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  date: { type: String, required: true },
  flow: { type: String, enum: ['none', 'light', 'medium', 'heavy'], default: 'none' },
  pain: { type: String, enum: ['none', 'mild', 'moderate', 'severe'], default: 'none' },
  symptoms: [{ type: String }],
  mood: { type: String, default: 'calm' },
  notes: { type: String, default: '' }
}, { timestamps: true });

// --- Consultation Schema ---
const ConsultationSchema = new Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  doctorName: { type: String, required: true },
  specialty: { type: String, enum: ['Gynecologist', 'Nutritionist', 'Psychologist', 'Counsellor'], required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ['upcoming', 'completed', 'cancelled'], default: 'upcoming' },
  notes: { type: String, default: '' }
}, { timestamps: true });

// --- Article Schema ---
const ArticleSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  readTime: { type: String, required: true },
  coverImage: { type: String, required: true },
  doctorApproved: { type: Boolean, default: true },
  bookmarks: [{ type: String }], // array of userIds
  videoUrl: { type: String }
}, { timestamps: true });

// --- Community Post Schema ---
const CommunityPostSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  isAnonymous: { type: Boolean, default: false },
  authorName: { type: String, required: true },
  authorAvatar: { type: String },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: String }],
  comments: [{
    id: { type: String, required: true },
    authorName: { type: String, required: true },
    authorAvatar: { type: String },
    content: { type: String, required: true },
    date: { type: String, required: true }
  }],
  reports: { type: Number, default: 0 },
  reportedBy: [{ type: String }],
  createdAt: { type: String, required: true }
}, { timestamps: true });

// --- Wellness Tracker Schema ---
const WellnessTrackerSchema = new Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  date: { type: String, required: true },
  waterIntake: { type: Number, default: 0 },
  sleepHours: { type: Number, default: 0 },
  mood: { type: String, default: 'calm' },
  exerciseMinutes: { type: Number, default: 0 },
  meditationMinutes: { type: Number, default: 0 },
  journalEntry: { type: String, default: '' },
  affirmation: { type: String },
  completedChallenge: { type: Boolean, default: false }
}, { timestamps: true });

// --- OTP Verification Schema ---
const OtpSchema = new Schema({
  email: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 } // automatically delete after 10 mins
});

export const MongoUser = mongoose.models.User || mongoose.model('User', UserSchema);
export const MongoPeriodLog = mongoose.models.PeriodLog || mongoose.model('PeriodLog', PeriodLogSchema);
export const MongoConsultation = mongoose.models.Consultation || mongoose.model('Consultation', ConsultationSchema);
export const MongoArticle = mongoose.models.Article || mongoose.model('Article', ArticleSchema);
export const MongoCommunityPost = mongoose.models.CommunityPost || mongoose.model('CommunityPost', CommunityPostSchema);
export const MongoWellnessTracker = mongoose.models.WellnessTracker || mongoose.model('WellnessTracker', WellnessTrackerSchema);
export const MongoOtp = mongoose.models.Otp || mongoose.model('Otp', OtpSchema);

// ==================== SEED DATA ====================

const SEED_ARTICLES = [
  {
    id: 'art-1',
    title: 'Demystifying the Menstrual Cycle: A Guide to the Four Phases',
    category: 'understanding-periods',
    excerpt: 'Understand how your body moves through the menstrual, follicular, ovulatory, and luteal phases, and how to harness your energy in each.',
    content: `Your menstrual cycle is much more than just your period. It is a monthly cycle of hormone changes divided into four distinct phases:

1. **The Menstrual Phase (Days 1-5):**
   This is when your progesterone and estrogen levels drop, signaling the uterine lining to shed. Energy levels are usually at their lowest, making it a perfect time for gentle rest, warmth, and reflection.

2. **The Follicular Phase (Days 6-14):**
   Your brain releases follicle-stimulating hormone (FSH) to mature eggs. Estrogen levels start to rise, boosting your physical energy, memory, and cognitive focus. It is an excellent time to start new projects or engage in intense workouts.

3. **The Ovulatory Phase (Days 14-17):**
   An egg is released from the ovary. Estrogen and luteinizing hormone (LH) peak, enhancing confidence, social energy, and libido. This is your fertility window.

4. **The Luteal Phase (Days 18-28):**
   Progesterone rises to prepare the uterine lining for potential pregnancy. If fertilization doesn't occur, progesterone drops, leading to premenstrual symptoms (PMS) such as bloating, mood swings, or fatigue. Focus on nourishing food and stress reduction.`,
    readTime: '4 min read',
    coverImage: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=600&auto=format&fit=crop',
    doctorApproved: true,
    bookmarks: [],
    videoUrl: 'https://www.youtube.com/embed/2_mD8S-pbeU'
  },
  {
    id: 'art-2',
    title: 'Menstrual Cups vs. Pads vs. Tampons: Which is Right for You?',
    category: 'hygiene-products',
    excerpt: 'An unbiased comparison of modern period products, discussing comfort, cost, eco-friendliness, and hygiene best practices.',
    content: `Choosing a menstrual product is a highly personal decision. Let's compare the most common options available today:

1. **Menstrual Cups & Discs:**
   * **What they are:** Flexible silicone cups worn internally to collect (rather than absorb) fluid.
   * **Pros:** Can be worn for up to 12 hours, eco-friendly (reusable for up to 10 years), highly economical in the long run, and does not cause dryness.
   * **Cons:** Has a learning curve for insertion/removal and requires access to clean water to rinse between uses.

2. **Sanitary Pads (Disposable & Cloth):**
   * **What they are:** Absorbent liners worn in undergarments. Reusable cloth pads are made of organic cotton.
   * **Pros:** Extremely easy to use, external (no internal insertion required), and cloth pads are eco-friendly and rash-free.
   * **Cons:** Disposables generate plastic waste and may contain chemical bleaching agents that irritate sensitive skin. Requires frequent changes (every 4-6 hours) to maintain hygiene.

3. **Tampons:**
   * **What they are:** Small cylinders of compressed cotton/rayon inserted internally with or without an applicator.
   * **Pros:** Highly discreet, great for swimming and sports, and comfortable when inserted correctly.
   * **Cons:** Risk of Toxic Shock Syndrome (TSS) if left in for over 8 hours. Can cause micro-tears and dryness in the vaginal canal.`,
    readTime: '6 min read',
    coverImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop',
    doctorApproved: true,
    bookmarks: []
  },
  {
    id: 'art-3',
    title: 'Living with PCOS/PCOD: Nutritional & Exercise Protocols',
    category: 'pcos-pcod',
    excerpt: 'Discover doctor-approved lifestyle changes to regulate ovulation, manage insulin resistance, and balance hormones naturally.',
    content: `Polycystic Ovary Syndrome (PCOS) is a common hormonal disorder affecting millions of women worldwide. Common symptoms include irregular periods, excess hair growth, acne, and weight gain, often driven by insulin resistance. 

Here is how you can manage PCOS effectively through lifestyle:

### 1. Dietary Adjustments (Managing Insulin)
* **Focus on Complex Carbs:** Avoid white flour, sugary drinks, and processed snacks. Opt for oats, quinoa, brown rice, and lentils, which digest slowly and prevent insulin spikes.
* **Incorporate Anti-Inflammatory Foods:** Load up on leafy greens, berries, olive oil, and wild fish. PCOS is associated with low-grade chronic inflammation.
* **Don't Forget Protein:** Pair healthy fats and proteins with every meal to keep blood sugar stable.

### 2. Tailoring Your Exercise
* **Strength Training:** Building muscle increases insulin sensitivity, helping your body process glucose more efficiently. Aim for 2-3 sessions a week.
* **Low-Intensity Steady State (LISS) & Yoga:** High-intensity interval training (HIIT) can sometimes raise cortisol (stress hormone) levels too high. Slow, steady walking, cycling, or yoga helps reduce cortisol and improve stress resilience.

### 3. Sleep & Stress Management
High stress and poor sleep exacerbate insulin resistance and disrupt progesterone production. Aim for 7-8 hours of sleep and introduce mindfulness or breathing exercises.`,
    readTime: '5 min read',
    coverImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop',
    doctorApproved: true,
    bookmarks: []
  },
  {
    id: 'art-4',
    title: 'Menstrual Hygiene Myths and the Medical Truths Behind Them',
    category: 'myths',
    excerpt: 'Breaking down age-old taboos around pickles, bathing, exercise, and dark blood, backed by scientific medical consensus.',
    content: `Menstruation is surrounded by centuries of taboos and misconceptions across cultures. Let's separate medical fact from cultural fiction:

### Myth 1: "You shouldn't exercise or wash your hair during your period."
* **The Truth:** Exercise actually helps release endorphins, which act as natural painkillers to relieve menstrual cramps! Bathing with warm water is highly recommended to maintain hygiene and relax uterine muscles.

### Myth 2: "Dark menstrual blood means your body is full of toxins."
* **The Truth:** Menstrual blood color varies from bright red to dark brown or black. Darker blood simply means the blood has taken longer to exit the uterus and has oxidized. It is completely normal, especially at the start or end of your period.

### Myth 3: "Menstruating women shouldn't touch pickles or enter the kitchen."
* **The Truth:** This myth originated before modern refrigeration and hygiene products. It has absolutely no biological basis. Menstruation is a clean, natural physiological process that does not spoil food!`,
    readTime: '3 min read',
    coverImage: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=600&auto=format&fit=crop',
    doctorApproved: true,
    bookmarks: []
  }
];

const SEED_POSTS = [
  {
    id: 'post-1',
    title: 'How I managed to get my periods back naturally after 10 months of amenorrhea (PCOS journey)',
    content: 'Hi sisters! I was diagnosed with PCOS 2 years ago and my periods stopped completely. I was terrified. Instead of just taking birth control pills, I focused on diet changes (spearmint tea every day, low GI meals, and cutting down on sugar) and resistance training. Last week, I finally got my period back naturally! For anyone struggling, hang in there, your body can heal! ❤️',
    category: 'PCOS/PCOD',
    isAnonymous: true,
    authorName: 'Anonymous Butterfly',
    authorAvatar: '🦋',
    likes: 42,
    likedBy: [],
    comments: [
      {
        id: 'c-1',
        authorName: 'Dr. Sarah Patel',
        authorAvatar: '👩‍⚕️',
        content: 'Congratulations on your recovery! Spearmint tea is indeed backed by clinical studies for reducing free testosterone in PCOS patients. Keep up the amazing work.',
        date: '2026-07-11T14:30:00Z'
      }
    ],
    reports: 0,
    reportedBy: [],
    createdAt: '2026-07-10T12:00:00Z'
  },
  {
    id: 'post-2',
    title: 'Any suggestions for severe first-day menstrual cramps?',
    content: 'My cramps on Day 1 are so crippling that I can barely get out of bed. Painkillers sometimes don\'t work. Are there any natural remedies or stretches that help you cope? I hate missing school/work every single month.',
    category: 'Period Talk',
    isAnonymous: false,
    authorName: 'Maya Sharma',
    authorAvatar: '🌸',
    likes: 18,
    likedBy: [],
    comments: [
      {
        id: 'c-2',
        authorName: 'Elena Rostova',
        authorAvatar: '🧘‍♀️',
        content: 'Try doing child\'s pose and cat-cow stretches! Also, drinking hot ginger water and placing a heating pad on your lower back does wonders for relaxing the pelvic muscles.',
        date: '2026-07-11T16:45:00Z'
      },
      {
        id: 'c-3',
        authorName: 'Aisha K.',
        authorAvatar: '💖',
        content: 'Taking magnesium supplements a few days before your expected start date helps reduce the severity of muscle spasms.',
        date: '2026-07-11T18:00:00Z'
      }
    ],
    reports: 0,
    reportedBy: [],
    createdAt: '2026-07-11T09:15:00Z'
  }
];

// ==================== MONGO DB CLIENT & ADAPTERS ====================

let isMongoConnected = false;

export async function connectToMongoDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes('YOUR_MONGODB_URI_HERE') || uri.trim() === '') {
    console.warn('[MongoDB] WARNING: MONGODB_URI environment variable is not defined or is blank! Please configure it in your Settings > Secrets panel or .env file.');
    isMongoConnected = false;
    return false;
  }

  try {
    if (mongoose.connection.readyState === 1) {
      isMongoConnected = true;
      return true;
    }

    await mongoose.connect(uri);
    isMongoConnected = true;
    console.log('[MongoDB] Successfully connected to your MongoDB Database!');
    
    // Seed default articles and posts if they do not exist
    await seedDefaultDataIfEmpty();
    return true;
  } catch (err) {
    console.error('[MongoDB] Connection failed:', err);
    isMongoConnected = false;
    return false;
  }
}

export function checkMongoConnection() {
  return isMongoConnected && mongoose.connection.readyState === 1;
}

async function seedDefaultDataIfEmpty() {
  try {
    const articleCount = await MongoArticle.countDocuments();
    if (articleCount === 0) {
      console.log('[MongoDB] Article collection is empty. Seeding default medical-audited articles...');
      await MongoArticle.insertMany(SEED_ARTICLES);
      console.log(`[MongoDB] Successfully seeded ${SEED_ARTICLES.length} articles!`);
    }

    const postCount = await MongoCommunityPost.countDocuments();
    if (postCount === 0) {
      console.log('[MongoDB] Community post collection is empty. Seeding default posts...');
      await MongoCommunityPost.insertMany(SEED_POSTS);
      console.log(`[MongoDB] Successfully seeded ${SEED_POSTS.length} community posts!`);
    }
  } catch (err) {
    console.error('[MongoDB] Error during seeding:', err);
  }
}

// Direct database adapters - clean and dedicated to MongoDB (no localDB dual fallback)
export const dbAdapter = {
  // --- Users & Passwords ---
  async findUserById(id) {
    if (!checkMongoConnection()) await connectToMongoDB();
    try {
      return await MongoUser.findOne({ id }).lean();
    } catch (err) {
      console.error('Mongo Error in findUserById:', err);
      throw err;
    }
  },

  async findUserByEmail(email) {
    if (!checkMongoConnection()) await connectToMongoDB();
    try {
      return await MongoUser.findOne({ email: email.toLowerCase() }).lean();
    } catch (err) {
      console.error('Mongo Error in findUserByEmail:', err);
      throw err;
    }
  },

  async getPassword(userId) {
    if (!checkMongoConnection()) await connectToMongoDB();
    try {
      const user = await MongoUser.findOne({ id: userId }).select('password').lean();
      return user ? user.password : null;
    } catch (err) {
      console.error('Mongo Error in getPassword:', err);
      throw err;
    }
  },

  async saveUser(user, passwordPlain) {
    if (!checkMongoConnection()) await connectToMongoDB();
    try {
      const updateData = { ...user };
      if (passwordPlain !== undefined) {
        updateData.password = passwordPlain;
      }
      await MongoUser.findOneAndUpdate(
        { id: user.id },
        { $set: updateData },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error('Mongo Error in saveUser:', err);
      throw err;
    }
  },

  async deleteUser(id) {
    if (!checkMongoConnection()) await connectToMongoDB();
    try {
      await MongoUser.deleteOne({ id });
      await MongoPeriodLog.deleteMany({ userId: id });
      await MongoConsultation.deleteMany({ userId: id });
      await MongoWellnessTracker.deleteMany({ userId: id });
    } catch (err) {
      console.error('Mongo Error in deleteUser:', err);
      throw err;
    }
  },

  async getUsers() {
    if (!checkMongoConnection()) await connectToMongoDB();
    try {
      return await MongoUser.find().lean();
    } catch (err) {
      console.error('Mongo Error in getUsers:', err);
      throw err;
    }
  },

  // --- OTPs ---
  async getOTP(email) {
    if (!checkMongoConnection()) await connectToMongoDB();
    try {
      const otp = await MongoOtp.findOne({ email: email.toLowerCase() }).lean();
      return otp ? otp.code : null;
    } catch (err) {
      console.error('Mongo Error in getOTP:', err);
      throw err;
    }
  },

  async setOTP(email, code) {
    if (!checkMongoConnection()) await connectToMongoDB();
    try {
      await MongoOtp.findOneAndUpdate(
        { email: email.toLowerCase() },
        { code, createdAt: new Date() },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error('Mongo Error in setOTP:', err);
      throw err;
    }
  },

  async deleteOTP(email) {
    if (!checkMongoConnection()) await connectToMongoDB();
    try {
      await MongoOtp.deleteOne({ email: email.toLowerCase() });
    } catch (err) {
      console.error('Mongo Error in deleteOTP:', err);
      throw err;
    }
  },

  // --- Period Logs ---
  async getPeriodLogs(userId) {
    if (!checkMongoConnection()) await connectToMongoDB();
    try {
      return await MongoPeriodLog.find({ userId }).sort({ date: -1 }).lean();
    } catch (err) {
      console.error('Mongo Error in getPeriodLogs:', err);
      throw err;
    }
  },

  async savePeriodLog(log) {
    if (!checkMongoConnection()) await connectToMongoDB();
    try {
      await MongoPeriodLog.findOneAndUpdate(
        { id: log.id },
        { $set: log },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error('Mongo Error in savePeriodLog:', err);
      throw err;
    }
  },

  async deletePeriodLog(id) {
    if (!checkMongoConnection()) await connectToMongoDB();
    try {
      await MongoPeriodLog.deleteOne({ id });
    } catch (err) {
      console.error('Mongo Error in deletePeriodLog:', err);
      throw err;
    }
  },

  // --- Articles ---
  async getArticles(search, category) {
    if (!checkMongoConnection()) await connectToMongoDB();
    try {
      const query = {};
      if (category) {
        query.category = category;
      }
      if (search) {
        const regex = new RegExp(search, 'i');
        query.$or = [
          { title: regex },
          { excerpt: regex },
          { content: regex }
        ];
      }
      return await MongoArticle.find(query).lean();
    } catch (err) {
      console.error('Mongo Error in getArticles:', err);
      throw err;
    }
  },

  async saveArticle(article) {
    if (!checkMongoConnection()) await connectToMongoDB();
    try {
      await MongoArticle.findOneAndUpdate(
        { id: article.id },
        { $set: article },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error('Mongo Error in saveArticle:', err);
      throw err;
    }
  },

  // --- Consultations ---
  async getConsultations(userId) {
    if (!checkMongoConnection()) await connectToMongoDB();
    try {
      return await MongoConsultation.find({ userId }).lean();
    } catch (err) {
      console.error('Mongo Error in getConsultations:', err);
      throw err;
    }
  },

  async getAllConsultations() {
    if (!checkMongoConnection()) await connectToMongoDB();
    try {
      return await MongoConsultation.find().lean();
    } catch (err) {
      console.error('Mongo Error in getAllConsultations:', err);
      throw err;
    }
  },

  async saveConsultation(consultation) {
    if (!checkMongoConnection()) await connectToMongoDB();
    try {
      await MongoConsultation.findOneAndUpdate(
        { id: consultation.id },
        { $set: consultation },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error('Mongo Error in saveConsultation:', err);
      throw err;
    }
  },

  // --- Wellness Trackers ---
  async getWellnessTracker(userId, date) {
    if (!checkMongoConnection()) await connectToMongoDB();
    try {
      return await MongoWellnessTracker.findOne({ userId, date }).lean();
    } catch (err) {
      console.error('Mongo Error in getWellnessTracker:', err);
      throw err;
    }
  },

  async saveWellnessTracker(tracker) {
    if (!checkMongoConnection()) await connectToMongoDB();
    try {
      await MongoWellnessTracker.findOneAndUpdate(
        { id: tracker.id },
        { $set: tracker },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error('Mongo Error in saveWellnessTracker:', err);
      throw err;
    }
  },

  // --- Community Posts ---
  async getCommunityPosts() {
    if (!checkMongoConnection()) await connectToMongoDB();
    try {
      return await MongoCommunityPost.find().sort({ createdAt: -1 }).lean();
    } catch (err) {
      console.error('Mongo Error in getCommunityPosts:', err);
      throw err;
    }
  },

  async saveCommunityPost(post) {
    if (!checkMongoConnection()) await connectToMongoDB();
    try {
      await MongoCommunityPost.findOneAndUpdate(
        { id: post.id },
        { $set: post },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error('Mongo Error in saveCommunityPost:', err);
      throw err;
    }
  },

  async deleteCommunityPost(id) {
    if (!checkMongoConnection()) await connectToMongoDB();
    try {
      await MongoCommunityPost.deleteOne({ id });
    } catch (err) {
      console.error('Mongo Error in deleteCommunityPost:', err);
      throw err;
    }
  }
};
