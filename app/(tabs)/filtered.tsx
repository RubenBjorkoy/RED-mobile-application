import * as React from 'react';
import { StyleSheet, Image, Platform, View, ScrollView, RefreshControl, SafeAreaView, TouchableOpacity } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { tabBarHeight, topBarPadding } from '@/constants/Measures';
import { ErrorProps, Filter } from '@/utils/types';
import ErrorCard from '@/components/cards/errorCard';
import FilterBar from '@/components/FilterBar';
import apiUrl from '@/utils/apiUrls';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next from 'i18next';

export default function UnfilteredScreen() {
  const [errors, setErrors] = React.useState<ErrorProps[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [filter, setFilter] = React.useState<Filter>({});
  const router = useRouter();

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchErrors();
  }, []);

  React.useEffect(() => {
    fetchErrors();
  }, []);

  React.useEffect(() => {
    setRefreshing(false);
  }, [errors]);

  const fetchErrors = async () => {
    const user = await AsyncStorage.getItem('userToken');
    try {
      const response = await fetch(`${apiUrl}/errors/?user=${user}`);
      const data = await response.json();
      setErrors(data);
      setErrors([...errors, ...data]);
    } catch (error) {
      console.error(error);
    }
  }

  const handleFilterChange = (filter: Filter) => {
    setFilter(filter);
  }

  const handleRedirect = (errorId: string) => {
    router.push(`/errors/${errorId}` as const);
  }

  return (
    <SafeAreaView>
      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        style={styles.container}>
        <View>
          <ThemedText type="title">{i18next.t('personalErrors')}</ThemedText>
        </View>
        <FilterBar onFilterChange={handleFilterChange} expanded={false} />
        <View>
          {
            errors.length === 0 &&
            <ThemedText style={{textAlign: 'center', marginTop: 16}}>{i18next.t('youhavenoerrors')}</ThemedText>
          }
          {
            errors.map((error, index) => {
              if(!error.title.toLowerCase().includes(filter.search?.toLowerCase() || '')) return null;
              if(filter.system && error.system.toLowerCase() !== filter.system.toLowerCase()) return null;
              if(filter.subsystem && error.subsystem.toLowerCase() !== filter.subsystem.toLowerCase()) return null;
              return (
                <TouchableOpacity key={index} onPress={() => {handleRedirect(error.id!)}}>
                  <ErrorCard key={index} {...error} />
                </TouchableOpacity>
              )
            })
          }
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: tabBarHeight,
    paddingTop: topBarPadding,
    height: '100%',
    flexGrow: 1,
    backgroundColor: '#171717',
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: tabBarHeight * 2,
  },
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  }
});
