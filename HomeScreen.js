import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from 'react-native';

// ─────────────────────────────────────────────
//  Reusable Sub-Components
// ─────────────────────────────────────────────

/** Single skill tag with a coloured dot */
const SkillTag = ({ label, dotColor }) => (
  <View style={styles.tag}>
    <View style={[styles.dot, { backgroundColor: dotColor }]} />
    <Text style={styles.tagText}>{label}</Text>
  </View>
);

/** One experience row */
const ExpItem = ({ initial, bgColor, textColor, role, company, year }) => (
  <View style={styles.expItem}>
    <View style={[styles.expLogo, { backgroundColor: bgColor }]}>
      <Text style={[styles.expInitial, { color: textColor }]}>{initial}</Text>
    </View>
    <View style={styles.expInfo}>
      <Text style={styles.expRole}>{role}</Text>
      <Text style={styles.expCo}>{company}</Text>
    </View>
    <Text style={styles.expYr}>{year}</Text>
  </View>
);

/** One achievement / certification row */
const AchItem = ({ title, subtitle }) => (
  <View style={styles.achItem}>
    <View style={styles.achDot} />
    <Text style={styles.achText}>
      <Text style={styles.achBold}>{title}</Text>
      {subtitle ? <Text style={styles.achSub}>{'  '}{subtitle}</Text> : null}
    </Text>
  </View>
);

/** Card container with header */
const Card = ({ iconBg, iconColor, iconPath, title, children }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={[styles.cardIcon, { backgroundColor: iconBg }]}>
        <Text style={{ color: iconColor, fontSize: 14 }}>{iconPath}</Text>
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

// ─────────────────────────────────────────────
//  Main HomeScreen
// ─────────────────────────────────────────────

const HomeScreen = ({ navigation }) => {

  const skills = [
    { label: 'React Native', dotColor: '#3b82f6' },
    { label: 'React.js',     dotColor: '#61dafb' },
    { label: 'JavaScript',   dotColor: '#f59e0b' },
    { label: 'HTML5 / CSS3', dotColor: '#f24e1e' },
    { label: 'Bootstrap 5',  dotColor: '#7c3aed' },
    { label: 'Angular',      dotColor: '#dd0031' },
    { label: 'Python',       dotColor: '#3b82f6' },
    { label: 'MySQL',        dotColor: '#22c55e' },
    { label: 'Salesforce',   dotColor: '#00a1e0' },
    { label: 'Git / GitHub', dotColor: '#374151' },
  ];

  const experience = [
    {
      initial: 'P', bgColor: '#ede9fc', textColor: '#7c6ec7',
      role: 'Software Engineer Intern',
      company: 'PricewaterhouseCoopers (PwC)',
      year: '2025 – Present',
    },
    {
      initial: 'B', bgColor: '#e6eef9', textColor: '#4a7fc1',
      role: 'SDE Intern',
      company: 'Bluestock Fintech',
      year: 'Jul – Aug 2024',
    },
  ];

  const achievements = [
    {
      title: 'Salesforce Trailhead Ranger Rank',
      subtitle: '100+ badges · 60,000+ points',
    },
    {
      title: 'Salesforce Service Cloud Consultant',
      subtitle: 'Trailhead (Aug 2025)',
    },
    {
      title: 'Developing Front-End Apps with React',
      subtitle: 'IBM / Coursera (Apr 2024)',
    },
    {
      title: 'Azure Data Fundamentals Challenge',
      subtitle: 'Microsoft Learn (Feb 2024)',
    },
    {
      title: 'TVS Credit E.P.I.C 7.0 – Analytics Challenge',
      subtitle: 'Unstop',
    },
    {
      title: 'Summer Training – Python, Web Apps & GitHub',
      subtitle: 'Pragyatmika',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Section ── */}
        <View style={styles.hero}>

          {/* Back button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation && navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>

          {/* Avatar */}
          <View style={styles.avatarWrap}>
            <Image
              // ── Place MyPic.jpeg in your project's assets/ folder,
              //    then change this to: require('../assets/MyPic.jpeg')
              source={require('C:/Users/MY HP lappy/Pictures/MyPic.jpeg')}
              style={styles.avatar}
              // Fallback initial shown if image fails to load
              defaultSource={{ uri: 'data:image/png;base64,' }}
            />
            {/* Verified badge */}
            <View style={styles.badge}>
              <Text style={styles.badgeTick}>✓</Text>
            </View>
          </View>

          {/* Identity */}
          <Text style={styles.name}>Ayush Satpathy</Text>
          <Text style={styles.roleText}>Software Engineer Intern</Text>

          {/* Company pill */}
          <View style={styles.companyLine}>
            <Text style={styles.companyLabel}>💼  Currently working for: </Text>
            <Text style={styles.companyName}>PwC</Text>
          </View>

          {/* Bio */}
          <Text style={styles.bio}>
            Highly motivated CS undergrad skilled in React Native, React.js, JavaScript,
            and Salesforce. Passionate about building intuitive, high-performance apps
            and delivering quality code in line with industry standards.
          </Text>
        </View>

        {/* ── Divider ── */}
        <View style={styles.divider} />

        {/* ── Cards Section ── */}
        <View style={styles.cards}>

          {/* Skills Card */}
          <Card iconBg="#ede9fc" iconColor="#7c6ec7" iconPath="⚡" title="Skillset">
            <View style={styles.skillTags}>
              {skills.map((s, i) => (
                <SkillTag key={i} label={s.label} dotColor={s.dotColor} />
              ))}
            </View>
          </Card>

          {/* Experience Card */}
          <Card iconBg="#e6eef9" iconColor="#4a7fc1" iconPath="💼" title="Experience">
            {experience.map((e, i) => (
              <ExpItem key={i} {...e} />
            ))}
          </Card>

          {/* Achievements & Certifications Card */}
          <Card iconBg="#fdf1dc" iconColor="#c98a10" iconPath="★" title="Achievements & Certifications">
            {achievements.map((a, i) => (
              <AchItem key={i} title={a.title} subtitle={a.subtitle} />
            ))}
          </Card>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────
//  Styles
// ─────────────────────────────────────────────

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: '#eceaf8',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // ── Hero ────────────────────────────────────
  hero: {
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: 28,
    paddingHorizontal: 24,
    // subtle gradient-like effect with solid bg
    backgroundColor: '#eceaf8',
  },

  backBtn: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 34,
    height: 34,
    backgroundColor: '#fff',
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 6,
  },
  backArrow: {
    fontSize: 22,
    color: '#888',
    lineHeight: 26,
    marginTop: -2,
  },

  avatarWrap: {
    position: 'relative',
    marginBottom: 14,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#b8a9e8', // shown while image loads
  },
  badge: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    width: 24,
    height: 24,
    backgroundColor: '#4a90e2',
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTick: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },

  name: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2d2150',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  roleText: {
    fontSize: 13,
    color: '#8a82aa',
    marginBottom: 10,
    letterSpacing: 0.3,
  },

  companyLine: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#6450b4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 4,
  },
  companyLabel: {
    fontSize: 12.5,
    color: '#6b6380',
  },
  companyName: {
    fontSize: 12.5,
    color: '#4a3fa0',
    fontWeight: '700',
  },

  bio: {
    fontSize: 13,
    color: '#7b748f',
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 380,
  },

  // ── Divider ─────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: 'rgba(160,140,220,0.18)',
    marginHorizontal: 20,
  },

  // ── Cards ────────────────────────────────────
  cards: {
    paddingTop: 20,
    paddingHorizontal: 16,
    gap: 12, // RN 0.71+ supports gap; use marginBottom on card otherwise
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#6450b4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  cardIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2d2150',
    marginLeft: 10,
  },

  // ── Skill Tags ──────────────────────────────
  skillTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f3fc',
    borderWidth: 1,
    borderColor: '#e4dffa',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginBottom: 7,
    marginRight: 7,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4a3fa0',
  },

  // ── Experience ──────────────────────────────
  expItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f0fa',
  },
  expLogo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  expInitial: {
    fontSize: 14,
    fontWeight: '700',
  },
  expInfo: {
    flex: 1,
  },
  expRole: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2d2150',
    marginBottom: 2,
  },
  expCo: {
    fontSize: 11.5,
    color: '#9b94b8',
  },
  expYr: {
    fontSize: 11,
    color: '#b4aed0',
    fontWeight: '500',
    marginLeft: 8,
  },

  // ── Achievements ────────────────────────────
  achItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f0fa',
  },
  achDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#c4bde0',
    marginTop: 5,
    marginRight: 10,
  },
  achText: {
    flex: 1,
    fontSize: 12.5,
    color: '#4e4670',
    lineHeight: 20,
  },
  achBold: {
    fontWeight: '700',
    color: '#2d2150',
  },
  achSub: {
    color: '#9b94b8',
    fontWeight: '400',
  },
});

export default HomeScreen;
