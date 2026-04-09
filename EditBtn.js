/**
 * EditBtn — Global Reusable Component
 *
 * Pencil (✏️) icon button used in card headers and hero section
 * across HomeScreen. Defined ONCE — imported wherever needed.
 *
 * Props:
 *   onPress — function called when the button is tapped
 */
 
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
 
const EditBtn = ({ onPress }) => (
  <TouchableOpacity style={styles.editBtn} onPress={onPress} activeOpacity={0.7}>
    <Text style={styles.editBtnIcon}>✏️</Text>
  </TouchableOpacity>
);
 
const styles = StyleSheet.create({
  editBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#f0eeff',
    alignItems: 'center', justifyContent: 'center',
    elevation: 2,
    shadowColor: '#6450b4', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10, shadowRadius: 3,
  },
  editBtnIcon: { fontSize: 13 },
});
 
export default EditBtn;
