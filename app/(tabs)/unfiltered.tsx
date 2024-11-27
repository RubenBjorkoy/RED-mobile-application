import * as React from 'react';
import { StyleSheet, Image, Platform, View, ScrollView, RefreshControl, SafeAreaView } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { tabBarHeight, topBarPadding } from '@/constants/Measures';
import { ErrorProps } from '@/utils/types';
import ErrorCard from '@/components/cards/errorCard';
import FilterBar from '@/components/FilterBar';
import apiUrl from '@/utils/apiUrls';

interface Filter {
  system?: string;
  subsystem?: string;
  search?: string;
}

export default function UnfilteredScreen() {
  const [errors, setErrors] = React.useState<ErrorProps[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [filter, setFilter] = React.useState<Filter>({});

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
    try {
      const response = await fetch(`${apiUrl}/errors`);
      const data = await response.json();
      setErrors(data);
      setErrors([...errors, ...data]);
    } catch (error) {
      console.error(error);
    }
  }

  const handleFilterChange = (filter: Filter) => {
    console.log('Filter changed', filter);
    setFilter(filter);
  }

  return (
    <SafeAreaView>
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        style={styles.container}>
        <FilterBar onFilterChange={handleFilterChange} />
        <ThemedView>
          {
            errors.map((error, index) => {
              if(!error.title.toLowerCase().includes(filter.search?.toLowerCase() || '')) return null;
              if(filter.system && error.system !== filter.system) return null;
              if(filter.subsystem && error.subsystem !== filter.subsystem) return null;
              return <ErrorCard key={index} {...error} />
            })
          }
        </ThemedView>
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
