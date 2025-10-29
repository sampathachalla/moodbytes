import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { deleteSearchHistoryItem, getUserSearchHistory, getUserSearchHistoryCount, SearchHistoryItem } from '../../services/searchHistory';
import { decreaseUserSearchCount } from '../../services/userService';

interface HistoryPageProps {
  onNavigateToView?: (searchResults: any, mood: string) => void;
  onProfileRefresh?: () => void;
}

export default function HistoryPage({ onNavigateToView, onProfileRefresh }: HistoryPageProps) {
  const [historyData, setHistoryData] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Mood to image mapping
  const moodToImageMap: { [key: string]: any } = {
    'Happy & Social': require('../../assets/images/section-1.png'),
    'Romantic': require('../../assets/images/section-2.png'),
    'Relaxed & Chill': require('../../assets/images/section-3.png'),
    'Adventurous / Curious': require('../../assets/images/section-4.png'),
    'Comfort & Cozy': require('../../assets/images/section-5.png'),
    'Energetic / Party': require('../../assets/images/section-6.png'),
    'Mindful / Nature-Lover': require('../../assets/images/section-7.png'),
    'Healthy & Fresh': require('../../assets/images/section-8.png'),
  };

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    try {
      setLoading(true);
      const [history, count] = await Promise.all([
        getUserSearchHistory(20),
        getUserSearchHistoryCount()
      ]);
      setHistoryData(history);
      setTotalCount(count);
      console.log('Loaded search history for current user:', history.length, 'items, total count:', count);
    } catch (error) {
      console.error('Error loading search history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleDeleteItem = async (searchId: string) => {
    try {
      console.log('Deleting search history item:', searchId);
      const success = await deleteSearchHistoryItem(searchId);
      
      if (success) {
        // Decrease user's search count
        await decreaseUserSearchCount();
        
        // Reload the history after successful deletion
        await loadSearchHistory();
        
        // Trigger profile refresh to update search count
        if (onProfileRefresh) {
          console.log('HistoryPage: Triggering profile refresh');
          onProfileRefresh();
        } else {
          console.log('HistoryPage: No profile refresh callback provided');
        }
        
        console.log('Search history item deleted successfully and search count decreased');
      } else {
        console.log('Failed to delete search history item');
      }
    } catch (error) {
      console.error('Error deleting search history item:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Mood History</Text>
          <Text style={styles.headerSubtitle}>
            {totalCount > 0 ? `${totalCount} total searches` : 'Track your mood-based discoveries'}
          </Text>
        </View>

        {/* Loading State */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D7263D" />
            <Text style={styles.loadingText}>Loading your search history...</Text>
          </View>
        ) : (
          <>
            {/* History List */}
            <View style={styles.historyList}>
              {historyData.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.historyItem}
                  onPress={() => {
                    console.log('History item clicked:', item.mood);
                    console.log('Search results:', item.searchResults);
                    if (onNavigateToView) {
                      onNavigateToView(item.searchResults, item.mood);
                    }
                  }}
                >
                  <View style={styles.historyContent}>
                    <Image 
                      source={moodToImageMap[item.mood] || require('../../assets/images/default.png')} 
                      style={styles.historyImage} 
                    />
                    <View style={styles.historyDetails}>
                      <Text style={styles.moodText}>{item.mood}</Text>
                      <Text style={styles.locationText}>
                        Found {item.searchResults.totalCount} places
                      </Text>
                      <Text style={styles.dateText}>
                        {formatDate(item.timestamp)} at {formatTime(item.timestamp)}
                      </Text>
                      <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                          <FontAwesome name="map-marker" size={12} color="#7A7A7A" />
                          <Text style={styles.statText}>
                            {item.location.latitude.toFixed(2)}, {item.location.longitude.toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => handleDeleteItem(item.id!)}
                    >
                      <FontAwesome name="trash" size={16} color="#D7263D" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Empty State (if no history) */}
            {historyData.length === 0 && (
              <View style={styles.emptyState}>
                <FontAwesome name="history" size={48} color="#C0C0C0" />
                <Text style={styles.emptyTitle}>No Search History Yet</Text>
                <Text style={styles.emptySubtitle}>
                  Start exploring moods to build your search history
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7A7A7A',
  },
  historyList: {
    padding: 20,
  },
  historyItem: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  historyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  historyDetails: {
    flex: 1,
  },
  moodText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#D7263D',
    fontWeight: '500',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: '#7A7A7A',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#7A7A7A',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#7A7A7A',
    marginTop: 16,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: '#7A7A7A',
    marginLeft: 4,
  },
  deleteButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
