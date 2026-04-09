import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
 
// ─────────────────────────────────────────────
//  Global Components — imported from src/components
//  Single source of truth — no duplication
// ─────────────────────────────────────────────
import SideNavBar from '../components/SideNavBar';
import EditBtn    from '../components/EditBtn';
import { COLORS, globalStyles } from '../styles/GlobalStyles';
 
// Preset dot colours for new skills
const SKILL_COLORS = [
  '#3b82f6','#61dafb','#f59e0b','#f24e1e','#7c3aed',
  '#dd0031','#22c55e','#00a1e0','#374151','#e91e63',
  '#ff9800','#009688',
];
 
// Preset logo bg/text colour pairs for experience entries
const EXP_COLOR_PAIRS = [
  { bgColor: '#ede9fc', textColor: '#7c6ec7' },
  { bgColor: '#e6eef9', textColor: '#4a7fc1' },
  { bgColor: '#edf9f3', textColor: '#2e9b6b' },
  { bgColor: '#fdf1dc', textColor: '#c98a10' },
  { bgColor: '#fce8e8', textColor: '#e05c5c' },
  { bgColor: '#e8f5e9', textColor: '#388e3c' },
];
 
// ─────────────────────────────────────────────
//  SideNavBar and EditBtn are global components
//  imported from src/components — see imports above
// ─────────────────────────────────────────────
 
// ─────────────────────────────────────────────
//  Main HomeScreen
// ─────────────────────────────────────────────
 
const HomeScreen = ({ navigation }) => {
 
  // ══════════════════════════════════════════
  //  SECTION 1 — Profile
  // ══════════════════════════════════════════
  const DEFAULT_PROFILE = {
    name:    'Ayush Satpathy',
    role:    'Software Engineer Intern',
    company: 'PwC',
    bio:     'Highly motivated CS undergrad skilled in React Native, React.js, JavaScript, and Salesforce. Passionate about building intuitive, high-performance apps and delivering quality code in line with industry standards.',
  };
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [profileModal, setProfileModal] = useState(false);
  const [draftProfile, setDraftProfile] = useState({ ...DEFAULT_PROFILE });
 
  const openProfileEdit = () => { setDraftProfile({ ...profile }); setProfileModal(true); };
  const saveProfile = () => {
    if (!draftProfile.name.trim()) { Alert.alert('Name cannot be empty'); return; }
    setProfile({ ...draftProfile });
    setProfileModal(false);
  };
 
  // ══════════════════════════════════════════
  //  SECTION 2 — Skills
  // ══════════════════════════════════════════
  const [skills, setSkills] = useState([
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
  ]);
  const [skillModal, setSkillModal]       = useState(false);
  const [newSkillLabel, setNewSkillLabel] = useState('');
  const [newSkillColor, setNewSkillColor] = useState(SKILL_COLORS[0]);
 
  const addSkill = () => {
    if (!newSkillLabel.trim()) { Alert.alert('Skill name cannot be empty'); return; }
    if (skills.find(s => s.label.toLowerCase() === newSkillLabel.trim().toLowerCase())) {
      Alert.alert('Skill already exists'); return;
    }
    setSkills(prev => [...prev, { label: newSkillLabel.trim(), dotColor: newSkillColor }]);
    setNewSkillLabel('');
    setNewSkillColor(SKILL_COLORS[0]);
  };
 
  const deleteSkill = label => {
    Alert.alert('Remove Skill', `Remove "${label}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive',
        onPress: () => setSkills(prev => prev.filter(s => s.label !== label)) },
    ]);
  };
 
  // ══════════════════════════════════════════
  //  SECTION 3 — Experience  (FULL CRUD)
  // ══════════════════════════════════════════
  const [experience, setExperience] = useState([
    { initial: 'P', bgColor: '#ede9fc', textColor: '#7c6ec7',
      role: 'Software Engineer Intern', company: 'PricewaterhouseCoopers (PwC)', year: '2025 – Present' },
    { initial: 'B', bgColor: '#e6eef9', textColor: '#4a7fc1',
      role: 'SDE Intern', company: 'Bluestock Fintech', year: 'Jul – Aug 2024' },
  ]);
 
  // Modal visibility + which entry is being edited (null = add mode)
  const [expModal, setExpModal]     = useState(false);
  const [expEditIdx, setExpEditIdx] = useState(null);
 
  // Draft state for the experience modal
  const blankExp = () => ({ initial: '', bgColor: '#e6eef9', textColor: '#4a7fc1', role: '', company: '', year: '' });
  const [draftExp, setDraftExp]     = useState(blankExp());
  const [expColorIdx, setExpColorIdx] = useState(1);
 
  // Open in ADD mode
  const openAddExp = () => {
    setDraftExp(blankExp());
    setExpColorIdx(1);
    setExpEditIdx(null);
    setExpModal(true);
  };
 
  // Open in EDIT mode — prefill draft with existing entry
  const openEditExp = idx => {
    const entry = experience[idx];
    setDraftExp({ ...entry });
    // Find matching colour pair index for the colour picker
    const pairIdx = EXP_COLOR_PAIRS.findIndex(
      p => p.bgColor === entry.bgColor && p.textColor === entry.textColor
    );
    setExpColorIdx(pairIdx >= 0 ? pairIdx : 0);
    setExpEditIdx(idx);
    setExpModal(true);
  };
 
  // Save (Create or Update)
  const saveExp = () => {
    if (!draftExp.role.trim())    { Alert.alert('Role cannot be empty'); return; }
    if (!draftExp.company.trim()) { Alert.alert('Company cannot be empty'); return; }
    if (!draftExp.year.trim())    { Alert.alert('Year / Period cannot be empty'); return; }
    // Auto-generate initial from company if left blank
    const initial = draftExp.initial.trim()
      ? draftExp.initial.trim().slice(0, 2).toUpperCase()
      : draftExp.company.trim().charAt(0).toUpperCase();
    const entry = {
      ...draftExp,
      initial,
      bgColor:   EXP_COLOR_PAIRS[expColorIdx].bgColor,
      textColor: EXP_COLOR_PAIRS[expColorIdx].textColor,
    };
    if (expEditIdx === null) {
      // CREATE
      setExperience(prev => [...prev, entry]);
    } else {
      // UPDATE
      setExperience(prev => prev.map((e, i) => i === expEditIdx ? entry : e));
    }
    setExpModal(false);
  };
 
  // Delete
  const deleteExp = idx => {
    const e = experience[idx];
    Alert.alert('Remove Experience', `Remove "${e.role} at ${e.company}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive',
        onPress: () => setExperience(prev => prev.filter((_, i) => i !== idx)) },
    ]);
  };
 
  // ══════════════════════════════════════════
  //  SECTION 4 — Achievements
  // ══════════════════════════════════════════
  const [achievements, setAchievements] = useState([
    { title: 'Salesforce Trailhead Ranger Rank',       subtitle: '100+ badges · 60,000+ points' },
    { title: 'Salesforce Service Cloud Consultant',    subtitle: 'Trailhead (Aug 2025)'          },
    { title: 'Developing Front-End Apps with React',   subtitle: 'IBM / Coursera (Apr 2024)'     },
    { title: 'Azure Data Fundamentals Challenge',      subtitle: 'Microsoft Learn (Feb 2024)'    },
    { title: 'TVS Credit E.P.I.C 7.0 – Analytics',    subtitle: 'Unstop'                        },
    { title: 'Summer Training – Python, Web & GitHub', subtitle: 'Pragyatmika'                   },
  ]);
  const [achModal, setAchModal]       = useState(false);
  const [newAchTitle, setNewAchTitle] = useState('');
  const [newAchSub, setNewAchSub]     = useState('');
 
  const addAchievement = () => {
    if (!newAchTitle.trim()) { Alert.alert('Title cannot be empty'); return; }
    setAchievements(prev => [...prev, { title: newAchTitle.trim(), subtitle: newAchSub.trim() }]);
    setNewAchTitle('');
    setNewAchSub('');
  };
 
  const deleteAchievement = title => {
    Alert.alert('Remove Entry', `Remove "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive',
        onPress: () => setAchievements(prev => prev.filter(a => a.title !== title)) },
    ]);
  };
 
  // ═════════════════════════════════════════
  //  AsyncStorage — LOAD on mount
  // ═════════════════════════════════════════
  useEffect(() => {
    const loadData = async () => {
      try {
        const [p, sk, ex, ac] = await Promise.all([
          AsyncStorage.getItem('@portfolio_profile'),
          AsyncStorage.getItem('@portfolio_skills'),
          AsyncStorage.getItem('@portfolio_experience'),
          AsyncStorage.getItem('@portfolio_achievements'),
        ]);
        if (p)  { setProfile(JSON.parse(p)); setDraftProfile(JSON.parse(p)); }
        if (sk) setSkills(JSON.parse(sk));
        if (ex) setExperience(JSON.parse(ex));
        if (ac) setAchievements(JSON.parse(ac));
      } catch (e) {
        console.log('Load error:', e);
      }
    };
    loadData();
  }, []); // runs once on mount
 
  // ═════════════════════════════════════════
  //  AsyncStorage — SAVE whenever data changes
  // ═════════════════════════════════════════
  useEffect(() => {
    AsyncStorage.setItem('@portfolio_profile', JSON.stringify(profile)).catch(() => {});
  }, [profile]);
 
  useEffect(() => {
    AsyncStorage.setItem('@portfolio_skills', JSON.stringify(skills)).catch(() => {});
  }, [skills]);
 
  useEffect(() => {
    AsyncStorage.setItem('@portfolio_experience', JSON.stringify(experience)).catch(() => {});
  }, [experience]);
 
  useEffect(() => {
    AsyncStorage.setItem('@portfolio_achievements', JSON.stringify(achievements)).catch(() => {});
  }, [achievements]);
 
  // ─────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
 
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
 
        {/* ══════════════════════════
            SECTION 1 — Profile Hero
        ══════════════════════════ */}
        <View style={styles.hero}>
          <EditBtn onPress={openProfileEdit} />
 
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>
                {profile.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeTick}>✓</Text>
            </View>
          </View>
 
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.roleText}>{profile.role}</Text>
 
          <View style={styles.companyLine}>
            <Text style={styles.companyLabel}>💼  Currently working for: </Text>
            <Text style={styles.companyName}>{profile.company}</Text>
          </View>
 
          <Text style={styles.bio}>{profile.bio}</Text>
        </View>
 
        <View style={styles.divider} />
 
        <View style={styles.cards}>
 
          {/* ══════════════════════
              SECTION 2 — Skills
          ══════════════════════ */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: '#ede9fc' }]}>
                <Text style={{ color: '#7c6ec7', fontSize: 14 }}>⚡</Text>
              </View>
              <Text style={styles.cardTitle}>Skillset</Text>
              <EditBtn onPress={() => setSkillModal(true)} />
            </View>
            <View style={styles.skillTags}>
              {skills.map((s, i) => (
                <View key={i} style={styles.tag}>
                  <View style={[styles.dot, { backgroundColor: s.dotColor }]} />
                  <Text style={styles.tagText}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>
 
          {/* ══════════════════════════════════════
              SECTION 3 — Experience  (FULL CRUD)
          ══════════════════════════════════════ */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: '#e6eef9' }]}>
                <Text style={{ color: '#4a7fc1', fontSize: 14 }}>💼</Text>
              </View>
              <Text style={styles.cardTitle}>Experience</Text>
              {/* ✏️ pencil opens ADD mode */}
              <EditBtn onPress={openAddExp} />
            </View>
 
            {experience.map((e, i) => (
              <View key={i} style={styles.expItem}>
                {/* Logo initial */}
                <View style={[styles.expLogo, { backgroundColor: e.bgColor }]}>
                  <Text style={[styles.expInitial, { color: e.textColor }]}>{e.initial}</Text>
                </View>
 
                {/* Role + company */}
                <View style={styles.expInfo}>
                  <Text style={styles.expRole}>{e.role}</Text>
                  <Text style={styles.expCo}>{e.company}</Text>
                </View>
 
                {/* Year */}
                <Text style={styles.expYr}>{e.year}</Text>
 
                {/* ✏️ edit this entry */}
                <TouchableOpacity
                  style={styles.expActionBtn}
                  onPress={() => openEditExp(i)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.expActionIcon}>✏️</Text>
                </TouchableOpacity>
 
                {/* 🗑️ delete this entry */}
                <TouchableOpacity
                  style={[styles.expActionBtn, styles.expActionDelete]}
                  onPress={() => deleteExp(i)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.expActionIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
 
          {/* ══════════════════════════════════
              SECTION 4 — Achievements
          ══════════════════════════════════ */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: '#fdf1dc' }]}>
                <Text style={{ color: '#c98a10', fontSize: 14 }}>★</Text>
              </View>
              <Text style={styles.cardTitle}>Achievements & Certifications</Text>
              <EditBtn onPress={() => setAchModal(true)} />
            </View>
            {achievements.map((a, i) => (
              <View key={i} style={styles.achItem}>
                <View style={styles.achDot} />
                <Text style={styles.achText}>
                  <Text style={styles.achBold}>{a.title}</Text>
                  {a.subtitle ? <Text style={styles.achSub}>{'  '}{a.subtitle}</Text> : null}
                </Text>
              </View>
            ))}
          </View>
 
        </View>
      </ScrollView>
 
      {/* ── Side Nav ── */}
      <SideNavBar navigation={navigation} activeScreen="Home" />
 
      {/* ════════════════════════════════════════
          MODAL 1 — Edit Profile
      ════════════════════════════════════════ */}
      <Modal visible={profileModal} transparent animationType="fade"
        onRequestClose={() => setProfileModal(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableWithoutFeedback onPress={() => setProfileModal(false)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
 
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
 
            <Text style={styles.modalLabel}>Full Name</Text>
            <TextInput style={styles.modalInput} value={draftProfile.name}
              onChangeText={t => setDraftProfile(p => ({ ...p, name: t }))}
              placeholder="Full Name" placeholderTextColor="#c0bcd8" />
 
            <Text style={styles.modalLabel}>Role / Position</Text>
            <TextInput style={styles.modalInput} value={draftProfile.role}
              onChangeText={t => setDraftProfile(p => ({ ...p, role: t }))}
              placeholder="Role" placeholderTextColor="#c0bcd8" />
 
            <Text style={styles.modalLabel}>Current Workplace</Text>
            <TextInput style={styles.modalInput} value={draftProfile.company}
              onChangeText={t => setDraftProfile(p => ({ ...p, company: t }))}
              placeholder="Company" placeholderTextColor="#c0bcd8" />
 
            <Text style={styles.modalLabel}>Bio</Text>
            <TextInput style={[styles.modalInput, styles.modalInputMulti]}
              value={draftProfile.bio}
              onChangeText={t => setDraftProfile(p => ({ ...p, bio: t }))}
              placeholder="Short bio..." placeholderTextColor="#c0bcd8"
              multiline numberOfLines={4} textAlignVertical="top" />
 
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setProfileModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={saveProfile}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
 
      {/* ════════════════════════════════════════
          MODAL 2 — Edit Skills
      ════════════════════════════════════════ */}
      <Modal visible={skillModal} transparent animationType="fade"
        onRequestClose={() => setSkillModal(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableWithoutFeedback onPress={() => setSkillModal(false)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
 
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Edit Skills</Text>
 
            <ScrollView style={styles.modalListScroll} nestedScrollEnabled>
              {skills.map((s, i) => (
                <View key={i} style={styles.modalListRow}>
                  <View style={[styles.dot, { backgroundColor: s.dotColor, marginRight: 8 }]} />
                  <Text style={styles.modalListLabel}>{s.label}</Text>
                  <TouchableOpacity onPress={() => deleteSkill(s.label)} style={styles.deleteBtn}>
                    <Text style={styles.deleteBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
 
            <View style={styles.modalDivider} />
            <Text style={styles.modalLabel}>Add New Skill</Text>
            <TextInput style={styles.modalInput} value={newSkillLabel}
              onChangeText={setNewSkillLabel} placeholder="Skill name"
              placeholderTextColor="#c0bcd8" />
 
            <Text style={styles.modalLabel}>Pick a colour</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              style={styles.colorPickerRow}>
              {SKILL_COLORS.map(c => (
                <TouchableOpacity key={c} onPress={() => setNewSkillColor(c)}
                  style={[styles.colorSwatch, { backgroundColor: c },
                    newSkillColor === c && styles.colorSwatchActive]} />
              ))}
            </ScrollView>
 
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setSkillModal(false)}>
                <Text style={styles.modalCancelText}>Done</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={addSkill}>
                <Text style={styles.modalSaveText}>+ Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
 
      {/* ════════════════════════════════════════
          MODAL 3 — Add / Edit Experience
      ════════════════════════════════════════ */}
      <Modal visible={expModal} transparent animationType="fade"
        onRequestClose={() => setExpModal(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableWithoutFeedback onPress={() => setExpModal(false)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
 
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {expEditIdx === null ? 'Add Experience' : 'Edit Experience'}
            </Text>
 
            <Text style={styles.modalLabel}>Role / Position *</Text>
            <TextInput style={styles.modalInput} value={draftExp.role}
              onChangeText={t => setDraftExp(p => ({ ...p, role: t }))}
              placeholder="e.g. Software Engineer Intern"
              placeholderTextColor="#c0bcd8" />
 
            <Text style={styles.modalLabel}>Company *</Text>
            <TextInput style={styles.modalInput} value={draftExp.company}
              onChangeText={t => setDraftExp(p => ({ ...p, company: t }))}
              placeholder="e.g. PricewaterhouseCoopers"
              placeholderTextColor="#c0bcd8" />
 
            <Text style={styles.modalLabel}>Year / Period *</Text>
            <TextInput style={styles.modalInput} value={draftExp.year}
              onChangeText={t => setDraftExp(p => ({ ...p, year: t }))}
              placeholder="e.g. 2025 – Present"
              placeholderTextColor="#c0bcd8" />
 
            <Text style={styles.modalLabel}>
              Logo Initial (1–2 chars, auto from company if blank)
            </Text>
            <TextInput style={styles.modalInput} value={draftExp.initial}
              onChangeText={t => setDraftExp(p => ({ ...p, initial: t.slice(0, 2).toUpperCase() }))}
              placeholder="e.g. P" placeholderTextColor="#c0bcd8"
              maxLength={2} autoCapitalize="characters" />
 
            <Text style={styles.modalLabel}>Logo Colour</Text>
            <View style={styles.expColorRow}>
              {EXP_COLOR_PAIRS.map((pair, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setExpColorIdx(idx)}
                  style={[
                    styles.expColorSwatch,
                    { backgroundColor: pair.bgColor, borderColor: pair.textColor },
                    expColorIdx === idx && styles.expColorSwatchActive,
                  ]}
                >
                  <Text style={{ color: pair.textColor, fontSize: 11, fontWeight: '700' }}>
                    {draftExp.initial
                      ? draftExp.initial.slice(0, 2).toUpperCase()
                      : draftExp.company
                        ? draftExp.company.charAt(0).toUpperCase()
                        : 'A'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
 
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setExpModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={saveExp}>
                <Text style={styles.modalSaveText}>
                  {expEditIdx === null ? '+ Add' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
 
      {/* ════════════════════════════════════════
          MODAL 4 — Edit Achievements
      ════════════════════════════════════════ */}
      <Modal visible={achModal} transparent animationType="fade"
        onRequestClose={() => setAchModal(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableWithoutFeedback onPress={() => setAchModal(false)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
 
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Edit Achievements</Text>
 
            <ScrollView style={styles.modalListScroll} nestedScrollEnabled>
              {achievements.map((a, i) => (
                <View key={i} style={styles.modalListRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalListLabel} numberOfLines={1}>{a.title}</Text>
                    {a.subtitle
                      ? <Text style={styles.modalListSub} numberOfLines={1}>{a.subtitle}</Text>
                      : null}
                  </View>
                  <TouchableOpacity onPress={() => deleteAchievement(a.title)} style={styles.deleteBtn}>
                    <Text style={styles.deleteBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
 
            <View style={styles.modalDivider} />
            <Text style={styles.modalLabel}>Add New Entry</Text>
            <TextInput style={styles.modalInput} value={newAchTitle}
              onChangeText={setNewAchTitle} placeholder="Title / Achievement"
              placeholderTextColor="#c0bcd8" />
            <TextInput style={[styles.modalInput, { marginTop: 8 }]} value={newAchSub}
              onChangeText={setNewAchSub} placeholder="Subtitle (optional)"
              placeholderTextColor="#c0bcd8" />
 
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setAchModal(false)}>
                <Text style={styles.modalCancelText}>Done</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={addAchievement}>
                <Text style={styles.modalSaveText}>+ Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
 
    </SafeAreaView>
  );
};
 
// ─────────────────────────────────────────────
//  Styles
// ─────────────────────────────────────────────
 
// ─────────────────────────────────────────────
//  Shared styles imported from GlobalStyles:
//    modalOverlay, modalBox, modalTitle, modalLabel
//    modalInput, modalInputMulti, modalDivider
//    modalListScroll, modalListRow, modalListLabel, modalListSub
//    modalActions, modalCancelBtn, modalCancelText
//    modalSaveBtn, modalSaveText
//    deleteBtn, deleteBtnText
//    colorPickerRow, colorSwatch, colorSwatchActive
//    card, cardHeader, cardIcon, cardTitle
//    safeArea, scroll, divider
//  Use globalStyles.xxx or spread { ...globalStyles.xxx }
// ─────────────────────────────────────────────
 
const styles = StyleSheet.create({
 
  // ── Screen base — from GlobalStyles ───────
  safeArea:      globalStyles.safeArea,
  scroll:        globalStyles.scroll,
  scrollContent: { paddingBottom: 40 },
  divider:       globalStyles.divider,
 
  // ── Cards — from GlobalStyles ─────────────
  cards:      { paddingTop: 20, paddingHorizontal: 16 },
  card:       globalStyles.card,
  cardHeader: globalStyles.cardHeader,
  cardIcon:   globalStyles.cardIcon,
  cardTitle:  globalStyles.cardTitle,
 
  // ── Hero ──────────────────────────────────
  hero: {
    alignItems: 'center',
    paddingTop: 52, paddingBottom: 28, paddingHorizontal: 24,
    backgroundColor: COLORS.screenBg, position: 'relative',
  },
  avatarWrap:    { position: 'relative', marginBottom: 14 },
  avatar: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 4, borderColor: COLORS.cardBg,
    backgroundColor: '#b8a9e8',
    alignItems: 'center', justifyContent: 'center',
    elevation: 6,
    shadowColor: '#7864c8', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22, shadowRadius: 12,
  },
  avatarInitial: { fontSize: 36, fontWeight: '700', color: COLORS.cardBg },
  badge: {
    position: 'absolute', bottom: 3, right: 3,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#4a90e2', borderWidth: 2.5, borderColor: COLORS.cardBg,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeTick:    { color: COLORS.cardBg, fontSize: 11, fontWeight: '700' },
  name:         { fontSize: 26, fontWeight: '700', color: COLORS.textDark, marginBottom: 4, letterSpacing: 0.2 },
  roleText:     { fontSize: 13, color: '#8a82aa', marginBottom: 10, letterSpacing: 0.3 },
  companyLine: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.cardBg, borderRadius: 999,
    paddingVertical: 6, paddingHorizontal: 14, marginBottom: 16,
    elevation: 2,
    shadowColor: COLORS.shadowPrimary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09, shadowRadius: 4,
  },
  companyLabel: { fontSize: 12.5, color: '#6b6380' },
  companyName:  { fontSize: 12.5, color: COLORS.primary, fontWeight: '700' },
  bio:          { fontSize: 13, color: '#7b748f', lineHeight: 22, textAlign: 'center', maxWidth: 380 },
 
  // ── Skills ────────────────────────────────
  skillTags: { flexDirection: 'row', flexWrap: 'wrap' },
  tag: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f5f3fc', borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12,
    marginBottom: 7, marginRight: 7,
  },
  dot:     { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  tagText: { fontSize: 12, fontWeight: '500', color: COLORS.primary },
 
  // ── Experience ────────────────────────────
  expItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f2f0fa',
  },
  expLogo:    { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  expInitial: { fontSize: 13, fontWeight: '700' },
  expInfo:    { flex: 1 },
  expRole:    { fontSize: 13, fontWeight: '600', color: COLORS.textDark, marginBottom: 2 },
  expCo:      { fontSize: 11.5, color: COLORS.textLight },
  expYr:      { fontSize: 11, color: COLORS.textFaint, fontWeight: '500', marginLeft: 6 },
  expActionBtn: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginLeft: 5,
  },
  expActionDelete: { backgroundColor: COLORS.dangerBg },
  expActionIcon:   { fontSize: 11 },
 
  // ── Achievements ──────────────────────────
  achItem: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f2f0fa' },
  achDot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.textFaint, marginTop: 5, marginRight: 10 },
  achText: { flex: 1, fontSize: 12.5, color: COLORS.textMid, lineHeight: 20 },
  achBold: { fontWeight: '700', color: COLORS.textDark },
  achSub:  { color: COLORS.textLight, fontWeight: '400' },
 
  // ── Modals — from GlobalStyles ────────────
  modalOverlay:    globalStyles.modalOverlay,
  modalBox:        globalStyles.modalBox,
  modalTitle:      globalStyles.modalTitle,
  modalLabel:      globalStyles.modalLabel,
  modalInput:      globalStyles.modalInput,
  modalInputMulti: globalStyles.modalInputMulti,
  modalDivider:    globalStyles.modalDivider,
  modalListScroll: globalStyles.modalListScroll,
  modalListRow:    globalStyles.modalListRow,
  modalListLabel:  globalStyles.modalListLabel,
  modalListSub:    globalStyles.modalListSub,
  modalActions:    globalStyles.modalActions,
  modalCancelBtn:  globalStyles.modalCancelBtn,
  modalCancelText: globalStyles.modalCancelText,
  modalSaveBtn:    globalStyles.modalSaveBtn,
  modalSaveText:   globalStyles.modalSaveText,
  deleteBtn:       globalStyles.deleteBtn,
  deleteBtnText:   globalStyles.deleteBtnText,
  colorPickerRow:    globalStyles.colorPickerRow,
  colorSwatch:       globalStyles.colorSwatch,
  colorSwatchActive: globalStyles.colorSwatchActive,
 
  // ── Experience colour swatches ────────────
  expColorRow:          { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6, marginBottom: 4, gap: 8 },
  expColorSwatch:       { width: 36, height: 36, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  expColorSwatchActive: { borderWidth: 3, transform: [{ scale: 1.15 }] },
});
 
export default HomeScreen;
