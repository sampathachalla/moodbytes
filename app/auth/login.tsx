import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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
import { signInWithEmail, signInWithGoogle } from '../../services/auth';

// ✅ Smooth continuous typewriter effect
type TypewriterTextProps = {
  text: string;
  speed?: number;
  style?: any;
};

function TypewriterText({ text, speed = 100, style }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const loop = () => {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayedText(text.slice(0, i));
        i++;
        if (i > text.length) {
          i = 0;
        }
      }, speed);
      return interval;
    };

    const interval = loop();
    return () => clearInterval(interval);
  }, [text, speed]);

  return <Text style={style}>{displayedText}</Text>;
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      setEmail('');
      setPassword('');
      setLoading(false);
    }, [])
  );

  // Firebase Email/Password Login
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    const { user, error } = await signInWithEmail(email, password);
    
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
      Alert.alert('Login Failed', error || 'An error occurred during login');
    }
    setLoading(false);
  };

  // Firebase Google Login
  const handleGoogleLogin = async () => {
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
      Alert.alert('Google Login Failed', error || 'An error occurred during Google login');
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
            {/* Branding */}
            <Text style={{ fontSize: 40, fontWeight: '800', color: '#D7263D', marginBottom: 4 }}>
              MoodBytes
            </Text>

            {/* Typewriter Slogan */}
            <View style={{ height: 24, marginBottom: 20 }}>
              <TypewriterText
                text="Feel it. Find it. Bite it."
                speed={120}
                style={{
                  fontSize: 14,
                  color: '#7A7A7A',
                }}
              />
            </View>

            {/* Login Form */}
            <View style={{ width: '100%', padding: 24, borderRadius: 20 }}>
              <TextInput
                placeholder="Email or username"
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
                onChangeText={setEmail}
                autoCapitalize="none"
              />
              <TextInput
                placeholder="Password"
                style={{
                  borderBottomWidth: 1,
                  borderColor: '#DADADA',
                  marginBottom: 8,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: '#1A1A1A',
                }}
                placeholderTextColor="#7A7A7A"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              {/* 🔐 Forgot Password Link */}
              <View style={{ alignItems: 'flex-end', marginBottom: 20 }}>
                <TouchableOpacity onPress={() => { /* TODO: Link to forgot password screen */ }}>
                  <Text style={{ fontSize: 13, color: '#D7263D', fontWeight: '500' }}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={{
                  backgroundColor: loading ? '#B0B0B0' : '#D7263D',
                  padding: 14,
                  borderRadius: 14,
                  opacity: loading ? 0.7 : 1,
                }}
                onPress={handleLogin}
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
                  {loading ? 'Signing In...' : 'Log In'}
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
              onPress={handleGoogleLogin}
              disabled={loading}
            >
              <FontAwesome name="google" size={20} color="#D7263D" />
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#2E2E2E' }}>
                Sign in with Google
              </Text>
            </TouchableOpacity>

            {/* Footer */}
            <Text style={{ fontSize: 14, color: '#1A1A1A' }}>
              Don’t have an account?{' '}
              <Link href="/auth/signup" style={{ color: '#FF6F00', fontWeight: '600' }}>
                Sign up
              </Link>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}