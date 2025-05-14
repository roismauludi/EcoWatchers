import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const XPProgress = () => {
  return (
    <View style={styles.xpProgress}>
      <Text>80 XP lagi menjadi penyelamat negara</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  xpProgress: {
    backgroundColor: '#fff8dc',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
});

export default XPProgress;
