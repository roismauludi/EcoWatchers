import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const Actions = () => {
  return (
    <View style={styles.actions}>
      <TouchableOpacity style={styles.actionButton}>
        <Text>Katalog</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton}>
        <Text>Drop Point</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton}>
        <Text>Pick Up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
});

export default Actions;
