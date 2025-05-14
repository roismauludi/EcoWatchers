import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const BlogSection = () => {
  return (
    <View style={styles.blogSection}>
      <Text>Artikel Terbaru</Text>
      <View style={styles.blogItem}>
        <Image style={styles.blogImage} source={{ uri: 'https://via.placeholder.com/150' }} />
        <View style={styles.blogTextContainer}>
          <Text style={styles.blogCategory}>Blog & Artikel</Text>
          <Text style={styles.blogTitle}>EcoGreen: Solusi Tukar Sampah Jadi Berkah</Text>
          <Text style={styles.blogDate}>25 Juli 2022</Text>
        </View>
      </View>

      <View style={styles.blogItem}>
        <Image style={styles.blogImage} source={{ uri: 'https://via.placeholder.com/150' }} />
        <View style={styles.blogTextContainer}>
          <Text style={styles.blogCategory}>Blog & Artikel</Text>
          <Text style={styles.blogTitle}>Raih Kekayaan Hanya Dengan Tutup Botol</Text>
          <Text style={styles.blogDate}>27 Juli 2022</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  blogSection: {
    paddingHorizontal: 20,
  },
  blogItem: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  blogImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  blogTextContainer: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  blogCategory: {
    fontSize: 12,
    color: '#4CAF50',
  },
  blogTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  blogDate: {
    fontSize: 12,
    color: '#999',
  },
});

export default BlogSection;
