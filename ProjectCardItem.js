/**
 * ProjectCardItem — Global Reusable Component
 *
 * Expandable project card with tech tags, description, key highlights,
 * and ✏️ edit + 🗑️ delete action buttons.
 * Defined ONCE — imported into ProjectDetails screen.
 *
 * Props:
 *   project  — object  { name, subtitle, initial, logoBg, logoColor,
 *                        tech[], description, bullets[] }
 *   category — object  { borderColor, tagBg, tagText }
 *   onEdit   — function  called when ✏️ is tapped
 *   onDelete — function  called when 🗑️ is tapped
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import TechTag from './TechTag';
import Bullet  from './Bullet';

const ProjectCardItem = ({ project, category, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    Animated.spring(anim, {
      toValue: expanded ? 0 : 1,
      useNativeDriver: false, friction: 8, tension: 60,
    }).start();
    setExpanded(e => !e);
  };

  const arrowRotate = anim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={[styles.projectCard, { borderLeftColor: category.borderColor }]}>

      {/* ── Card Header ── */}
      <View style={styles.projectHeader}>

        {/* Logo initial */}
        <View style={[styles.projectLogo, { backgroundColor: project.logoBg }]}>
          <Text style={[styles.projectLogoText, { color: project.logoColor }]}>
            {project.initial}
          </Text>
        </View>

        {/* Title + subtitle */}
        <View style={styles.projectTitleWrap}>
          <Text style={styles.projectName}>{project.name}</Text>
          <Text style={styles.projectSubtitle}>{project.subtitle}</Text>
        </View>

        {/* ✏️ Edit */}
        <TouchableOpacity onPress={onEdit} style={styles.iconActionBtn} activeOpacity={0.7}>
          <Text style={styles.iconActionText}>✏️</Text>
        </TouchableOpacity>

        {/* 🗑️ Delete */}
        <TouchableOpacity
          onPress={onDelete}
          style={[styles.iconActionBtn, styles.iconActionDelete]}
          activeOpacity={0.7}
        >
          <Text style={styles.iconActionText}>🗑️</Text>
        </TouchableOpacity>

        {/* ▾ Expand arrow */}
        <TouchableOpacity onPress={toggleExpand} style={styles.expandBtn} activeOpacity={0.7}>
          <Animated.Text style={[styles.expandArrow, { transform: [{ rotate: arrowRotate }] }]}>
            ▾
          </Animated.Text>
        </TouchableOpacity>
      </View>

      {/* ── Tech Tags — uses global TechTag ── */}
      <View style={styles.techTagsRow}>
        {project.tech.map((t, i) => (
          <TechTag
            key={i}
            label={t}
            bg={category.tagBg}
            color={category.tagText}
          />
        ))}
      </View>

      {/* ── Description ── */}
      <Text style={styles.projectDesc}>{project.description}</Text>

      {/* ── Expandable Key Highlights — uses global Bullet ── */}
      {expanded && project.bullets.length > 0 && (
        <View style={styles.bulletsWrap}>
          <View style={styles.bulletsDivider} />
          <Text style={styles.bulletsHeading}>Key Highlights</Text>
          {project.bullets.map((b, i) => (
            <Bullet key={i} text={b} />
          ))}
        </View>
      )}

      {/* ── Show / hide toggle label ── */}
      <TouchableOpacity
        onPress={toggleExpand}
        activeOpacity={0.7}
        style={styles.expandLabelBtn}
      >
        <Text style={[styles.expandLabel, { color: category.borderColor }]}>
          {expanded ? 'Show less ▲' : 'Show highlights ▼'}
        </Text>
      </TouchableOpacity>

    </View>
  );
};

// ─────────────────────────────────────────────
//  Styles — scoped to this component only
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  projectCard: {
    backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 12,
    borderLeftWidth: 4, elevation: 3,
    shadowColor: '#6450b4', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8,
  },
  projectHeader:    { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  projectLogo:      { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  projectLogoText:  { fontSize: 12, fontWeight: '700' },
  projectTitleWrap: { flex: 1 },
  projectName:      { fontSize: 14, fontWeight: '700', color: '#2d2150', marginBottom: 2 },
  projectSubtitle:  { fontSize: 11.5, color: '#9b94b8' },
  iconActionBtn:    { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f0eeff', alignItems: 'center', justifyContent: 'center', marginLeft: 6 },
  iconActionDelete: { backgroundColor: '#fce8e8' },
  iconActionText:   { fontSize: 12 },
  expandBtn:        { padding: 4, marginLeft: 4 },
  expandArrow:      { fontSize: 18, color: '#b4aed0' },
  techTagsRow:      { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  projectDesc:      { fontSize: 12.5, color: '#5a5375', lineHeight: 19, marginBottom: 8 },
  bulletsWrap:      { marginTop: 4 },
  bulletsDivider:   { height: 1, backgroundColor: '#f0eeff', marginBottom: 10 },
  bulletsHeading:   { fontSize: 10, fontWeight: '700', color: '#b4aed0', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  expandLabelBtn:   { marginTop: 6, alignSelf: 'flex-start' },
  expandLabel:      { fontSize: 11.5, fontWeight: '600' },
});

export default ProjectCardItem;
