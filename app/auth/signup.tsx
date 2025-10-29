import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Alert, KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { signInWithGoogle, signUpWithEmail } from '../../services/auth';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setLoading(false);
    }, [])
  );

  // Firebase Email/Password Signup
  const handleSignup = async () => {
    console.log('Signup attempt started');
    console.log('Email:', email);
    console.log('Password length:', password?.length);
    
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    console.log('Calling signUpWithEmail...');
    
    try {
      const { user, error } = await signUpWithEmail(email, password);
      console.log('Signup result:', { user: user?.uid, error });
      
      if (user) {
        console.log('User created successfully:', user.uid);
        // Store user info in AsyncStorage
        const userInfo = { 
          id: user.uid, 
          email: user.email,
          displayName: user.displayName
        };
        await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
        Alert.alert('Success', 'Account created successfully!', [
          { text: 'OK', onPress: () => router.replace('/(tabs)/homepage') }
        ]);
      } else {
        console.log('Signup failed:', error);
        Alert.alert('Signup Failed', error || 'An error occurred during signup');
      }
    } catch (err) {
      console.log('Signup error caught:', err);
      Alert.alert('Signup Failed', 'An unexpected error occurred');
    }
    
    setLoading(false);
  };

  // Firebase Google Signup
  const handleGoogleSignup = async () => {
    setLoading(true);
    const { user, error } = await signInWithGoogle();
    
    if (user) {
      // Store user info in AsyncStorage
      const userInfo = { 
        id: user.uid, 
        email: user.email,
        displayName: user.displayName
      };
      await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
      router.replace('/(tabs)/homepage');
    } else {
      Alert.alert('Google Signup Failed', error || 'An error occurred during Google signup');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#FAFAFA' }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center items-center px-6 py-12">
            {/* Heading */}
            <Text style={{ fontSize: 36, fontWeight: '800', color: '#D7263D', marginBottom: 4 }}>
              Create Account
            </Text>
            <Text style={{ fontSize: 14, color: '#7A7A7A', marginBottom: 24 }}>
              Feel it. Find it. Bite it.
            </Text>

            {/* Signup Form */}
            <View style={{ width: '100%', padding: 24, borderRadius: 20 }}>

              {/* Email */}
              <TextInput
                placeholder="Email"
                style={{
                  borderBottomWidth: 1,
                  borderColor: '#DADADA',
                  marginBottom: 20,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: '#1A1A1A',
                }}
                placeholderTextColor="#7A7A7A"
                value={email}
                onChangeText={(text) => {
                  console.log('Email changed:', text);
                  setEmail(text);
                }}
                autoCapitalize="none"
              />
              {/* Password */}
              <TextInput
                placeholder="Password"
                style={{
                  borderBottomWidth: 1,
                  borderColor: '#DADADA',
                  marginBottom: 20,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: '#1A1A1A',
                }}
                placeholderTextColor="#7A7A7A"
                value={password}
                onChangeText={(text) => {
                  console.log('Password changed, length:', text.length);
                  setPassword(text);
                }}
                secureTextEntry
              />
              {/* Confirm Password */}
              <TextInput
                placeholder="Confirm Password"
                style={{
                  borderBottomWidth: 1,
                  borderColor: '#DADADA',
                  marginBottom: 28,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: '#1A1A1A',
                }}
                placeholderTextColor="#7A7A7A"
                value={confirmPassword}
                onChangeText={(text) => {
                  console.log('Confirm password changed, length:', text.length);
                  setConfirmPassword(text);
                }}
                secureTextEntry
              />

              {/* Submit Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: loading ? '#B0B0B0' : '#D7263D',
                  padding: 14,
                  borderRadius: 14,
                  opacity: loading ? 0.7 : 1,
                }}
                onPress={handleSignup}
                disabled={loading}
              >
                <Text
                  style={{
                    color: '#FFFFFF',
                    textAlign: 'center',
                    fontWeight: '700',
                    fontSize: 16,
                  }}
                >
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <Text style={{ color: '#7A7A7A', marginVertical: 24 }}>or continue with</Text>

            {/* Google Button */}
            <TouchableOpacity
              style={{
                backgroundColor: '#FFFFFF',
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 50,
                borderColor: '#DADADA',
                borderWidth: 1,
                marginBottom: 24,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                opacity: loading ? 0.7 : 1,
              }}
              onPress={handleGoogleSignup}
              disabled={loading}
            >
              <FontAwesome name="google" size={20} color="#D7263D" />
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#2E2E2E' }}>
                Sign up with Google
              </Text>
            </TouchableOpacity>

            {/* Footer */}
            <Text style={{ fontSize: 14, color: '#1A1A1A', marginTop: 24 }}>
              Already have an account?{' '}
              <Link href="/auth/login" style={{ color: '#D7263D', fontWeight: '600' }}>
                Log in
              </Link>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}