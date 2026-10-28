-- ==============================================================================
-- LiftIQ / Kinetic Obsidian - Exercise Library Seed Data
-- 78 Comprehensive Preset Exercises across all major muscle groups
-- ==============================================================================

insert into public.exercises (name, muscle_group, equipment, movement_type, target_muscle, description)
values
  -- CHEST
  ('Barbell Incline Bench Press', 'Chest', 'Barbell', 'compound', 'Upper Pectoralis', 'Primary compound lift for upper chest and anterior deltoid hypertrophy.'),
  ('Flat Barbell Bench Press', 'Chest', 'Barbell', 'compound', 'Mid Pectoralis', 'Standard powerbuilding compound for overall pectoralis major mass.'),
  ('Decline Barbell Bench Press', 'Chest', 'Barbell', 'compound', 'Lower Pectoralis', 'Emphasizes lower sternal and costal fibers of the chest.'),
  ('Incline Dumbbell Press', 'Chest', 'Dumbbells', 'compound', 'Upper Pectoralis', 'Offers greater range of motion and unilateral stabilizer recruitment for upper chest.'),
  ('Flat Dumbbell Press', 'Chest', 'Dumbbells', 'compound', 'Mid Pectoralis', 'Free range dumbbell pressing allowing natural convergent hand paths.'),
  ('Dumbbell Incline Flyes', 'Chest', 'Dumbbells', 'isolation', 'Sternal Pectoralis', 'Deep stretch chest movement emphasizing eccentric lengthening.'),
  ('High-to-Low Cable Flyes', 'Chest', 'Cable', 'isolation', 'Lower Costal', 'Isolates lower pectoralis without heavy anterior shoulder kapsule strain.'),
  ('Low-to-High Cable Flyes', 'Chest', 'Cable', 'isolation', 'Clavicular Head', 'Scooping cable motion focusing on upper chest fiber alignment.'),
  ('Chest Dips', 'Chest', 'Bodyweight', 'compound', 'Lower Pectoralis', 'Forward torso lean bodyweight compound targeting lower chest and triceps.'),
  ('Machine Chest Press', 'Chest', 'Machine', 'compound', 'Mid Pectoralis', 'Fixed-path pressing to train close to failure safely.'),

  -- BACK (Lats / Width)
  ('Wide-Grip Lat Pulldown', 'Back', 'Cable', 'compound', 'Latissimus Dorsi', 'Primary vertical pulling movement for lat width and iliac fiber recruitment.'),
  ('Neutral-Grip Lat Pulldown', 'Back', 'Cable', 'compound', 'Latissimus Dorsi', 'Shoulder-friendly pulling variation with high lat recruitment.'),
  ('Pull-Ups', 'Back', 'Bodyweight', 'compound', 'Latissimus Dorsi', 'King of vertical bodyweight pulling exercises for back width.'),
  ('Chin-Ups', 'Back', 'Bodyweight', 'compound', 'Lats & Biceps', 'Supinated grip vertical pull engaging both lats and biceps brachii.'),
  ('Single-Arm Cable Lat Pulldown', 'Back', 'Cable', 'isolation', 'Iliac Lat Fibers', 'Allows side bend and pure sagittal plane lat drive for maximum mind-muscle connection.'),
  ('Straight-Arm Cable Pulldown', 'Back', 'Cable', 'isolation', 'Latissimus Dorsi', 'Pure lat isolation movement eliminating bicep fatigue.'),

  -- BACK (Thickness / Rhomboids / Traps)
  ('Barbell Bent-Over Row', 'Back', 'Barbell', 'compound', 'Upper Back & Lats', 'Foundational horizontal pulling power movement.'),
  ('Chest-Supported T-Bar Row', 'Back', 'Machine', 'compound', 'Upper Back & Rhomboids', 'Heavy upper back pulling without lower back spinal load.'),
  ('Seated Cable Row', 'Back', 'Cable', 'compound', 'Mid-Traps & Rhomboids', 'Versatile horizontal cable row with sustained tension.'),
  ('Single-Arm Dumbbell Row', 'Back', 'Dumbbells', 'compound', 'Lats & Mid-Back', 'Unilateral rowing providing deep eccentric lat stretch at the bottom.'),
  ('Meadows Row', 'Back', 'Barbell', 'compound', 'Upper Back', 'Landmine corner row designed for deep upper back and lat contraction.'),
  ('Face Pulls', 'Back', 'Cable', 'isolation', 'Rear Delts & Lower Traps', 'Essential posture, rotator cuff, and upper back health movement.'),
  ('Barbell Shrugs', 'Back', 'Barbell', 'isolation', 'Upper Trapezius', 'Direct upper trap loading through scapular elevation.'),

  -- LEGS (Quads)
  ('Barbell Back Squat', 'Legs', 'Barbell', 'compound', 'Quadriceps & Glutes', 'Foundational lower body compound for total leg mass and strength.'),
  ('Barbell Front Squat', 'Legs', 'Barbell', 'compound', 'Quadriceps', 'Upright torso quad-dominant squat emphasizing knee flexion.'),
  ('Hack Squat', 'Legs', 'Machine', 'compound', 'Vastus Lateralis', 'Machine squat allowing deep knee flexion with complete back support.'),
  ('Leg Press (45-degree)', 'Legs', 'Machine', 'compound', 'Quadriceps', 'High-volume machine compound for leg overload.'),
  ('Bulgarian Split Squat', 'Legs', 'Dumbbells', 'compound', 'Quads & Glutes', 'Brutal unilateral compound for leg development and stability.'),
  ('Leg Extensions', 'Legs', 'Machine', 'isolation', 'Rectus Femoris', 'Direct quad isolation emphasizing peak contraction at full extension.'),
  ('Walking Dumbbell Lunges', 'Legs', 'Dumbbells', 'compound', 'Quads & Glutes', 'Dynamic unilateral movement for quad hypertrophy and glute drive.'),

  -- LEGS (Hamstrings & Glutes)
  ('Barbell Romanian Deadlift (RDL)', 'Legs', 'Barbell', 'compound', 'Hamstrings & Glutes', 'Hinge movement targeting eccentric hamstring loading and glute stretch.'),
  ('Conventional Barbell Deadlift', 'Legs', 'Barbell', 'compound', 'Posterior Chain', 'Ultimate total-body pull developing full posterior chain thickness.'),
  ('Seated Leg Curl', 'Legs', 'Machine', 'isolation', 'Hamstrings', 'Loads hamstrings in hip-flexed position where they are strongest.'),
  ('Lying Leg Curl', 'Legs', 'Machine', 'isolation', 'Hamstrings', 'Classic prone hamstring curl targeting distal fibers.'),
  ('Barbell Hip Thrust', 'Legs', 'Barbell', 'compound', 'Gluteus Maximus', 'Highest glute peak contraction loading angle in strength training.'),
  ('Dumbbell Romanian Deadlift', 'Legs', 'Dumbbells', 'compound', 'Hamstrings', 'Dumbbell hinge allowing free arm path alongside the shins.'),

  -- SHOULDERS
  ('Overhead Barbell Press (OHP)', 'Shoulders', 'Barbell', 'compound', 'Anterior Deltoids', 'Primary vertical pressing power movement for shoulder strength.'),
  ('Seated Dumbbell Shoulder Press', 'Shoulders', 'Dumbbells', 'compound', 'Anterior & Lateral Delts', 'Stable overhead pressing with unilateral freedom of movement.'),
  ('Standing Dumbbell Lateral Raise', 'Shoulders', 'Dumbbells', 'isolation', 'Lateral Deltoids', 'Essential isolation movement for capped shoulder width.'),
  ('Cable Lateral Raise', 'Shoulders', 'Cable', 'isolation', 'Lateral Deltoids', 'Provides constant mechanical tension through the entire arc.'),
  ('Reverse Pec Deck Flyes', 'Shoulders', 'Machine', 'isolation', 'Posterior Deltoids', 'Stable machine isolation for rear delts and mid-traps.'),
  ('Dumbbell Rear Delt Flyes', 'Shoulders', 'Dumbbells', 'isolation', 'Posterior Deltoids', 'Bent-over flyes targeting posterior head of the deltoid.'),
  ('Cable Upright Row', 'Shoulders', 'Cable', 'compound', 'Lateral Delts & Traps', 'Rope or bar upright row with elbows driving out for shoulder width.'),

  -- ARMS (Triceps)
  ('Close-Grip Barbell Bench Press', 'Triceps', 'Barbell', 'compound', 'Triceps Brachii', 'Heavy pressing compound focusing on tricep lockout strength.'),
  ('Cable Triceps Rope Pushdown', 'Triceps', 'Cable', 'isolation', 'Lateral Head', 'High-tension cable pushdown with wrist pronation at bottom.'),
  ('Barbell Skull Crushers', 'Triceps', 'Barbell', 'isolation', 'Medial & Long Head', 'Classic lying tricep extension behind the forehead.'),
  ('Overhead Cable Triceps Extension', 'Triceps', 'Cable', 'isolation', 'Long Head', 'Places triceps long head on deep stretch for maximum hypertrophy.'),
  ('Weighted Tricep Dips', 'Triceps', 'Bodyweight', 'compound', 'Triceps Brachii', 'Upright dip posture overloading triceps through full flexion/extension.'),
  ('Dumbbell Overhead Extension', 'Triceps', 'Dumbbells', 'isolation', 'Long Head', 'Single or dual dumbbell extension behind the neck.'),

  -- ARMS (Biceps)
  ('Standing Barbell Bicep Curl', 'Biceps', 'Barbell', 'isolation', 'Biceps Brachii', 'Foundational mass builder for overall bicep development.'),
  ('Incline Dumbbell Curl', 'Biceps', 'Dumbbells', 'isolation', 'Long Head', 'Deep stretch angle for bicep long head and outer peak.'),
  ('Preacher Curl (EZ-Bar)', 'Biceps', 'Barbell', 'isolation', 'Short Head', 'Arm locked against pad eliminating shoulder momentum.'),
  ('Hammer Curls (Dumbbell)', 'Biceps', 'Dumbbells', 'isolation', 'Brachialis & Forearms', 'Neutral grip curl developing arm thickness and forearm size.'),
  ('Cable Bicep Curl', 'Biceps', 'Cable', 'isolation', 'Biceps Brachii', 'Continuous tension through entire range of motion.'),
  ('Concentration Curl', 'Biceps', 'Dumbbells', 'isolation', 'Biceps Peak', 'Strict seated isolation focusing on maximal peak contraction.'),

  -- CORE / ABS
  ('Hanging Leg Raise', 'Core', 'Bodyweight', 'isolation', 'Lower Abs', 'Dynamic hanging movement developing lower abdominal and hip flexor control.'),
  ('Cable Kneeling Crunch', 'Core', 'Cable', 'isolation', 'Rectus Abdominis', 'Progressively overloadable cable exercise for abdominal muscle thickness.'),
  ('Ab Wheel Rollout', 'Core', 'Bodyweight', 'compound', 'Full Core & Bracing', 'Challenging anti-extension movement for deep core stability.'),
  ('Plank', 'Core', 'Bodyweight', 'compound', 'Transverse Abdominis', 'Isometric core hold building foundational bracing endurance.'),
  ('Russian Twists', 'Core', 'Bodyweight', 'isolation', 'Obliques', 'Rotational core exercise targeting internal and external obliques.'),

  -- CALVES
  ('Standing Calf Raise', 'Calves', 'Machine', 'isolation', 'Gastrocnemius', 'Straight-leg calf raise loading gastrocnemius under full stretch.'),
  ('Seated Calf Raise', 'Calves', 'Machine', 'isolation', 'Soleus', 'Bent-knee calf raise isolating deep soleus muscle.')
on conflict do nothing;

