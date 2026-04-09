/**
 * SideNavBar — Global Reusable Component
 *
 * Animated slide-in navigation drawer used by HomeScreen and ProjectDetails.
 * Defined ONCE here — imported wherever needed.
 *
 * Props:
 *   navigation   — React Navigation prop (navigate / replace)
 *   activeScreen — 'Home' | 'Project'  used to highlight the active item
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
} from 'react-native';

const NAV_WIDTH = 200;
const TAB_WIDTH = 28;

const NAV_ITEMS = [
  { label: 'Home',     icon: '🏠', screen: 'Home'    },
  { label: 'Projects', icon: '📁', screen: 'Project' },
];

const SideNavBar = ({ navigation, activeScreen = 'Home' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    Animated.spring(anim, {
      toValue: isOpen ? 0 : 1,
      useNativeDriver: true, friction: 8, tension: 60,
    }).start();
    setIsOpen(prev => !prev);
  };

  const close = () => {
    if (!isOpen) return;
    Animated.spring(anim, {
      toValue: 0, useNativeDriver: true, friction: 8, tension: 60,
    }).start();
    setIsOpen(false);
  };

  const translateX      = anim.interpolate({ inputRange: [0, 1], outputRange: [NAV_WIDTH - TAB_WIDTH, 0] });
  const backdropOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.3] });

  return (
    <>
      {/* ── Dark backdrop — tapping it closes the drawer ── */}
      <Animated.View
        pointerEvents={isOpen ? 'auto' : 'none'}
        style={[styles.navBackdrop, { opacity: backdropOpacity }]}
      >
        <TouchableWithoutFeedback onPress={close}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
      </Animated.View>

      {/* ── Drawer panel ── */}
      <Animated.View style={[styles.navDrawer, { transform: [{ translateX }] }]}>

        {/* Trigger tab — 3 dots when closed, › when open */}
        <TouchableOpacity style={styles.navTab} onPress={toggle} activeOpacity={0.8}>
          {isOpen
            ? <Text style={styles.navTabArrow}>›</Text>
            : <View style={styles.dotsWrap}>
                <View style={styles.dotLine} />
                <View style={styles.dotLine} />
                <View style={styles.dotLine} />
              </View>
          }
        </TouchableOpacity>

        {/* Menu content */}
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

          {/* Spacer pushes Logout to bottom */}
          <View style={{ flex: 1 }} />

          {/* ── Logout ── */}
          <View style={styles.navLogoutDivider} />
          <TouchableOpacity
            style={styles.navLogoutBtn}
            activeOpacity={0.75}
            onPress={() => {
              close();
              if (navigation) navigation.replace('Login');
            }}
          >
            <Text style={styles.navLogoutIcon}>🚪</Text>
            <Text style={styles.navLogoutLabel}>Logout</Text>
          </TouchableOpacity>
        </View>

      </Animated.View>
    </>
  );
};

// ─────────────────────────────────────────────
//  Styles — scoped to this component only
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  navBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1a0a40',
    zIndex: 10,
  },
  navDrawer: {
    position: 'absolute', top: 0, right: 0, bottom: 0,
    width: NAV_WIDTH, flexDirection: 'row', zIndex: 20,
  },
  navTab: {
    width: TAB_WIDTH, alignSelf: 'center', height: 72,
    backgroundColor: '#4a3fa0',
    borderTopLeftRadius: 12, borderBottomLeftRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    elevation: 8,
    shadowColor: '#2d2150', shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.2, shadowRadius: 6,
  },
  dotsWrap:    { alignItems: 'center', gap: 4 },
  dotLine:     { width: 12, height: 2.5, backgroundColor: '#fff', borderRadius: 2 },
  navTabArrow: { fontSize: 24, color: '#fff', fontWeight: '700' },
  navContent: {
    flex: 1, backgroundColor: '#fff',
    paddingTop: 60, paddingHorizontal: 18,
    elevation: 12,
    shadowColor: '#2d2150', shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.12, shadowRadius: 12,
  },
  navHeading:         { fontSize: 10, fontWeight: '700', color: '#b4aed0', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 },
  navItem:            { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 12, borderRadius: 14, marginBottom: 6, position: 'relative' },
  navItemActive:      { backgroundColor: '#f0eeff' },
  navItemIcon:        { fontSize: 18, marginRight: 12 },
  navItemLabel:       { fontSize: 14, fontWeight: '500', color: '#4e4670' },
  navItemLabelActive: { color: '#4a3fa0', fontWeight: '700' },
  navActivePip:       { position: 'absolute', right: 10, width: 6, height: 6, borderRadius: 3, backgroundColor: '#4a3fa0' },
  navLogoutDivider:   { height: 1, backgroundColor: '#f0eeff', marginBottom: 10 },
  navLogoutBtn:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 12, borderRadius: 14, marginBottom: 12, backgroundColor: '#fff0f0' },
  navLogoutIcon:      { fontSize: 18, marginRight: 12 },
  navLogoutLabel:     { fontSize: 14, fontWeight: '600', color: '#e05c5c' },
});

export default SideNavBar;
