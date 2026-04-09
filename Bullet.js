/**
 * Bullet — Global Reusable Component
 *
 * A single bullet-point row used inside the Key Highlights section
 * of ProjectCardItem. Defined ONCE — imported wherever needed.
 *
 * Props:
 *   text — string  the highlight text to display
 */
 
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
 
const Bullet = ({ text }) => (
  <View style={styles.bulletRow}>
    <View style={styles.bulletDot} />
    <Text style={styles.bulletText}>{text}</Text>
  </View>
);
 
const styles = StyleSheet.create({
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bulletDot: {
    width: 5, height: 5, borderRadius: 3,
    backgroundColor: '#c4bde0',
    marginTop: 6, marginRight: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 12,
    color: '#4e4670',
    lineHeight: 18,
  },
});
 
export default Bullet;
