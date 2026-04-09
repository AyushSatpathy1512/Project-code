/**
 * TechTag — Global Reusable Component
 *
 * Coloured technology pill used inside ProjectCardItem and the
 * project edit modal. Defined ONCE — imported wherever needed.
 *
 * Props:
 *   label — string  the technology name e.g. 'React Native'
 *   bg    — string  hex background colour e.g. '#ddeaf8'
 *   color — string  hex text/border colour e.g. '#2a5f9e'
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TechTag = ({ label, bg, color }) => (
  <View style={[styles.techTag, { backgroundColor: bg, borderColor: color + '55' }]}>
    <Text style={[styles.techTagText, { color }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  techTag: {
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginRight: 6,
    marginBottom: 6,
  },
  techTagText: {
    fontSize: 10.5,
    fontWeight: '600',
  },
});

export default TechTag;
