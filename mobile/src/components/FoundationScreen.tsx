import { Image, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { foundationStyles as styles } from './FoundationScreen.styles';

interface FoundationScreenProps {
  eyebrow: string;
  title: string;
  description: string;
  status: string;
}

export function FoundationScreen({
  eyebrow,
  title,
  description,
  status,
}: FoundationScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.card}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logo}
            accessibilityLabel="Logo de CorAM"
          />
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{description}</Text>
          <View style={styles.status} accessibilityRole="summary">
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
