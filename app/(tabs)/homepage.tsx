import React, { useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import HistoryPage from '../../components/history';
import HomepageBody from '../../components/homepage/defaultpage/defaultpage';
import HomepageFooter from '../../components/homepage/homepageFooter/homepageFooter';
import HomepageHeader from '../../components/homepage/homepageHeader/homepageHeader';
import ProfilePage from '../../components/profilepage';
import ViewPage from '../../components/viewpage';

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState('home');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchMood, setSearchMood] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [profileRefreshTrigger, setProfileRefreshTrigger] = useState(0);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'history':
        return <HistoryPage onNavigateToView={handleSearchResults} onProfileRefresh={refreshProfileData} />;
      case 'view':
        return <ViewPage searchResults={searchResults} searchMood={searchMood} />;
      case 'profile':
        return <ProfilePage refreshTrigger={profileRefreshTrigger} />;
      default:
        return <HomepageBody onSearchResults={handleSearchResults} onSearchStart={handleSearchStart} />;
    }
  };

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    // Always refresh profile data when navigating to profile page
    if (page === 'profile') {
      setProfileRefreshTrigger(prev => prev + 1);
    }
  };

  // Add a function to refresh profile data from other components
  const refreshProfileData = () => {
    console.log('Homepage: Refreshing profile data');
    setProfileRefreshTrigger(prev => prev + 1);
  };

  const handleSearchResults = (results: any, mood: string) => {
    console.log('Search results received:', results);
    setSearchResults(results);
    setSearchMood(mood);
    setIsSearching(false); // Stop searching animation
    setCurrentPage('view'); // Navigate to view page
  };

  const handleSearchStart = () => {
    setIsSearching(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <HomepageHeader />
        {isSearching ? (
          <View style={styles.searchingContainer}>
            <ActivityIndicator size="large" color="#D7263D" />
            <Text style={styles.searchingText}>Finding perfect places for you...</Text>
            <Text style={styles.searchingSubtext}>This may take a moment</Text>
          </View>
        ) : (
          renderCurrentPage()
        )}
        <HomepageFooter onNavigate={handleNavigation} currentPage={currentPage} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  searchingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 40,
  },
  searchingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 20,
    textAlign: 'center',
  },
  searchingSubtext: {
    fontSize: 14,
    color: '#7A7A7A',
    marginTop: 8,
    textAlign: 'center',
  },
});
