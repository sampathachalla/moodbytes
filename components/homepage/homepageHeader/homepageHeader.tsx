import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function HomepageHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.headerContent}>
        <Image 
          source={require('../../../assets/images/icon.png')} 
          style={styles.icon}
          resizeMode="contain"
        />
        <View style={styles.titleContainer}>
          <Text style={styles.title}>MoodBytes</Text>
        </View>
        <View style={styles.spacer} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '10%',
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icon: {
    width: 64,
    height: 64,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D7263D',
  },
  spacer: {
    width: 64,
  },
});
