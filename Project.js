import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';

const NAV_WIDTH = 200;
const TAB_WIDTH = 28;

// ─────────────────────────────────────────────
//  Project Data  (sourced from resume)
// ─────────────────────────────────────────────

const CATEGORIES = [
  {
    id: 'internship',
    label: 'Internship Project',
    icon: '🏢',
    iconBg: '#e6eef9',
    iconColor: '#4a7fc1',
    tagBg: '#ddeaf8',
    tagText: '#2a5f9e',
    borderColor: '#4a7fc1',
    projects: [
      {
        name: 'IPO Web Application',
        subtitle: 'Bluestock Fintech  ·  Jul – Aug 2024',
        initial: 'B',
        logoBg: '#e6eef9',
        logoColor: '#4a7fc1',
        tech: ['HTML', 'CSS', 'JavaScript', 'Bootstrap 5', 'Angular', 'SQL', 'Git'],
        description:
          'Built and maintained key frontend components of a production IPO web application. Designed database schemas and queries for data consistency, collaborated with backend developers on seamless API integration, and led a team of 5 interns to ensure timely project delivery.',
        bullets: [
          'Enhanced UI responsiveness and accessibility across the application',
          'Designed DB schemas ensuring data consistency and performance',
          'Integrated APIs between backend and frontend components',
          'Led a 5-member intern team, tracking tasks and ensuring delivery',
        ],
      },
    ],
  },
  {
    id: 'training',
    label: 'Training Project',
    icon: '☁️',
    iconBg: '#edf9f3',
    iconColor: '#2e9b6b',
    tagBg: '#d6f5e8',
    tagText: '#1a6e49',
    borderColor: '#2e9b6b',
    projects: [
      {
        name: 'Salesforce Recruiting App',
        subtitle: 'Developer Project  ·  Salesforce Trailhead',
        initial: 'SF',
        logoBg: '#edf9f3',
        logoColor: '#2e9b6b',
        tech: ['Salesforce Lightning App Builder', 'Object Manager', 'Apex Triggers', 'Validation Rules', 'Salesforce Setup'],
        description:
          'Architected a full-cycle recruiting application on Salesforce to track job openings, applicants, and hiring workflows. Built Lightning App Builder UIs for recruiters and hiring managers with robust validation and automated test suites.',
        bullets: [
          'Built data models for job openings, applicants, and hiring workflows',
          'Designed Lightning UIs for recruiters and hiring managers',
          'Implemented validation rules to automate processes and ensure data integrity',
          'Developed automated test suites to maintain high code coverage',
        ],
      },
      {
        name: 'Salesforce Space Station App',
        subtitle: 'Administrative Project  ·  Salesforce Trailhead',
        initial: 'SF',
        logoBg: '#edf9f3',
        logoColor: '#2e9b6b',
        tech: ['Salesforce Lightning App Builder', 'Reports & Dashboards', 'Workflow Rules', 'Object Manager', 'Salesforce Setup'],
        description:
          'Configured custom Salesforce objects and relationships to manage space mission resources and schedules. Deployed dashboards for mission tracking, created alert-based automation workflows, and managed security profiles and permission sets.',
        bullets: [
          'Configured custom objects, fields, and relationships for mission resources',
          'Designed and deployed dashboards and reports for operational tracking',
          'Created automation workflows for stakeholder alerts and updates',
          'Managed security profiles, permission sets, and page layouts',
        ],
      },
    ],
  },
  {
    id: 'handson',
    label: 'Hands-on Project',
    icon: '💡',
    iconBg: '#fdf1dc',
    iconColor: '#c98a10',
    tagBg: '#fde9b8',
    tagText: '#9a6200',
    borderColor: '#c98a10',
    projects: [
      {
        name: 'Weather Information App',
        subtitle: 'Personal Project',
        initial: 'W',
        logoBg: '#fff3e0',
        logoColor: '#e65100',
        tech: ['HTML5', 'CSS3', 'JavaScript', 'Bootstrap 5', 'OpenWeatherMap API'],
        description:
          'A responsive web app that displays real-time weather data using the OpenWeatherMap API. Supports automatic geolocation-based fetching and city-specific search, showing temperature, humidity, and wind speed in a clean interactive layout.',
        bullets: [
          'Displays real-time weather updates via OpenWeatherMap API',
          'Automatic geolocation-based weather fetching on page load',
          'City-specific search with instant results',
          'Shows temperature, humidity, and wind speed dynamically',
        ],
      },
      {
        name: 'Personal Portfolio Website',
        subtitle: 'Personal Project',
        initial: 'P',
        logoBg: '#ede9fc',
        logoColor: '#7c6ec7',
        tech: ['HTML5', 'CSS3', 'JavaScript'],
        description:
          'Designed and developed a fully responsive personal portfolio website to showcase skills, experiences, and projects. Features smooth navigation, interactive UI components, and a dedicated Recommendations section for visitor testimonials.',
        bullets: [
          'Responsive layout that adapts across all screen sizes',
          'Smooth navigation and interactive UI components',
          'Dedicated Recommendations section for testimonials and feedback',
          'Clean design showcasing projects, skills, and experience',
        ],
      },
    ],
  },
];

// ─────────────────────────────────────────────
//  Reusable Sub-Components
// ─────────────────────────────────────────────

/** Tech tag pill */
const TechTag = ({ label, bg, color }) => (
  <View style={[styles.techTag, { backgroundColor: bg, borderColor: color + '55' }]}>
    <Text style={[styles.techTagText, { color }]}>{label}</Text>
  </View>
);

/** Single bullet point row */
const Bullet = ({ text }) => (
  <View style={styles.bulletRow}>
    <View style={styles.bulletDot} />
    <Text style={styles.bulletText}>{text}</Text>
  </View>
);

/** Expandable project card */
const ProjectCard = ({ project, category }) => {
  const [expanded, setExpanded] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    Animated.spring(anim, {
      toValue: expanded ? 0 : 1,
      useNativeDriver: false,
      friction: 8,
      tension: 60,
    }).start();
    setExpanded(e => !e);
  };

  const arrowRotate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={[styles.projectCard, { borderLeftColor: category.borderColor }]}>
      {/* ── Card Header Row ── */}
      <View style={styles.projectHeader}>
        <View style={[styles.projectLogo, { backgroundColor: project.logoBg }]}>
          <Text style={[styles.projectLogoText, { color: project.logoColor }]}>
            {project.initial}
          </Text>
        </View>
        <View style={styles.projectTitleWrap}>
          <Text style={styles.projectName}>{project.name}</Text>
          <Text style={styles.projectSubtitle}>{project.subtitle}</Text>
        </View>
        <TouchableOpacity onPress={toggleExpand} style={styles.expandBtn} activeOpacity={0.7}>
          <Animated.Text style={[styles.expandArrow, { transform: [{ rotate: arrowRotate }] }]}>
            ▾
          </Animated.Text>
        </TouchableOpacity>
      </View>

      {/* ── Tech Tags ── */}
      <View style={styles.techTagsRow}>
        {project.tech.map((t, i) => (
          <TechTag key={i} label={t} bg={category.tagBg} color={category.tagText} />
        ))}
      </View>

      {/* ── Description (always visible) ── */}
      <Text style={styles.projectDesc}>{project.description}</Text>

      {/* ── Expandable Bullet Details ── */}
      {expanded && (
        <View style={styles.bulletsWrap}>
          <View style={styles.bulletsDivider} />
          <Text style={styles.bulletsHeading}>Key Highlights</Text>
          {project.bullets.map((b, i) => (
            <Bullet key={i} text={b} />
          ))}
        </View>
      )}

      {/* ── Expand / Collapse label ── */}
      <TouchableOpacity onPress={toggleExpand} activeOpacity={0.7} style={styles.expandLabelBtn}>
        <Text style={[styles.expandLabel, { color: category.borderColor }]}>
          {expanded ? 'Show less ▲' : 'Show highlights ▼'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

/** Category section with header + its projects */
const CategorySection = ({ category }) => (
  <View style={styles.categorySection}>
    {/* Section Header */}
    <View style={styles.categoryHeader}>
      <View style={[styles.categoryIcon, { backgroundColor: category.iconBg }]}>
        <Text style={{ fontSize: 15 }}>{category.icon}</Text>
      </View>
      <Text style={styles.categoryLabel}>{category.label}</Text>
      <View style={[styles.categoryCount, { backgroundColor: category.iconBg }]}>
        <Text style={[styles.categoryCountText, { color: category.iconColor }]}>
          {category.projects.length}
        </Text>
      </View>
    </View>

    {/* Project Cards */}
    {category.projects.map((project, i) => (
      <ProjectCard key={i} project={project} category={category} />
    ))}
  </View>
);

// ─────────────────────────────────────────────
//  Right-Side Navigation Drawer (same as Home)
// ─────────────────────────────────────────────

const NAV_ITEMS = [
  { label: 'Home',     icon: '🏠', screen: 'Home'     },
  { label: 'Projects', icon: '📁', screen: 'Projects' },
  { label: 'Settings', icon: '⚙️', screen: 'Settings' },
];

const SideNavBar = ({ navigation, activeScreen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    Animated.spring(anim, {
      toValue: isOpen ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
      tension: 60,
    }).start();
    setIsOpen(o => !o);
  };

  const close = () => {
    if (!isOpen) return;
    Animated.spring(anim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
      tension: 60,
    }).start();
    setIsOpen(false);
  };

  const translateX = anim.interpolate({
    inputRange:  [0, 1],
    outputRange: [NAV_WIDTH - TAB_WIDTH, 0],
  });

  const backdropOpacity = anim.interpolate({
    inputRange:  [0, 1],
    outputRange: [0, 0.3],
  });

  return (
    <>
      <Animated.View
        pointerEvents={isOpen ? 'auto' : 'none'}
        style={[styles.navBackdrop, { opacity: backdropOpacity }]}
      >
        <TouchableWithoutFeedback onPress={close}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
      </Animated.View>

      <Animated.View style={[styles.navDrawer, { transform: [{ translateX }] }]}>
        {/* Trigger tab */}
        <TouchableOpacity style={styles.navTab} onPress={toggle} activeOpacity={0.8}>
          {isOpen ? (
            <Text style={styles.navTabArrow}>›</Text>
          ) : (
            <View style={styles.dotsWrap}>
              <View style={styles.dotLine} />
              <View style={styles.dotLine} />
              <View style={styles.dotLine} />
            </View>
          )}
        </TouchableOpacity>

        {/* Menu */}
        <View style={styles.navContent}>
          <Text style={styles.navHeading}>Menu</Text>
          {NAV_ITEMS.map(item => {
            const isActive = activeScreen === item.screen;
            return (
              <TouchableOpacity
                key={item.screen}
                style={[styles.navItem, isActive && styles.navItemActive]}
                activeOpacity={0.75}
                onPress={() => {
                  close();
                  if (navigation) navigation.navigate(item.screen);
                }}
              >
                <Text style={styles.navItemIcon}>{item.icon}</Text>
                <Text style={[styles.navItemLabel, isActive && styles.navItemLabelActive]}>
                  {item.label}
                </Text>
                {isActive && <View style={styles.navActivePip} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
    </>
  );
};

// ─────────────────────────────────────────────
//  Main Projects Screen
// ─────────────────────────────────────────────

const Projects = ({ navigation }) => (
  <SafeAreaView style={styles.safeArea}>
    <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Page Header (mirrors HomeScreen hero style) ── */}
      <View style={styles.hero}>
        {/* Back button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation && navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>

        {/* Page identity */}
        <View style={styles.pageIconWrap}>
          <Text style={styles.pageIcon}>📁</Text>
        </View>
        <Text style={styles.pageTitle}>Projects</Text>
        <Text style={styles.pageSubtitle}>A showcase of work across internships,{'\n'}training, and personal builds</Text>

        {/* Stats pills */}
        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Text style={styles.statNum}>5</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statPillDivider} />
          <View style={styles.statPill}>
            <Text style={styles.statNum}>1</Text>
            <Text style={styles.statLabel}>Internship</Text>
          </View>
          <View style={styles.statPillDivider} />
          <View style={styles.statPill}>
            <Text style={styles.statNum}>2</Text>
            <Text style={styles.statLabel}>Training</Text>
          </View>
          <View style={styles.statPillDivider} />
          <View style={styles.statPill}>
            <Text style={styles.statNum}>2</Text>
            <Text style={styles.statLabel}>Hands-on</Text>
          </View>
        </View>
      </View>

      {/* ── Divider ── */}
      <View style={styles.divider} />

      {/* ── Category Sections ── */}
      <View style={styles.body}>
        {CATEGORIES.map(cat => (
          <CategorySection key={cat.id} category={cat} />
        ))}
      </View>
    </ScrollView>

    {/* Right-side nav (activeScreen = Projects) */}
    <SideNavBar navigation={navigation} activeScreen="Projects" />
  </SafeAreaView>
);

// ─────────────────────────────────────────────
//  Styles
// ─────────────────────────────────────────────

const styles = StyleSheet.create({

  safeArea:      { flex: 1, backgroundColor: '#eceaf8' },
  scroll:        { flex: 1 },
  scrollContent: { paddingBottom: 48 },

  // ── Hero / Page Header ──────────────────────
  hero: {
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: 28,
    paddingHorizontal: 24,
    backgroundColor: '#eceaf8',
  },
  backBtn: {
    position: 'absolute', top: 20, left: 20,
    width: 34, height: 34,
    backgroundColor: '#fff', borderRadius: 17,
    alignItems: 'center', justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09, shadowRadius: 6,
  },
  backArrow: { fontSize: 22, color: '#888', lineHeight: 26, marginTop: -2 },

  pageIconWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    elevation: 6,
    shadowColor: '#7864c8', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15, shadowRadius: 12,
  },
  pageIcon:     { fontSize: 32 },
  pageTitle:    { fontSize: 26, fontWeight: '700', color: '#2d2150', marginBottom: 6, letterSpacing: 0.2 },
  pageSubtitle: { fontSize: 13, color: '#8a82aa', textAlign: 'center', lineHeight: 20, marginBottom: 20 },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    elevation: 2,
    shadowColor: '#6450b4', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6,
  },
  statPill:        { flex: 1, alignItems: 'center' },
  statPillDivider: { width: 1, backgroundColor: '#ebe7fa', marginVertical: 2 },
  statNum:         { fontSize: 18, fontWeight: '700', color: '#2d2150' },
  statLabel:       { fontSize: 10, color: '#9e9ebb', marginTop: 2, fontWeight: '500' },

  divider: { height: 1, backgroundColor: 'rgba(160,140,220,0.18)', marginHorizontal: 20 },

  // ── Body ────────────────────────────────────
  body: { paddingHorizontal: 16, paddingTop: 20 },

  // ── Category Section ────────────────────────
  categorySection: { marginBottom: 28 },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 10,
  },
  categoryLabel: {
    flex: 1,
    fontSize: 15, fontWeight: '700', color: '#2d2150',
  },
  categoryCount: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  categoryCountText: { fontSize: 12, fontWeight: '700' },

  // ── Project Card ────────────────────────────
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: '#6450b4', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  projectLogo: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 10,
  },
  projectLogoText: { fontSize: 12, fontWeight: '700' },
  projectTitleWrap: { flex: 1 },
  projectName:     { fontSize: 14, fontWeight: '700', color: '#2d2150', marginBottom: 2 },
  projectSubtitle: { fontSize: 11.5, color: '#9b94b8' },

  expandBtn: { padding: 4 },
  expandArrow: { fontSize: 18, color: '#b4aed0' },

  // Tech tags
  techTagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  techTag: {
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginRight: 6,
    marginBottom: 6,
  },
  techTagText: { fontSize: 10.5, fontWeight: '600' },

  // Description
  projectDesc: {
    fontSize: 12.5,
    color: '#5a5375',
    lineHeight: 19,
    marginBottom: 8,
  },

  // Bullets (expanded)
  bulletsWrap:    { marginTop: 4 },
  bulletsDivider: { height: 1, backgroundColor: '#f0eeff', marginBottom: 10 },
  bulletsHeading: {
    fontSize: 10, fontWeight: '700', color: '#b4aed0',
    letterSpacing: 1.5, textTransform: 'uppercase',
    marginBottom: 8,
  },
  bulletRow:  { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  bulletDot:  { width: 5, height: 5, borderRadius: 3, backgroundColor: '#c4bde0', marginTop: 6, marginRight: 8 },
  bulletText: { flex: 1, fontSize: 12, color: '#4e4670', lineHeight: 18 },

  // Expand label
  expandLabelBtn: { marginTop: 6, alignSelf: 'flex-start' },
  expandLabel:    { fontSize: 11.5, fontWeight: '600' },

  // ─────────────────────────────────────────
  //  Side Nav  (identical to HomeScreen)
  // ─────────────────────────────────────────

  navBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1a0a40',
    zIndex: 10,
  },
  navDrawer: {
    position: 'absolute', top: 0, right: 0, bottom: 0,
    width: NAV_WIDTH,
    flexDirection: 'row',
    zIndex: 20,
  },
  navTab: {
    width: TAB_WIDTH,
    alignSelf: 'center',
    height: 72,
    backgroundColor: '#4a3fa0',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    elevation: 8,
    shadowColor: '#2d2150',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.2, shadowRadius: 6,
  },
  dotsWrap: { alignItems: 'center', gap: 4 },
  dotLine:  { width: 12, height: 2.5, backgroundColor: '#fff', borderRadius: 2 },
  navTabArrow: { fontSize: 24, color: '#fff', fontWeight: '700' },

  navContent: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60, paddingHorizontal: 18,
    elevation: 12,
    shadowColor: '#2d2150',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.12, shadowRadius: 12,
  },
  navHeading: {
    fontSize: 10, fontWeight: '700', color: '#b4aed0',
    letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20,
  },
  navItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 13, paddingHorizontal: 12,
    borderRadius: 14, marginBottom: 6,
    position: 'relative',
  },
  navItemActive:      { backgroundColor: '#f0eeff' },
  navItemIcon:        { fontSize: 18, marginRight: 12 },
  navItemLabel:       { fontSize: 14, fontWeight: '500', color: '#4e4670' },
  navItemLabelActive: { color: '#4a3fa0', fontWeight: '700' },
  navActivePip: {
    position: 'absolute', right: 10,
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#4a3fa0',
  },
});

export default Projects;
